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
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
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

    // Map of existing hashes to detect duplicates
    const allKnownHashes = new Map<string, string[]>();
    for (const f of files) {
      if (!allKnownHashes.has(f.hash)) {
        allKnownHashes.set(f.hash, []);
      }
      allKnownHashes.get(f.hash)!.push(f.name);
    }

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];

      // 4.2: Reject non-PDFs
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        onError(t.fileRejectedNotPdf.replace('{name}', file.name));
        continue;
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        const hash = await computeFileHash(arrayBuffer);

        let pageCount = 0;
        let fileError: string | undefined = undefined;

        // Try parsing PDF to get pages and check damage / password protection
        try {
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          pageCount = pdfDoc.getPageCount();
        } catch (pdfErr: any) {
          console.warn('PDF parsing error for', file.name, pdfErr);
          fileError = t.fileDamaged.replace('{name}', file.name);
          onError(fileError);
        }

        // Check duplicates
        const existingNames = allKnownHashes.get(hash) || [];
        const isDuplicate = existingNames.length > 0;
        const duplicateGroup = [...existingNames, file.name];

        if (!allKnownHashes.has(hash)) {
          allKnownHashes.set(hash, []);
        }
        allKnownHashes.get(hash)!.push(file.name);

        const newPdf: UploadedPdf = {
          id: file.name, // unique key or filename
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
    <Card elevation={1} sx={{ mb: 3, border: '1px solid #e2e8f0' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PdfIcon color="error" sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {t.uploadedFiles} ({files.length})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t.uploadPdfsHint}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {onLoadSamplePdfs && (
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<FolderOpenIcon />}
                onClick={onLoadSamplePdfs}
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
            >
              {processing ? (language === 'en' ? 'Processing...' : 'প্রক্রিয়াকরণ হচ্ছে...') : t.uploadPdfs}
            </Button>
          </Box>
        </Box>

        {/* Dropzone Area */}
        <Box
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            border: '2px dashed',
            borderColor: isDragging ? 'primary.main' : '#cbd5e1',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            backgroundColor: isDragging ? '#eff6ff' : '#f8fafc',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            mb: 2,
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: '#f1f5f9',
            },
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 40, color: '#64748b', mb: 1 }} />
          <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155' }}>
            {language === 'en' ? 'Click to browse or drop PDF documents here' : 'এখানে ক্লিক করুন অথবা পিডিএফ ফাইল ড্রপ করুন'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {language === 'en' ? 'Auto-identifies duplicate files and counts pages' : 'স্বয়ংক্রিয়ভাবে ডুপ্লিকেট শনাক্ত করে ও পৃষ্ঠা গণনা করে'}
          </Typography>
        </Box>

        {duplicateFilesExist && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {t.duplicateWarning}
          </Alert>
        )}

        {/* Files Table */}
        {files.length === 0 ? (
          <Box sx={{ py: 3, textAlign: 'center', color: '#64748b' }}>
            <Typography variant="body2">{t.noFilesUploaded}</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5, maxHeight: 320 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 700 }}>{t.fileName}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t.pages}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t.size}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t.duplicate}</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>{t.actions}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {files.map((file) => (
                  <TableRow
                    key={file.id}
                    hover
                    sx={{
                      backgroundColor: file.isDuplicate ? '#fffbeb' : file.error ? '#fef2f2' : 'inherit',
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PdfIcon color={file.error ? 'disabled' : 'error'} fontSize="small" />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {file.name}
                        </Typography>
                        {file.error && (
                          <Chip label="Error" size="small" color="error" variant="outlined" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${file.pageCount} ${language === 'en' ? (file.pageCount === 1 ? 'page' : 'pages') : 'পৃষ্ঠা'}`}
                        size="small"
                        variant="outlined"
                        color={file.pageCount > 0 ? 'default' : 'error'}
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                      {formatFileSize(file.size)}
                    </TableCell>
                    <TableCell>
                      {file.isDuplicate ? (
                        <Tooltip
                          title={
                            file.duplicateGroup && file.duplicateGroup.length > 1
                              ? `${language === 'en' ? 'Exact duplicate of: ' : 'হুবহু একই কন্টেন্ট: '} ${file.duplicateGroup
                                  .filter((n) => n !== file.name)
                                  .join(', ')}`
                              : 'Identical content detected'
                          }
                        >
                          <Chip
                            icon={<WarningIcon />}
                            label={language === 'en' ? 'Duplicate Content' : 'ডুপ্লিকেট'}
                            size="small"
                            color="warning"
                          />
                        </Tooltip>
                      ) : (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label={language === 'en' ? 'Unique' : 'ইউনিক'}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onFileRemoved(file.id)}
                        aria-label="delete"
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
