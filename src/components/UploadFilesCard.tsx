import React, { useRef, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  DeleteOutline as DeleteIcon,
  PictureAsPdf as PdfIcon,
  WarningAmber as WarningIcon,
  CheckCircleOutline as CheckCircleIcon,
  FolderOpen as FolderOpenIcon,
} from '@mui/icons-material';
import { PDFDocument } from 'pdf-lib';
import { UploadedPdf } from '../types';
import { Language, translations } from '../i18n';
import { computeFileHash } from '../utils/crypto';

interface UploadFilesCardProps {
  files: UploadedPdf[];
  language: Language;
  onFilesAdded: (newFiles: UploadedPdf[]) => void;
  onFileRemoved: (fileId: string) => void;
  onError: (message: string) => void;
  onLoadSamplePdfs?: () => void;
}

export const UploadFilesCard: React.FC<UploadFilesCardProps> = ({
  files,
  language,
  onFilesAdded,
  onFileRemoved,
  onError,
  onLoadSamplePdfs,
}) => {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);

  const processFiles = async (fileList: FileList | File[]) => {
    setProcessing(true);
    const addedList: UploadedPdf[] = [];

    const allKnownHashes = new Map<string, string[]>();
    for (const f of files) {
      if (!allKnownHashes.has(f.hash)) {
        allKnownHashes.set(f.hash, []);
      }
      allKnownHashes.get(f.hash)!.push(f.name);
    }

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];

      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        onError(t.fileRejectedNotPdf.replace('{name}', file.name));
        continue;
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        const hash = await computeFileHash(arrayBuffer);

        let pageCount = 0;
        let fileError: string | undefined = undefined;

        try {
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          pageCount = pdfDoc.getPageCount();
        } catch (pdfErr: any) {
          console.warn('PDF parsing error for', file.name, pdfErr);
          fileError = t.fileDamaged.replace('{name}', file.name);
          onError(fileError);
        }

        const existingNames = allKnownHashes.get(hash) || [];
        const isDuplicate = existingNames.length > 0;
        const duplicateGroup = [...existingNames, file.name];

        if (!allKnownHashes.has(hash)) {
          allKnownHashes.set(hash, []);
        }
        allKnownHashes.get(hash)!.push(file.name);

        const newPdf: UploadedPdf = {
          id: file.name,
          file,
          name: file.name,
          size: file.size,
          pageCount,
          hash,
          isDuplicate,
          duplicateGroup,
          error: fileError,
          arrayBuffer,
        };

        addedList.push(newPdf);
      } catch (err: any) {
        console.error('Failed reading file', file.name, err);
        onError(`Error reading ${file.name}: ${err.message}`);
      }
    }

    if (addedList.length > 0) {
      onFilesAdded(addedList);
    }
    setProcessing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const duplicateFilesExist = files.some((f) => f.isDuplicate);

  return (
    <Card
      elevation={0}
      sx={{
        mb: 3,
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 24px -4px rgba(15, 23, 42, 0.04)',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #fee2e2',
              }}
            >
              <PdfIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>
                {t.uploadedFiles}
                <Chip
                  label={files.length}
                  size="small"
                  sx={{
                    ml: 1.2,
                    height: 22,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                  }}
                />
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                {t.uploadPdfsHint}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.2 }}>
            {onLoadSamplePdfs && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<FolderOpenIcon />}
                onClick={onLoadSamplePdfs}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  px: 1.8,
                  py: 0.7,
                  color: '#475569',
                  borderColor: '#cbd5e1',
                  '&:hover': { borderColor: '#94a3b8', backgroundColor: '#f8fafc' },
                }}
              >
                {language === 'en' ? 'Load Sample PDFs' : 'স্যাম্পল পিডিএফ লোড'}
              </Button>
            )}
            <input
              type="file"
              multiple
              accept=".pdf,application/pdf"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleInputChange}
            />
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={processing}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.84rem',
                px: 2,
                py: 0.7,
                backgroundColor: '#2563eb',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                '&:hover': { backgroundColor: '#1d4ed8' },
              }}
            >
              {processing ? (language === 'en' ? 'Processing...' : 'প্রক্রিয়াকরণ...') : t.uploadPdfs}
            </Button>
          </Box>
        </Box>

        {/* Modern Interactive Dropzone */}
        <Box
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            border: '2px dashed',
            borderColor: isDragging ? '#3b82f6' : '#cbd5e1',
            borderRadius: '14px',
            p: 3.5,
            textAlign: 'center',
            backgroundColor: isDragging ? '#eff6ff' : '#fafafa',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            mb: 2.5,
            '&:hover': {
              borderColor: '#3b82f6',
              backgroundColor: '#f8fafc',
            },
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              backgroundColor: isDragging ? '#dbeafe' : '#f1f5f9',
              color: isDragging ? '#2563eb' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 1.5,
              transition: 'all 0.2s',
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
            {language === 'en' ? 'Drag and drop tender PDF files here, or click to browse' : 'পিডিএফ ফাইলগুলো এখানে ড্রপ করুন অথবা নির্বাচন করতে ক্লিক করুন'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, display: 'block' }}>
            {language === 'en' ? 'Accepts multiple files • Computes SHA-256 duplicate hashes instantly' : 'একাধিক ফাইল গ্রহণযোগ্য • নিমেষেই ডুপ্লিকেট শনাক্ত ও পৃষ্ঠা গণনা সম্পন্ন'}
          </Typography>
        </Box>

        {duplicateFilesExist && (
          <Alert
            severity="warning"
            sx={{
              mb: 2.5,
              borderRadius: '12px',
              backgroundColor: '#fffbeb',
              border: '1px solid #fef3c7',
              color: '#92400e',
            }}
          >
            {t.duplicateWarning}
          </Alert>
        )}

        {/* Uploaded Files Table */}
        {files.length === 0 ? (
          <Box sx={{ py: 3, textAlign: 'center', color: '#94a3b8' }}>
            <Typography variant="body2">{t.noFilesUploaded}</Typography>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              maxHeight: 340,
              overflow: 'auto',
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, backgroundColor: '#f8fafc', color: '#475569', py: 1.2 }}>{t.fileName}</TableCell>
                  <TableCell sx={{ fontWeight: 700, backgroundColor: '#f8fafc', color: '#475569', py: 1.2 }}>{t.pages}</TableCell>
                  <TableCell sx={{ fontWeight: 700, backgroundColor: '#f8fafc', color: '#475569', py: 1.2 }}>{t.size}</TableCell>
                  <TableCell sx={{ fontWeight: 700, backgroundColor: '#f8fafc', color: '#475569', py: 1.2 }}>{t.duplicate}</TableCell>
                  <TableCell sx={{ fontWeight: 700, backgroundColor: '#f8fafc', color: '#475569', py: 1.2, textAlign: 'right' }}>{t.actions}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {files.map((file) => (
                  <TableRow
                    key={file.id}
                    hover
                    sx={{
                      backgroundColor: file.isDuplicate ? '#fffdf5' : file.error ? '#fff5f5' : 'inherit',
                      '&:last-child td': { borderBottom: 0 },
                    }}
                  >
                    <TableCell sx={{ py: 1.2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <PdfIcon sx={{ color: file.error ? '#94a3b8' : '#ef4444', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {file.name}
                        </Typography>
                        {file.error && (
                          <Chip label="Error" size="small" color="error" variant="outlined" sx={{ height: 20, fontSize: '0.72rem' }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 1.2 }}>
                      <Chip
                        label={`${file.pageCount} ${language === 'en' ? (file.pageCount === 1 ? 'page' : 'pages') : 'পৃষ্ঠা'}`}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: file.pageCount > 0 ? '#f1f5f9' : '#fee2e2',
                          color: file.pageCount > 0 ? '#334155' : '#b91c1c',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#64748b', fontSize: '0.82rem', py: 1.2 }}>
                      {formatFileSize(file.size)}
                    </TableCell>
                    <TableCell sx={{ py: 1.2 }}>
                      {file.isDuplicate ? (
                        <Tooltip
                          title={
                            file.duplicateGroup && file.duplicateGroup.length > 1
                              ? `${language === 'en' ? 'Exact duplicate of: ' : 'হুবহু একই কন্টেন্ট: '} ${file.duplicateGroup
                                  .filter((n) => n !== file.name)
                                  .join(', ')}`
                              : 'Identical content detected'
                          }
                          arrow
                        >
                          <Chip
                            icon={<WarningIcon sx={{ fontSize: '15px !important' }} />}
                            label={language === 'en' ? 'Duplicate Content' : 'ডুপ্লিকেট'}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              backgroundColor: '#fef3c7',
                              color: '#92400e',
                              border: '1px solid #fde68a',
                            }}
                          />
                        </Tooltip>
                      ) : (
                        <Chip
                          icon={<CheckCircleIcon sx={{ fontSize: '15px !important' }} />}
                          label={language === 'en' ? 'Unique' : 'ইউনিক'}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            backgroundColor: '#ecfdf5',
                            color: '#065f46',
                            border: '1px solid #d1fae5',
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', py: 1.2 }}>
                      <IconButton
                        size="small"
                        onClick={() => onFileRemoved(file.id)}
                        sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444', backgroundColor: '#fee2e2' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};
