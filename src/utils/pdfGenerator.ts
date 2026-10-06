import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { TenderInfo, DocumentRowState, SealConfig } from '../types';

/**
 * Renders text (especially non-ASCII like Bengali) into a high-res PNG image via HTML Canvas
 */
async function renderTextToPng(
  text: string,
  options: { fontSize?: number; fontBold?: boolean; color?: string; maxWidth?: number } = {}
): Promise<Uint8Array | null> {
  try {
    const fontSize = options.fontSize || 14;
    const fontBold = options.fontBold ? 'bold' : 'normal';
    const color = options.color || '#1e293b';
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const fontString = `${fontBold} ${fontSize * 2}px "Hind Siliguri", "Roboto", sans-serif`;
    ctx.font = fontString;
    const metrics = ctx.measureText(text);
    const width = Math.ceil(metrics.width) + 10;
    const height = Math.ceil(fontSize * 2.8);

    canvas.width = Math.min(width, (options.maxWidth || 500) * 2);
    canvas.height = height;

    // re-set font after canvas resize
    ctx.font = fontString;
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 2, height / 2);

    const dataUrl = canvas.toDataURL('image/png');
    const res = await fetch(dataUrl);
    return new Uint8Array(await res.arrayBuffer());
  } catch (e) {
    console.warn('Failed to render text to PNG canvas:', e);
    return null;
  }
}

export interface GeneratePackageOptions {
  tender: TenderInfo;
  documents: DocumentRowState[];
  pdfFilesMap: Map<string, ArrayBuffer>;
  includeIndexPage?: boolean;
  bilingualHeaders?: boolean;
  sealConfig?: SealConfig | null;
}

