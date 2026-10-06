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
    <Card elevation={2} sx={{ mb: 4, border: '1px solid #cbd5e1' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <PdfIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t.generatePackage}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {language === 'en'
                ? 'Combine verified documents with cover page, index, and required footers'
                : 'যাচাইকৃত নথিগুলো কভার পেজ, ইনডেক্স ও ফুটার সহ একক প্যাকেজে রূপান্তর করুন'}
            </Typography>
          </Box>
        </Box>

        {/* Blocking warnings (Section 4.7) */}
        {blockingRows.length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle sx={{ fontWeight: 700 }}>{t.blockingAlert}</AlertTitle>
            <List dense disablePadding>
              {blockingRows.map((b) => (
                <ListItem key={b.requirement.id} disableGutters sx={{ py: 0.2 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <ErrorIcon color="error" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <strong>
                        {language === 'bn' ? b.requirement.title_bn : b.requirement.title_en} (
                        {b.requirement.id}): {b.status}
                      </strong>
                    }
                    secondary={b.statusExplanation}
                  />
                </ListItem>
              ))}
            </List>
          </Alert>
        )}

        {canGenerate && !generatedPdfUrl && (
          <Alert severity="success" icon={<SuccessIcon fontSize="inherit" />} sx={{ mb: 3 }}>
            {t.readyToGenerate}
          </Alert>
        )}

        {/* Configuration toggles */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: 1.5 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={includeIndexPage}
                onChange={(e) => onIncludeIndexPageChange(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {t.includeIndexPage}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {language === 'en'
                    ? 'Adds page 2 listing all documents and their exact starting page numbers'
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
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {t.bilingualCoverIndex}
                </Typography>
                <Typography variant="caption" color="text.secondary">
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
            <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 600 }}>
              {t.generating}
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            disabled={!canGenerate || isGenerating}
            onClick={onGenerate}
            startIcon={<PdfIcon />}
            sx={{ px: 4, py: 1.2, fontWeight: 700 }}
          >
            {t.generatePackage}
          </Button>

          {generatedPdfUrl && (
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={onDownload}
              startIcon={<DownloadIcon />}
              sx={{ px: 4, py: 1.2, fontWeight: 700 }}
            >
              {t.downloadPackage} ({generatedFileName})
            </Button>
          )}

          {totalPageCount && (
            <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600 }}>
              {language === 'en'
                ? `Ready: ${totalPageCount} pages total`
                : `প্রস্তুত: সর্বমোট ${totalPageCount} পৃষ্ঠা`}
            </Typography>
          )}
        </Box>

        {/* Live Preview if generated */}
        {generatedPdfUrl && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              {t.previewTitle}
            </Typography>
            <Box
              component="iframe"
              src={generatedPdfUrl}
              sx={{
                width: '100%',
                height: 520,
                border: '1px solid #cbd5e1',
                borderRadius: 2,
              }}
              title="PDF Preview"
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
