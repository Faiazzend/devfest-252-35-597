import React, { useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import {
  UploadFile as UploadFileIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  Person as PersonIcon,
  AutoAwesome as DemoIcon,
} from '@mui/icons-material';
import { TenderInfo } from '../types';
import { Language, translations } from '../i18n';

interface TenderDetailsCardProps {
  tender: TenderInfo | null;
  language: Language;
  onRequirementsLoaded: (jsonContent: string) => void;
  onLoadSample: () => void;
}

export const TenderDetailsCard: React.FC<TenderDetailsCardProps> = ({
  tender,
  language,
  onRequirementsLoaded,
  onLoadSample,
}) => {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onRequirementsLoaded(content);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

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
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            mb: tender ? 2.5 : 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
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
              <AssignmentIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>
                {t.tenderDetails}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                {tender ? `${tender.tender_id} • ${tender.title}` : t.uploadRequirementsHint}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap' }}>
            <input
              type="file"
              accept=".json,application/json"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <Button
              variant="contained"
              startIcon={<UploadFileIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.88rem',
                px: 2.2,
                py: 0.9,
                backgroundColor: '#1e40af',
                boxShadow: '0 2px 8px rgba(30, 64, 175, 0.25)',
                '&:hover': { backgroundColor: '#1d4ed8' },
              }}
            >
              {t.loadRequirements}
            </Button>
            <Button
              variant="outlined"
              startIcon={<DemoIcon />}
              onClick={onLoadSample}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.88rem',
                px: 2,
                py: 0.9,
                color: '#0f766e',
                borderColor: '#ccfbf1',
                backgroundColor: '#f0fdfa',
                '&:hover': {
                  borderColor: '#99f6e4',
                  backgroundColor: '#ccfbf1',
                },
              }}
            >
              {language === 'en' ? 'Load Sample Data' : 'স্যাম্পল ডেটা লোড'}
            </Button>
          </Box>
        </Box>

        {tender && (
          <>
            <Divider sx={{ my: 2.5, borderColor: '#f1f5f9' }} />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
                gap: 2,
              }}
            >
              <Box
                sx={{
                  p: 2,
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s',
                  '&:hover': { backgroundColor: '#f1f5f9' },
                }}
              >
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {t.tenderId}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 0.5, color: '#0f172a' }}>
                  {tender.tender_id}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s',
                  '&:hover': { backgroundColor: '#f1f5f9' },
                }}
              >
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {t.procuringEntity}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 0.5, color: '#334155' }}>
                  {tender.procuring_entity}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s',
                  '&:hover': { backgroundColor: '#f1f5f9' },
                }}
              >
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {t.bidderName}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 0.5, color: '#334155' }}>
                  {tender.bidder}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  backgroundColor: '#fff1f2',
                  borderRadius: '12px',
                  border: '1px solid #ffe4e6',
                  transition: 'all 0.2s',
                }}
              >
                <Typography variant="caption" sx={{ color: '#e11d48', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {t.submissionDeadline}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mt: 0.5, color: '#be123c' }}>
                  {tender.submission_deadline}
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};
