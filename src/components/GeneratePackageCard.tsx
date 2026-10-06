import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert,
  AlertTitle,
  FormControlLabel,
  Checkbox,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  CheckCircle as SuccessIcon,
  ErrorOutline as ErrorIcon,
  AutoAwesome as SparklesIcon,
} from '@mui/icons-material';
import { DocumentRowState, TenderInfo } from '../types';
import { Language, translations } from '../i18n';

interface GeneratePackageCardProps {
  tender: TenderInfo | null;
  rows: DocumentRowState[];
  isGenerating: boolean;
  generatedPdfUrl: string | null;
  generatedFileName: string | null;
  totalPageCount: number | null;
  includeIndexPage: boolean;
  onIncludeIndexPageChange: (val: boolean) => void;
  bilingualHeaders: boolean;
  onBilingualHeadersChange: (val: boolean) => void;
  onGenerate: () => void;
  onDownload: () => void;
  language: Language;
}

export const GeneratePackageCard: React.FC<GeneratePackageCardProps> = ({
  tender,
  rows,
  isGenerating,
  generatedPdfUrl,
  generatedFileName,
  totalPageCount,
  includeIndexPage,
  onIncludeIndexPageChange,
  bilingualHeaders,
  onBilingualHeadersChange,
  onGenerate,
  onDownload,
  language,
}) => {
  const t = translations[language];

  const blockingRows = rows.filter((r) => r.isBlocking);
  const canGenerate = tender !== null && rows.length > 0 && blockingRows.length === 0;

  return (
    <Card
      elevation={0}
      sx={{
        mb: 5,
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 24px -4px rgba(15, 23, 42, 0.04)',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8, mb: 2.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #dbeafe',
            }}
          >
            <PdfIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>
              {t.generatePackage}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              {language === 'en'
                ? 'Create a unified, certified tender document with cover page, index, and required footers'
                : 'যাচাইকৃত নথিগুলো কভার পেজ, ইনডেক্স ও ফুটার সহ একক প্যাকেজে রূপান্তর করুন'}
            </Typography>
          </Box>
        </Box>

        {/* Blocking Warnings (Rule 4.7) */}
        {blockingRows.length > 0 && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: '12px',
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              color: '#9f1239',
            }}
          >
            <AlertTitle sx={{ fontWeight: 700 }}>{t.blockingAlert}</AlertTitle>
            <List dense disablePadding>
              {blockingRows.map((b) => (
                <ListItem key={b.requirement.id} disableGutters sx={{ py: 0.3 }}>
                  <ListItemIcon sx={{ minWidth: 26 }}>
                    <ErrorIcon sx={{ fontSize: 18, color: '#e11d48' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <span style={{ fontWeight: 600 }}>
                        {language === 'bn' ? b.requirement.title_bn : b.requirement.title_en} (
                        {b.requirement.id}): {b.status}
                      </span>
                    }
                    secondary={<span style={{ color: '#881337', fontSize: '0.8rem' }}>{b.statusExplanation}</span>}
                  />
                </ListItem>
              ))}
            </List>
          </Alert>
        )}

        {canGenerate && !generatedPdfUrl && (
          <Alert
            severity="success"
            icon={<SuccessIcon sx={{ color: '#059669' }} />}
            sx={{
              mb: 3,
              borderRadius: '12px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              fontWeight: 600,
            }}
          >
            {t.readyToGenerate}
          </Alert>
        )}

        {/* Configuration Toggles */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            mb: 3,
            p: 2.2,
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={includeIndexPage}
                onChange={(e) => onIncludeIndexPageChange(e.target.checked)}
                sx={{ color: '#64748b', '&.Mui-checked': { color: '#2563eb' } }}
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  {t.includeIndexPage}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  {language === 'en'
                    ? 'Adds page 2 listing all documents and their starting page numbers'
                    : 'পৃষ্ঠা ২-এ সকল নথির শুরুর পৃষ্ঠা নম্বর সম্বলিত ইনডেক্স যুক্ত করে'}
                </Typography>
              </Box>
            }
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={bilingualHeaders}
                onChange={(e) => onBilingualHeadersChange(e.target.checked)}
                sx={{ color: '#64748b', '&.Mui-checked': { color: '#2563eb' } }}
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  {t.bilingualCoverIndex}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  {language === 'en'
                    ? 'Renders authentic Bengali typography on index page via canvas'
                    : 'ইনডেক্স পৃষ্ঠায় পরিচ্ছন্ন বাংলা ফন্ট প্রদর্শন করে'}
                </Typography>
              </Box>
            }
          />
        </Box>

        {isGenerating && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#2563eb' }}>
              {t.generating}
            </Typography>
            <LinearProgress sx={{ borderRadius: 4, height: 6 }} />
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            variant="contained"
            size="large"
            disabled={!canGenerate || isGenerating}
            onClick={onGenerate}
            startIcon={<PdfIcon />}
            sx={{
              px: 4,
              py: 1.3,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              backgroundColor: '#1e40af',
              boxShadow: canGenerate ? '0 4px 14px rgba(30, 64, 175, 0.35)' : 'none',
              '&:hover': { backgroundColor: '#1d4ed8' },
            }}
          >
            {t.generatePackage}
          </Button>

          {generatedPdfUrl && (
            <Button
              variant="contained"
              size="large"
              onClick={onDownload}
              startIcon={<DownloadIcon />}
              sx={{
                px: 3.5,
                py: 1.3,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                backgroundColor: '#059669',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
                '&:hover': { backgroundColor: '#047857' },
              }}
            >
              {t.downloadPackage} ({generatedFileName})
            </Button>
          )}

          {totalPageCount && (
            <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600, ml: 1 }}>
              {language === 'en'
                ? `Ready: ${totalPageCount} pages total`
                : `প্রস্তুত: সর্বমোট ${totalPageCount} পৃষ্ঠা`}
            </Typography>
          )}
        </Box>

        {/* Live Preview if generated */}
        {generatedPdfUrl && (
          <Box sx={{ mt: 3.5 }}>
            <Divider sx={{ mb: 2.5, borderColor: '#f1f5f9' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 1.5 }}>
              {t.previewTitle}
            </Typography>
            <Box
              component="iframe"
              src={generatedPdfUrl}
              sx={{
                width: '100%',
                height: 560,
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              }}
              title="PDF Preview"
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
