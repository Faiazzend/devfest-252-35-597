import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  SaveAlt as SaveIcon,
  FileUpload as LoadIcon,
  Assessment as CsvIcon,
  SmartToy as AiIcon,
  Create as SignatureIcon,
  Description as DocIcon,
} from '@mui/icons-material';
import { Language, translations } from '../i18n';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onSaveProject: () => void;
  onLoadProject: () => void;
  onExportCsv: () => void;
  onOpenSealDialog: () => void;
  onOpenAiDialog: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  onSaveProject,
  onLoadProject,
  onExportCsv,
  onOpenSealDialog,
  onOpenAiDialog,
}) => {
  const t = translations[language];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: '#090d16',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 }, py: 1.2 }}>
        {/* App Branding */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
              color: '#ffffff',
            }}
          >
            <DocIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.05rem', sm: '1.25rem' },
                letterSpacing: '-0.02em',
                color: '#ffffff',
                lineHeight: 1.2,
              }}
            >
              {t.appTitle}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#94a3b8',
                fontSize: '0.78rem',
                display: { xs: 'none', sm: 'block' },
                mt: 0.2,
              }}
            >
              {t.appSubtitle}
            </Typography>
          </Box>
        </Box>

        {/* Right Navigation & Language Switch */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, flexWrap: 'nowrap' }}>
          {/* Quick Project Utility Actions */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            <Tooltip title={t.saveProject} arrow>
              <Button
                size="small"
                variant="text"
                startIcon={<SaveIcon sx={{ fontSize: 18 }} />}
                onClick={onSaveProject}
                sx={{
                  color: '#cbd5e1',
                  px: 1.5,
                  py: 0.6,
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#ffffff' },
                }}
              >
                {language === 'en' ? 'Save Project' : 'সংরক্ষণ'}
              </Button>
            </Tooltip>

            <Tooltip title={t.loadProject} arrow>
              <Button
                size="small"
                variant="text"
                startIcon={<LoadIcon sx={{ fontSize: 18 }} />}
                onClick={onLoadProject}
                sx={{
                  color: '#cbd5e1',
                  px: 1.5,
                  py: 0.6,
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#ffffff' },
                }}
              >
                {language === 'en' ? 'Open' : 'লোড'}
              </Button>
            </Tooltip>

            <Tooltip title={t.exportChecklistCsv} arrow>
              <Button
                size="small"
                variant="text"
                startIcon={<CsvIcon sx={{ fontSize: 18 }} />}
                onClick={onExportCsv}
                sx={{
                  color: '#cbd5e1',
                  px: 1.5,
                  py: 0.6,
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#ffffff' },
                }}
              >
                CSV
              </Button>
            </Tooltip>

            <Tooltip title={t.sealSignature} arrow>
              <Button
                size="small"
                variant="text"
                startIcon={<SignatureIcon sx={{ fontSize: 18 }} />}
                onClick={onOpenSealDialog}
                sx={{
                  color: '#cbd5e1',
                  px: 1.5,
                  py: 0.6,
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#ffffff' },
                }}
              >
                {language === 'en' ? 'Seal / Stamp' : 'সিল / স্বাক্ষর'}
              </Button>
            </Tooltip>

            <Tooltip title={t.aiHelp} arrow>
              <IconButton
                size="small"
                onClick={onOpenAiDialog}
                sx={{
                  color: '#93c5fd',
                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  borderRadius: '8px',
                  p: 0.8,
                  '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.25)', color: '#bfdbfe' },
                }}
              >
                <AiIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* High-Visibility Modern Pill Language Switcher */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              p: '3px',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)',
            }}
          >
            <Button
              onClick={() => onLanguageChange('en')}
              disableElevation
              sx={{
                px: 1.8,
                py: 0.4,
                minWidth: 'unset',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: language === 'en' ? 700 : 500,
                textTransform: 'none',
                backgroundColor: language === 'en' ? '#ffffff' : 'transparent',
                color: language === 'en' ? '#0f172a' : '#cbd5e1',
                boxShadow: language === 'en' ? '0 2px 6px rgba(0,0,0,0.2)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: language === 'en' ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
                  color: language === 'en' ? '#0f172a' : '#ffffff',
                },
              }}
            >
              English
            </Button>
            <Button
              onClick={() => onLanguageChange('bn')}
              disableElevation
              sx={{
                px: 1.8,
                py: 0.4,
                minWidth: 'unset',
                borderRadius: '9999px',
                fontFamily: '"Hind Siliguri", "Roboto", sans-serif',
                fontSize: '0.88rem',
                fontWeight: language === 'bn' ? 700 : 500,
                textTransform: 'none',
                backgroundColor: language === 'bn' ? '#ffffff' : 'transparent',
                color: language === 'bn' ? '#0f172a' : '#cbd5e1',
                boxShadow: language === 'bn' ? '0 2px 6px rgba(0,0,0,0.2)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: language === 'bn' ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
                  color: language === 'bn' ? '#0f172a' : '#ffffff',
                },
              }}
            >
              বাংলা
            </Button>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
