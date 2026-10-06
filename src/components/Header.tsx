import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  ButtonGroup,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Translate as TranslateIcon,
  SaveAlt as SaveIcon,
  FileUpload as LoadIcon,
  Assessment as CsvIcon,
  SmartToy as AiIcon,
  Create as SignatureIcon,
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
    <AppBar position="sticky" elevation={2} sx={{ backgroundColor: '#0f2942' }}>
      <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap', py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1.5,
              backgroundColor: '#1976d2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.2rem',
            }}
          >
            T
          </Box>
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {t.appTitle}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              {t.appSubtitle}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: { xs: 1, md: 0 } }}>
          {/* Quick Actions */}
          <Tooltip title={t.saveProject}>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<SaveIcon />}
              onClick={onSaveProject}
              sx={{ borderColor: '#334155' }}
            >
              {language === 'en' ? 'Save' : 'সংরক্ষণ'}
            </Button>
          </Tooltip>

          <Tooltip title={t.loadProject}>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<LoadIcon />}
              onClick={onLoadProject}
              sx={{ borderColor: '#334155' }}
            >
              {language === 'en' ? 'Load' : 'লোড'}
            </Button>
          </Tooltip>

          <Tooltip title={t.exportChecklistCsv}>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<CsvIcon />}
              onClick={onExportCsv}
              sx={{ borderColor: '#334155' }}
            >
              CSV
            </Button>
          </Tooltip>

          <Tooltip title={t.sealSignature}>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<SignatureIcon />}
              onClick={onOpenSealDialog}
              sx={{ borderColor: '#334155' }}
            >
              {language === 'en' ? 'Seal' : 'সিল'}
            </Button>
          </Tooltip>

          <Tooltip title={t.aiHelp}>
            <IconButton color="inherit" onClick={onOpenAiDialog} sx={{ ml: 0.5 }}>
              <AiIcon />
            </IconButton>
          </Tooltip>

          {/* Language Switch */}
          <ButtonGroup variant="contained" size="small" sx={{ ml: 1 }}>
            <Button
              variant={language === 'en' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => onLanguageChange('en')}
              sx={{ fontWeight: language === 'en' ? 700 : 400 }}
            >
              EN
            </Button>
            <Button
              variant={language === 'bn' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => onLanguageChange('bn')}
              sx={{ fontWeight: language === 'bn' ? 700 : 400 }}
            >
              বাং
            </Button>
          </ButtonGroup>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
