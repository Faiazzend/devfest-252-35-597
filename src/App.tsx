import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Container,
  Box,
  Snackbar,
  Alert,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { Header } from './components/Header';
import { TenderDetailsCard } from './components/TenderDetailsCard';
import { UploadFilesCard } from './components/UploadFilesCard';
import { RequirementsTable } from './components/RequirementsTable';
import { GeneratePackageCard } from './components/GeneratePackageCard';
import { SealDialog } from './components/SealDialog';
import { AiHelpDialog } from './components/AiHelpDialog';
import {
  TenderInfo,
  Requirement,
  RequirementsData,
  UploadedPdf,
  DocumentRowState,
  SealConfig,
} from './types';
import { Language } from './i18n';
import { computeDocumentStatus, autoMatchFiles, exportChecklistCsv } from './utils/statusEngine';
import { generateTenderPackage } from './utils/pdfGenerator';
import { computeFileHash } from './utils/crypto';
import { PDFDocument } from 'pdf-lib';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1e40af', // Deep trustworthy blue
    },
    secondary: {
      main: '#0f766e', // Teal
    },
    background: {
      default: '#f8fafc',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Hind Siliguri", sans-serif',
  },
});

export const App: React.FC = () => {
  // 1. Language state (persisted in localStorage)
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('tender_app_lang') as Language) || 'en';
  });

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('tender_app_lang', lang);
  };

  // 2. Tender and Requirements state
  const [tender, setTender] = useState<TenderInfo | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);

  // 3. Uploaded PDF files
  const [uploadedFiles, setUploadedFiles] = useState<UploadedPdf[]>([]);

  // 4. Matches state: requirementId -> { fileId: string | null, expiryDate: string }
  const [matches, setMatches] = useState<Record<string, { fileId: string | null; expiryDate: string }>>({});

  // 5. Package generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPdfBytes, setGeneratedPdfBytes] = useState<Uint8Array | null>(null);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [generatedFileName, setGeneratedFileName] = useState<string | null>(null);
  const [totalPageCount, setTotalPageCount] = useState<number | null>(null);

  // Bonus configs
  const [includeIndexPage, setIncludeIndexPage] = useState(true);
  const [bilingualHeaders, setBilingualHeaders] = useState(true);
  const [sealConfig, setSealConfig] = useState<SealConfig>({
    file: null,
    dataUrl: null,
    placement: 'cover',
    position: 'bottom-right',
    opacity: 0.85,
  });

  // Dialogs
  const [sealDialogOpen, setSealDialogOpen] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const projectFileInputRef = useRef<HTMLInputElement | null>(null);

  // Try loading auto-saved session from localStorage on first mount
  useEffect(() => {
    const saved = localStorage.getItem('tender_project_cache');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.tender && parsed.requirements) {
          setTender(parsed.tender);
          setRequirements(parsed.requirements);
          if (parsed.matches) setMatches(parsed.matches);
        }
      } catch (e) {
        console.warn('Could not parse cached project:', e);
      }
    }
  }, []);

  // Save session state to localStorage on changes
  useEffect(() => {
    if (tender && requirements.length > 0) {
      localStorage.setItem(
        'tender_project_cache',
        JSON.stringify({
          tender,
          requirements,
          matches,
        })
      );
    }
  }, [tender, requirements, matches]);

  // Derived state: calculate status for each requirement
  const rows: DocumentRowState[] = useMemo(() => {
    if (!tender) return [];

    return requirements
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((req) => {
        const matchData = matches[req.id] || { fileId: null, expiryDate: '' };
        const { status, isBlocking, explanation } = computeDocumentStatus(
          req,
          matchData.fileId,
          matchData.expiryDate,
          tender.submission_deadline
        );

        return {
          requirement: req,
          matchedFileId: matchData.fileId,
          expiryDate: matchData.expiryDate,
          status,
          isBlocking,
          statusExplanation: explanation,
        };
      });
  }, [tender, requirements, matches]);

  // Handle parsing of requirements.json
  const handleRequirementsLoaded = (jsonString: string) => {
    try {
      const data: RequirementsData = JSON.parse(jsonString);
      if (!data.tender || !Array.isArray(data.requirements)) {
        throw new Error('Invalid format: missing "tender" object or "requirements" array.');
      }
      setTender(data.tender);
      setRequirements(data.requirements);

      // Initialize matches map
      const initialMatches: Record<string, { fileId: string | null; expiryDate: string }> = {};
      data.requirements.forEach((r) => {
        initialMatches[r.id] = { fileId: null, expiryDate: '' };
      });
      setMatches(initialMatches);

      // Reset generated package
      setGeneratedPdfUrl(null);
      setGeneratedPdfBytes(null);

      setToast({
        message: language === 'en' ? 'Requirements loaded successfully!' : 'শর্তাবলী সফলভাবে লোড হয়েছে!',
        severity: 'success',
      });
    } catch (err: any) {
      setToast({
        message: `${language === 'en' ? 'JSON Parse Error: ' : 'জেসন ত্রুটি: '}${err.message}`,
        severity: 'error',
      });
    }
  };

  // Helper to load sample requirements directly from bundled public directory
  const handleLoadSample = async () => {
    try {
      const res = await fetch('./sample-pack/requirements.json');
      if (!res.ok) throw new Error('Sample requirements file not found');
      const text = await res.text();
      handleRequirementsLoaded(text);
    } catch (err: any) {
      setToast({
        message: `Could not load sample pack: ${err.message}`,
        severity: 'error',
      });
    }
  };

  // Helper to load bundled sample PDFs automatically for quick demonstration
  const handleLoadSamplePdfs = async () => {
    const sampleFiles = [
      '01_financial_proposal.pdf',
      '02_technical_proposal.pdf',
      '03_tin_certificate.pdf',
      '04_vat_certificate.pdf',
      'bank_solvency.pdf',
      'company_logo.png', // Will trigger intentional rejection
      'experience_cert (1).pdf', // Identical duplicate
      'experience_cert.pdf',
      'scan_0042.pdf',
      'trade_license_2025.pdf',
      'trade_license_2026.pdf',
    ];

    setToast({
      message: language === 'en' ? 'Loading sample pack documents...' : 'স্যাম্পল নথি লোড করা হচ্ছে...',
      severity: 'info',
    });

    const loadedList: UploadedPdf[] = [];
    const allKnownHashes = new Map<string, string[]>();

    for (const fileName of sampleFiles) {
      try {
        const response = await fetch(`./sample-pack/documents/${encodeURIComponent(fileName)}`);
        if (!response.ok) continue;

        const blob = await response.blob();
        const file = new File([blob], fileName, { type: blob.type });

        if (!fileName.toLowerCase().endsWith('.pdf')) {
          setToast({
            message: `Rejected: ${fileName} is not a PDF file.`,
            severity: 'warning',
          });
          continue;
        }

        const arrayBuffer = await file.arrayBuffer();
        const hash = await computeFileHash(arrayBuffer);

        let pageCount = 0;
        let fileError: string | undefined = undefined;

        try {
          const doc = await PDFDocument.load(arrayBuffer);
          pageCount = doc.getPageCount();
        } catch (e: any) {
          fileError = 'Damaged/Encrypted PDF';
        }

        const existingNames = allKnownHashes.get(hash) || [];
        const isDuplicate = existingNames.length > 0;
        const duplicateGroup = [...existingNames, fileName];

        if (!allKnownHashes.has(hash)) {
          allKnownHashes.set(hash, []);
        }
        allKnownHashes.get(hash)!.push(fileName);

        loadedList.push({
          id: fileName,
          file,
          name: fileName,
          size: file.size,
          pageCount,
          hash,
          isDuplicate,
          duplicateGroup,
          error: fileError,
          arrayBuffer,
        });
      } catch (e) {
        console.error('Error fetching sample doc:', fileName, e);
      }
    }

    setUploadedFiles(loadedList);
    setToast({
      message: language === 'en' ? 'Loaded sample PDF documents.' : 'স্যাম্পল পিডিএফ নথিগুলো লোড করা হয়েছে।',
      severity: 'success',
    });
  };

  // Manage uploaded files
  const handleFilesAdded = (newFiles: UploadedPdf[]) => {
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileRemoved = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    // Also remove match if this file was matched
    setMatches((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((key) => {
        if (updated[key].fileId === fileId) {
          updated[key] = { ...updated[key], fileId: null };
        }
      });
      return updated;
    });
  };

  // Match / unmatch file
  const handleMatchChange = (requirementId: string, fileId: string | null) => {
    setMatches((prev) => ({
      ...prev,
      [requirementId]: {
        ...(prev[requirementId] || { expiryDate: '' }),
        fileId,
      },
    }));
  };

  // Expiry date input
  const handleExpiryDateChange = (requirementId: string, date: string) => {
    setMatches((prev) => ({
      ...prev,
      [requirementId]: {
        ...(prev[requirementId] || { fileId: null }),
        expiryDate: date,
      },
    }));
  };

  // Auto-Match bonus feature
  const handleAutoMatch = () => {
    const suggested = autoMatchFiles(requirements, uploadedFiles);
    let count = 0;
    setMatches((prev) => {
      const updated = { ...prev };
      Object.entries(suggested).forEach(([reqId, fileId]) => {
        if (!updated[reqId]?.fileId) {
          updated[reqId] = {
            expiryDate: updated[reqId]?.expiryDate || '',
            fileId,
          };
          count++;
        }
      });
      return updated;
    });

    setToast({
      message:
        language === 'en'
          ? `Auto-matched ${count} documents based on file names!`
          : `ফাইলের নামের ভিত্তিতে ${count}টি নথি স্বয়ংক্রিয়ভাবে যুক্ত হয়েছে!`,
      severity: 'info',
    });
  };

  // Clear all matches
  const handleClearMatches = () => {
    setMatches((prev) => {
      const reset: Record<string, { fileId: string | null; expiryDate: string }> = {};
      Object.keys(prev).forEach((key) => {
        reset[key] = { fileId: null, expiryDate: prev[key].expiryDate };
      });
      return reset;
    });
  };

  // Save Project (Bonus)
  const handleSaveProject = () => {
    if (!tender) {
      setToast({
        message: language === 'en' ? 'No project loaded to save.' : 'সংরক্ষণ করার মতো কোনো প্রজেক্ট নেই।',
        severity: 'warning',
      });
      return;
    }

    const projectData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      tender,
      requirements,
      matches,
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tender.tender_id}_Project.json`;
    a.click();
    URL.revokeObjectURL(url);

    setToast({
      message: language === 'en' ? 'Project file exported successfully.' : 'প্রজেক্ট ফাইল সংরক্ষণ সম্পন্ন হয়েছে।',
      severity: 'success',
    });
  };

  // Load Project (Bonus)
  const handleLoadProjectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.tender && parsed.requirements) {
          setTender(parsed.tender);
          setRequirements(parsed.requirements);
          if (parsed.matches) setMatches(parsed.matches);
          setToast({
            message: language === 'en' ? 'Project loaded successfully.' : 'প্রজেক্ট সফলভাবে লোড হয়েছে।',
            severity: 'success',
          });
        }
      } catch (err: any) {
        setToast({ message: `Failed to load project: ${err.message}`, severity: 'error' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Export CSV (Bonus)
  const handleExportCsv = () => {
    if (!tender || rows.length === 0) {
      setToast({
        message: language === 'en' ? 'Load requirements first to export checklist.' : 'চেকলিস্ট এক্সপোর্ট করার জন্য আগে শর্তাবলী লোড করুন।',
        severity: 'warning',
      });
      return;
    }

    const filesMap = new Map<string, UploadedPdf>();
    uploadedFiles.forEach((f) => filesMap.set(f.id, f));
    exportChecklistCsv(tender.tender_id, rows, filesMap);
  };

  // Generate Tender Package
  const handleGeneratePackage = async () => {
    if (!tender) return;

    setIsGenerating(true);
    setToast({
      message: language === 'en' ? 'Generating tender package PDF...' : 'টেন্ডার প্যাকেজ পিডিএফ তৈরি হচ্ছে...',
      severity: 'info',
    });

    try {
      // Build ArrayBuffer map for matched files
      const pdfFilesMap = new Map<string, ArrayBuffer>();
      for (const row of rows) {
        if (row.matchedFileId) {
          const fileObj = uploadedFiles.find((f) => f.id === row.matchedFileId);
          if (fileObj) {
            if (fileObj.arrayBuffer) {
              pdfFilesMap.set(fileObj.id, fileObj.arrayBuffer);
            } else {
              const buf = await fileObj.file.arrayBuffer();
              pdfFilesMap.set(fileObj.id, buf);
            }
          }
        }
      }

      const { pdfBytes, fileName, totalPageCount } = await generateTenderPackage({
        tender,
        documents: rows,
        pdfFilesMap,
        includeIndexPage,
        bilingualHeaders,
        sealConfig: sealConfig.file ? sealConfig : null,
      });

      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      setGeneratedPdfBytes(pdfBytes);
      setGeneratedPdfUrl(blobUrl);
      setGeneratedFileName(fileName);
      setTotalPageCount(totalPageCount);

      setToast({
        message:
          language === 'en'
            ? `Package "${fileName}" generated successfully (${totalPageCount} pages)!`
            : `প্যাকেজ "${fileName}" সফলভাবে তৈরি হয়েছে (মোট ${totalPageCount} পৃষ্ঠা)!`,
        severity: 'success',
      });
    } catch (err: any) {
      console.error('Generation error:', err);
      setToast({
        message: `Package generation failed: ${err.message}`,
        severity: 'error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Download Generated PDF
  const handleDownload = () => {
    if (!generatedPdfBytes || !generatedFileName) return;

    const blob = new Blob([generatedPdfBytes as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = generatedFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', pb: 6 }}>
        <Header
          language={language}
          onLanguageChange={handleLanguageChange}
          onSaveProject={handleSaveProject}
          onLoadProject={() => projectFileInputRef.current?.click()}
          onExportCsv={handleExportCsv}
          onOpenSealDialog={() => setSealDialogOpen(true)}
          onOpenAiDialog={() => setAiDialogOpen(true)}
        />

        {/* Hidden project file input */}
        <input
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          ref={projectFileInputRef}
          onChange={handleLoadProjectFile}
        />

        <Container maxWidth="lg" sx={{ mt: 3 }}>
          {/* Section 1: Tender Details & Load JSON */}
          <TenderDetailsCard
            tender={tender}
            language={language}
            onRequirementsLoaded={handleRequirementsLoaded}
            onLoadSample={handleLoadSample}
          />

          {/* Section 2: Upload Files & Duplicate Detection */}
          <UploadFilesCard
            files={uploadedFiles}
            language={language}
            onFilesAdded={handleFilesAdded}
            onFileRemoved={handleFileRemoved}
            onError={(msg) => setToast({ message: msg, severity: 'error' })}
            onLoadSamplePdfs={handleLoadSamplePdfs}
          />

          {/* Section 3: Requirements Table & Matching */}
          {tender && (
            <RequirementsTable
              rows={rows}
              files={uploadedFiles}
              language={language}
              onMatchChange={handleMatchChange}
              onExpiryDateChange={handleExpiryDateChange}
              onAutoMatch={handleAutoMatch}
              onClearMatches={handleClearMatches}
            />
          )}

          {/* Section 4: Package Generation & Download */}
          {tender && (
            <GeneratePackageCard
              tender={tender}
              rows={rows}
              isGenerating={isGenerating}
              generatedPdfUrl={generatedPdfUrl}
              generatedFileName={generatedFileName}
              totalPageCount={totalPageCount}
              includeIndexPage={includeIndexPage}
              onIncludeIndexPageChange={setIncludeIndexPage}
              bilingualHeaders={bilingualHeaders}
              onBilingualHeadersChange={setBilingualHeaders}
              onGenerate={handleGeneratePackage}
              onDownload={handleDownload}
              language={language}
            />
          )}
        </Container>

        {/* Bonus Dialogs */}
        <SealDialog
          open={sealDialogOpen}
          onClose={() => setSealDialogOpen(false)}
          config={sealConfig}
          onConfigChange={setSealConfig}
          language={language}
        />

        <AiHelpDialog
          open={aiDialogOpen}
          onClose={() => setAiDialogOpen(false)}
          tender={tender}
          rows={rows}
          language={language}
        />

        {/* Global Toast */}
        <Snackbar
          open={!!toast}
          autoHideDuration={5000}
          onClose={() => setToast(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          {toast ? (
            <Alert onClose={() => setToast(null)} severity={toast.severity} sx={{ width: '100%', fontWeight: 500 }}>
              {toast.message}
            </Alert>
          ) : undefined}
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};
