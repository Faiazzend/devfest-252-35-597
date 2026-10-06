import React, { useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Slider,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import { SealConfig } from '../types';
import { Language, translations } from '../i18n';

interface SealDialogProps {
  open: boolean;
  onClose: () => void;
  config: SealConfig;
  onConfigChange: (config: SealConfig) => void;
  language: Language;
}

export const SealDialog: React.FC<SealDialogProps> = ({
  open,
  onClose,
  config,
  onConfigChange,
  language,
}) => {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.png') && file.type !== 'image/png') {
      alert(language === 'en' ? 'Please upload a PNG file with transparency.' : 'অনুগ্রহ করে একটি পিএনজি (PNG) ফাইল আপলোড করুন।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      onConfigChange({
        ...config,
        file,
        dataUrl: event.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onConfigChange({
      ...config,
      file: null,
      dataUrl: null,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {t.sealSignature}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {language === 'en'
            ? 'Upload an authorized company seal or signature image (PNG format) to stamp onto generated tender pages.'
            : 'টেন্ডার প্যাকেজের পৃষ্ঠাগুলোতে সিল ও স্বাক্ষর যুক্ত করতে একটি পিএনজি (PNG) ইমেজ আপলোড করুন।'}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <input
            type="file"
            accept=".png,image/png"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => fileInputRef.current?.click()}
            >
              {t.uploadSeal}
            </Button>
            {config.file && (
              <Button color="error" size="small" onClick={handleRemove}>
                {language === 'en' ? 'Remove Image' : 'মুছে ফেলুন'}
              </Button>
            )}
          </Box>

          {config.dataUrl && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                border: '1px solid #e2e8f0',
                borderRadius: 2,
                textAlign: 'center',
                backgroundColor: '#f8fafc',
              }}
            >
              <img
                src={config.dataUrl}
                alt="Uploaded Seal"
                style={{ maxHeight: 90, objectFit: 'contain', opacity: config.opacity }}
              />
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                {config.file?.name}
              </Typography>
            </Box>
          )}
        </Box>

        {config.file && (
          <>
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                {t.sealPlacement}
              </FormLabel>
              <RadioGroup
                row
                value={config.placement}
                onChange={(e) =>
                  onConfigChange({ ...config, placement: e.target.value as any })
                }
              >
                <FormControlLabel value="cover" control={<Radio size="small" />} label={t.coverOnly} />
                <FormControlLabel value="all" control={<Radio size="small" />} label={t.allPages} />
                <FormControlLabel value="last" control={<Radio size="small" />} label={t.lastPage} />
              </RadioGroup>
            </FormControl>

            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                {t.position}
              </FormLabel>
              <RadioGroup
                row
                value={config.position}
                onChange={(e) =>
                  onConfigChange({ ...config, position: e.target.value as any })
                }
              >
                <FormControlLabel value="bottom-right" control={<Radio size="small" />} label={t.bottomRight} />
                <FormControlLabel value="bottom-left" control={<Radio size="small" />} label={t.bottomLeft} />
                <FormControlLabel value="top-right" control={<Radio size="small" />} label={t.topRight} />
              </RadioGroup>
            </FormControl>

            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {language === 'en' ? 'Opacity' : 'স্বচ্ছতা'} ({Math.round(config.opacity * 100)}%)
              </Typography>
              <Slider
                size="small"
                value={config.opacity}
                min={0.2}
                max={1.0}
                step={0.05}
                onChange={(_, val) => onConfigChange({ ...config, opacity: val as number })}
              />
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          {language === 'en' ? 'Done' : 'সম্পন্ন'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
