import { Requirement, DocumentStatus, DocumentRowState, UploadedPdf } from '../types';

/**
 * Computes status for a requirement according to Section 5:
 * - Missing: Required document, no file matched. (Blocking: Yes)
 * - Expiry date needed: has_expiry = true and a file is matched, but no expiry date entered. (Blocking: Yes)
 * - Expired: The expiry date is before the submission deadline. (Blocking: Yes)
 * - Not provided: Optional document, no file matched. (Blocking: No)
 * - OK: File matched, and (if has_expiry) the expiry date is on or after the submission deadline. (Blocking: No)
 */
export function computeDocumentStatus(
  requirement: Requirement,
  matchedFileId: string | null,
  expiryDate: string,
  submissionDeadline: string
): { status: DocumentStatus; isBlocking: boolean; explanation: string } {
  // Case 1: No file matched
  if (!matchedFileId) {
    if (requirement.mandatory) {
      return {
        status: 'Missing',
        isBlocking: true,
        explanation: 'Mandatory document must have a file matched.',
      };
    } else {
      return {
        status: 'Not provided',
        isBlocking: false,
        explanation: 'Optional document not provided (allowed).',
      };
    }
  }

  // Case 2: File matched, document requires expiry check
  if (requirement.has_expiry) {
    if (!expiryDate || expiryDate.trim() === '') {
      return {
        status: 'Expiry date needed',
        isBlocking: true,
        explanation: 'Please enter the expiry date shown on this document.',
      };
    }

    // Compare date with submission deadline (YYYY-MM-DD string comparison is ISO standard)
    // "If a document expires on the same day as the submission deadline, it is still OK."
    if (expiryDate < submissionDeadline) {
      return {
        status: 'Expired',
        isBlocking: true,
        explanation: `Expired on ${expiryDate}. Must be valid on or after deadline ${submissionDeadline}.`,
      };
    }
  }

  // Case 3: File matched, and (if has_expiry) valid date
  return {
    status: 'OK',
    isBlocking: false,
    explanation: 'Document verified and compliant.',
  };
}

/**
 * Suggests best matching file for each requirement based on filename similarity.
 * Matches keywords like 'trade_license', 'tin', 'vat', 'bank_solvency', 'experience', etc.
 */
export function autoMatchFiles(
  requirements: Requirement[],
  uploadedFiles: UploadedPdf[]
): Record<string, string> {
  const matches: Record<string, string> = {};
  const usedFileIds = new Set<string>();

  // Filter out duplicate files to prevent matching invalid duplicates
  const candidateFiles = uploadedFiles.filter((f) => !f.error);

  const clean = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();

  for (const req of requirements) {
    const reqWords = clean(req.title_en).split(/\s+/).filter((w) => w.length > 2);
    let bestFileId: string | null = null;
    let maxScore = 0;

    for (const file of candidateFiles) {
      if (usedFileIds.has(file.id)) continue;

      const fileName = clean(file.name);
      let score = 0;

      for (const word of reqWords) {
        if (fileName.includes(word)) {
          score += 2;
        }
      }

      // Check specific mappings
      if (req.id === 'R01' && (fileName.includes('trade') || fileName.includes('license'))) score += 5;
      if (req.id === 'R02' && fileName.includes('tin')) score += 5;
      if (req.id === 'R03' && fileName.includes('vat')) score += 5;
      if (req.id === 'R04' && (fileName.includes('bank') || fileName.includes('solvency'))) score += 5;
      if (req.id === 'R05' && (fileName.includes('experience') || fileName.includes('cert'))) score += 5;
      if (req.id === 'R06' && (fileName.includes('financial') && fileName.includes('statement') || fileName.includes('audit'))) score += 5;
      if (req.id === 'R07' && (fileName.includes('authorization') || fileName.includes('manufacturer'))) score += 5;
      if (req.id === 'R08' && (fileName.includes('technical') || fileName.includes('proposal'))) score += 5;
      if (req.id === 'R09' && (fileName.includes('financial') && fileName.includes('proposal'))) score += 5;
      if (req.id === 'R10' && (fileName.includes('declaration') || fileName.includes('scan') || fileName.includes('signed'))) score += 5;

      if (score > maxScore && score >= 2) {
        maxScore = score;
        bestFileId = file.id;
      }
    }

    if (bestFileId) {
      matches[req.id] = bestFileId;
      usedFileIds.add(bestFileId);
    }
  }

  return matches;
}

/**
 * Exports current checklist to CSV format.
 */
export function exportChecklistCsv(
  tenderId: string,
  rows: DocumentRowState[],
  filesMap: Map<string, UploadedPdf>
): void {
  const headers = ['Order', 'Requirement ID', 'Document Title', 'Mandatory', 'Matched File', 'Pages', 'Expiry Date', 'Status'];
  const csvRows = [headers.join(',')];

  for (const row of rows) {
    const file = row.matchedFileId ? filesMap.get(row.matchedFileId) : null;
    const line = [
      row.requirement.order,
      `"${row.requirement.id}"`,
      `"${row.requirement.title_en}"`,
      row.requirement.mandatory ? 'Yes' : 'No',
      `"${file ? file.name : 'N/A'}"`,
      file ? file.pageCount : 0,
      `"${row.expiryDate || 'N/A'}"`,
      `"${row.status}"`,
    ];
    csvRows.push(line.join(','));
  }

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `${tenderId}_Checklist.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
