import React, { useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import {
  UploadFile as UploadFileIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  Person as PersonIcon,
  FlashOn as DemoIcon,
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
    // Reset so same file can be reloaded if needed
    e.target.value = '';
  };

  return (
    <Card elevation={1} sx={{ mb: 3, border: '1px solid #e2e8f0' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AssignmentIcon color="primary" sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {t.tenderDetails}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tender ? `${tender.tender_id} - ${tender.title}` : t.uploadRequirementsHint}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
            >
              {t.loadRequirements}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<DemoIcon />}
              onClick={onLoadSample}
            >
              {language === 'en' ? 'Load Sample Data' : 'স্যাম্পল ডেটা লোড'}
            </Button>
          </Box>
        </Box>

        {tender && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
                gap: 2,
              }}
            >
              <Box sx={{ p: 1.5, backgroundColor: '#f8fafc', borderRadius: 1.5, border: '1px solid #f1f5f9' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AssignmentIcon fontSize="inherit" /> {t.tenderId}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.5, color: '#0f2942' }}>
                  {tender.tender_id}
                </Typography>
              </Box>

              <Box sx={{ p: 1.5, backgroundColor: '#f8fafc', borderRadius: 1.5, border: '1px solid #f1f5f9' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <BusinessIcon fontSize="inherit" /> {t.procuringEntity}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 0.5 }}>
                  {tender.procuring_entity}
                </Typography>
              </Box>

              <Box sx={{ p: 1.5, backgroundColor: '#f8fafc', borderRadius: 1.5, border: '1px solid #f1f5f9' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PersonIcon fontSize="inherit" /> {t.bidderName}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 0.5 }}>
                  {tender.bidder}
                </Typography>
              </Box>

              <Box sx={{ p: 1.5, backgroundColor: '#fef2f2', borderRadius: 1.5, border: '1px solid #fee2e2' }}>
                <Typography variant="caption" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
                  <EventIcon fontSize="inherit" /> {t.submissionDeadline}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.5, color: '#b91c1c' }}>
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