export async function generateTenderPackage(options: GeneratePackageOptions): Promise<{
  pdfBytes: Uint8Array;
  fileName: string;
  totalPageCount: number;
}> {
  const {
    tender,
    documents,
    pdfFilesMap,
    includeIndexPage = true,
    bilingualHeaders = true,
    sealConfig = null,
  } = options;

  // Filter documents that have a matched file, sorted by order
  const includedDocs = documents
    .filter((doc) => doc.matchedFileId && pdfFilesMap.has(doc.matchedFileId))
    .sort((a, b) => a.requirement.order - b.requirement.order);

  const mergedPdf = await PDFDocument.create();
  const helvetica = await mergedPdf.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);

  // Load seal image if provided
  let embeddedSealImage: any = null;
  if (sealConfig && sealConfig.file) {
    try {
      const sealBuffer = await sealConfig.file.arrayBuffer();
      // Supports PNG
      embeddedSealImage = await mergedPdf.embedPng(sealBuffer);
    } catch (e) {
      console.warn('Failed to embed seal image:', e);
    }
  }

  // A4 dimensions: 595.28 x 841.89 points
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 50;

  // ==========================================
  // PAGE 1: COVER PAGE (Rule 6.1)
  // Must be in English as specified by Rule 6.1:
  // "Page 1 is a cover page, in English. It shows: tender ID, tender title, procuring entity,
  // bidder name, submission deadline, the date the package was made, and the list of included documents in order."
  // ==========================================
  const coverPage = mergedPdf.addPage([pageWidth, pageHeight]);

  // Decorative header band
  coverPage.drawRectangle({
    x: 0,
    y: pageHeight - 120,
    width: pageWidth,
    height: 120,
    color: rgb(0.08, 0.25, 0.45),
  });

  coverPage.drawText('TENDER SUBMISSION PACKAGE', {
    x: margin,
    y: pageHeight - 65,
    size: 20,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });

  coverPage.drawText(`Tender ID: ${tender.tender_id}`, {
    x: margin,
    y: pageHeight - 95,
    size: 13,
    font: helvetica,
    color: rgb(0.85, 0.92, 1),
  });

  // Tender Metadata Block
  let cursorY = pageHeight - 150;
  const metaLabels = [
    { label: 'Tender Title:', value: tender.title },
    { label: 'Procuring Entity:', value: tender.procuring_entity },
    { label: 'Bidder Name:', value: tender.bidder },
    { label: 'Submission Deadline:', value: tender.submission_deadline },
    { label: 'Package Date:', value: new Date().toISOString().split('T')[0] },
  ];

  // Draw background box for metadata
  coverPage.drawRectangle({
    x: margin,
    y: cursorY - 125,
    width: pageWidth - 2 * margin,
    height: 135,
    color: rgb(0.96, 0.97, 0.98),
    borderColor: rgb(0.85, 0.88, 0.92),
    borderWidth: 1,
  });

  cursorY -= 15;
  for (const item of metaLabels) {
    coverPage.drawText(item.label, {
      x: margin + 15,
      y: cursorY,
      size: 10,
      font: helveticaBold,
      color: rgb(0.2, 0.25, 0.3),
    });

    coverPage.drawText(item.value, {
      x: margin + 160,
      y: cursorY,
      size: 10,
      font: helvetica,
      color: rgb(0.1, 0.1, 0.1),
    });
    cursorY -= 22;
  }

  // Included Documents section on Cover Page
  cursorY -= 25;
  coverPage.drawText('LIST OF INCLUDED DOCUMENTS', {
    x: margin,
    y: cursorY,
    size: 12,
    font: helveticaBold,
    color: rgb(0.08, 0.25, 0.45),
  });

  cursorY -= 8;
  coverPage.drawLine({
    start: { x: margin, y: cursorY },
    end: { x: pageWidth - margin, y: cursorY },
    thickness: 1.5,
    color: rgb(0.08, 0.25, 0.45),
  });

  // Table header
  cursorY -= 20;
  coverPage.drawText('No.', { x: margin + 5, y: cursorY, size: 9, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) });
  coverPage.drawText('Document Name', { x: margin + 35, y: cursorY, size: 9, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) });
  coverPage.drawText('Requirement', { x: margin + 310, y: cursorY, size: 9, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) });
  coverPage.drawText('Status', { x: margin + 410, y: cursorY, size: 9, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) });

  cursorY -= 8;
  coverPage.drawLine({
    start: { x: margin, y: cursorY },
    end: { x: pageWidth - margin, y: cursorY },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });

  cursorY -= 16;
  let docIndex = 1;
  for (const doc of includedDocs) {
    if (cursorY < 70) break; // Keep within page bounds

    // Row alternating background
    if (docIndex % 2 === 0) {
      coverPage.drawRectangle({
        x: margin,
        y: cursorY - 5,
        width: pageWidth - 2 * margin,
        height: 18,
        color: rgb(0.97, 0.98, 0.99),
      });
    }

    coverPage.drawText(`${docIndex}.`, {
      x: margin + 5,
      y: cursorY,
      size: 9,
      font: helvetica,
      color: rgb(0.2, 0.2, 0.2),
    });

    const docTitle = doc.requirement.title_en;
    coverPage.drawText(docTitle.length > 40 ? docTitle.substring(0, 37) + '...' : docTitle, {
      x: margin + 35,
      y: cursorY,
      size: 9,
      font: helveticaBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    coverPage.drawText(doc.requirement.mandatory ? 'Mandatory' : 'Optional', {
      x: margin + 310,
      y: cursorY,
      size: 9,
      font: helvetica,
      color: rgb(0.3, 0.3, 0.3),
    });

    coverPage.drawText(doc.status, {
      x: margin + 410,
      y: cursorY,
      size: 9,
      font: helvetica,
      color: doc.status === 'OK' ? rgb(0.1, 0.55, 0.2) : rgb(0.6, 0.2, 0.1),
    });

    cursorY -= 19;
    docIndex++;
  }

  // ==========================================
  // BONUS: INDEX PAGE (Rule 7)
  // "Index page after the cover, showing the page number where each document starts."
  // ==========================================
  let indexPage: any = null;
  if (includeIndexPage) {
    indexPage = mergedPdf.addPage([pageWidth, pageHeight]);
  }

  // Track page ranges for the Index Page
  const documentPageRanges: Array<{
    doc: DocumentRowState;
    startPage: number;
    pageCount: number;
  }> = [];

  // Current page count before appending documents
  // (Cover = 1, Index = 2 if present)
  let currentPageNumber = (includeIndexPage ? 2 : 1) + 1;

  // Append each document
  for (const doc of includedDocs) {
    const fileBuffer = pdfFilesMap.get(doc.matchedFileId!);
    if (!fileBuffer) continue;

    try {
      const sourcePdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
      const copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
      
      const startPage = currentPageNumber;
      for (const page of copiedPages) {
        mergedPdf.addPage(page);
        currentPageNumber++;
      }

      documentPageRanges.push({
        doc,
        startPage,
        pageCount: copiedPages.length,
      });
    } catch (err) {
      console.error(`Failed to copy pages for ${doc.matchedFileId}:`, err);
    }
  }

  // Populate Index Page if enabled
  if (includeIndexPage && indexPage) {
    let idxY = pageHeight - 70;
    indexPage.drawText('DOCUMENT INDEX & DIRECTORY', {
      x: margin,
      y: idxY,
      size: 16,
      font: helveticaBold,
      color: rgb(0.08, 0.25, 0.45),
    });

    idxY -= 10;
    indexPage.drawLine({
      start: { x: margin, y: idxY },
      end: { x: pageWidth - margin, y: idxY },
      thickness: 1.5,
      color: rgb(0.08, 0.25, 0.45),
    });

    idxY -= 25;
    indexPage.drawText('Order', { x: margin + 5, y: idxY, size: 9, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) });
    indexPage.drawText('Document Title', { x: margin + 45, y: idxY, size: 9, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) });
    indexPage.drawText('File Attached', { x: margin + 260, y: idxY, size: 9, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) });
    indexPage.drawText('Pages', { x: margin + 410, y: idxY, size: 9, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) });
    indexPage.drawText('Start Page', { x: margin + 460, y: idxY, size: 9, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) });

    idxY -= 8;
    indexPage.drawLine({
      start: { x: margin, y: idxY },
      end: { x: pageWidth - margin, y: idxY },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });

    idxY -= 20;
    for (const item of documentPageRanges) {
      if (idxY < 60) break;

      indexPage.drawText(`${item.doc.requirement.order}`, {
        x: margin + 10,
        y: idxY,
        size: 9,
        font: helvetica,
        color: rgb(0.2, 0.2, 0.2),
      });

      const title = item.doc.requirement.title_en;
      indexPage.drawText(title.length > 32 ? title.substring(0, 30) + '...' : title, {
        x: margin + 45,
        y: idxY,
        size: 9,
        font: helveticaBold,
        color: rgb(0.1, 0.1, 0.1),
      });

      // Bonus: If Bangla titles enabled, render Bangla subtext via canvas
      if (bilingualHeaders && item.doc.requirement.title_bn) {
        try {
          const bnPng = await renderTextToPng(item.doc.requirement.title_bn, {
            fontSize: 8,
            color: '#475569',
            maxWidth: 150,
          });
          if (bnPng) {
            const bnImg = await mergedPdf.embedPng(bnPng);
            indexPage.drawImage(bnImg, {
              x: margin + 45,
              y: idxY - 11,
              width: bnImg.width / 2,
              height: bnImg.height / 2,
            });
          }
        } catch (e) {
          // Fallback gracefully
        }
      }

      indexPage.drawText(item.doc.matchedFileId ? item.doc.matchedFileId.substring(0, 25) : '-', {
        x: margin + 260,
        y: idxY,
        size: 8,
        font: helvetica,
        color: rgb(0.35, 0.35, 0.35),
      });

      indexPage.drawText(`${item.pageCount}`, {
        x: margin + 415,
        y: idxY,
        size: 9,
        font: helvetica,
        color: rgb(0.2, 0.2, 0.2),
      });

      indexPage.drawText(`Page ${item.startPage}`, {
        x: margin + 460,
        y: idxY,
        size: 9,
        font: helveticaBold,
        color: rgb(0.08, 0.25, 0.45),
      });

      idxY -= 26;
    }
  }

  // ==========================================
  // FOOTER RULES (Rule 6.3 & 6.4)
  // "6.3 Every page, including the cover, has a footer at the bottom:
  // <tender_id> | Page X of Y. Y is the total number of pages in the package.
  // 6.4 The footer must be easy to read and must not cover the document's content."
  // ==========================================
  const allPages = mergedPdf.getPages();
  const totalPageCount = allPages.length;

  for (let i = 0; i < totalPageCount; i++) {
    const page = allPages[i];
    const { width } = page.getSize();
    const footerText = `${tender.tender_id} | Page ${i + 1} of ${totalPageCount}`;
    const textWidth = helvetica.widthOfTextAtSize(footerText, 9);

    // Subtle background bar to ensure readability without covering content
    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: 25,
      color: rgb(0.98, 0.98, 0.99),
      opacity: 0.9,
    });

    // Separator line
    page.drawLine({
      start: { x: 30, y: 25 },
      end: { x: width - 30, y: 25 },
      thickness: 0.5,
      color: rgb(0.82, 0.85, 0.88),
    });

    // Centered or Right aligned footer text
    page.drawText(footerText, {
      x: (width - textWidth) / 2,
      y: 8,
      size: 9,
      font: helvetica,
      color: rgb(0.25, 0.3, 0.35),
    });

    // ==========================================
    // BONUS: SEAL / SIGNATURE STAMPING
    // ==========================================
    if (embeddedSealImage && sealConfig) {
      const isCover = i === 0;
      const isLast = i === totalPageCount - 1;
      let shouldStamp = false;

      if (sealConfig.placement === 'cover' && isCover) shouldStamp = true;
      else if (sealConfig.placement === 'all' && i >= 1) shouldStamp = true; // all document pages
      else if (sealConfig.placement === 'last' && isLast) shouldStamp = true;

      if (shouldStamp) {
        const stampWidth = 90;
        const stampHeight = (embeddedSealImage.height / embeddedSealImage.width) * stampWidth;
        let stampX = width - stampWidth - 40;
        let stampY = 35; // above footer

        if (sealConfig.position === 'bottom-left') {
          stampX = 40;
          stampY = 35;
        } else if (sealConfig.position === 'top-right') {
          stampX = width - stampWidth - 40;
          stampY = page.getHeight() - stampHeight - 40;
        }

        page.drawImage(embeddedSealImage, {
          x: stampX,
          y: stampY,
          width: stampWidth,
          height: stampHeight,
          opacity: sealConfig.opacity || 0.85,
        });
      }
    }
  }

  const pdfBytes = await mergedPdf.save();
  const fileName = `${tender.tender_id}_Package.pdf`;

  return {
    pdfBytes,
    fileName,
    totalPageCount,
  };
}
