import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Paper,
} from '@mui/material';
import { Close as CloseIcon, AutoAwesome as SparklesIcon } from '@mui/icons-material';
import { DocumentRowState, TenderInfo } from '../types';
import { Language, translations } from '../i18n';

interface AiHelpDialogProps {
  open: boolean;
  onClose: () => void;
  tender: TenderInfo | null;
  rows: DocumentRowState[];
  language: Language;
}

export const AiHelpDialog: React.FC<AiHelpDialogProps> = ({
  open,
  onClose,
  tender,
  rows,
  language,
}) => {
  const t = translations[language];
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('user_ai_api_key') || '');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSaveKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('user_ai_api_key', key);
  };

  const handleAnalyze = async () => {
    if (!apiKey) {
      setError(language === 'en' ? 'Please provide your API key first.' : 'অনুগ্রহ করে প্রথমে আপনার এপিআই কি প্রদান করুন।');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    const summaryData = {
      tender: tender,
      documents: rows.map((r) => ({
        id: r.requirement.id,
        title: r.requirement.title_en,
        mandatory: r.requirement.mandatory,
        hasExpiry: r.requirement.has_expiry,
        matchedFile: r.matchedFileId,
        expiryDate: r.expiryDate,
        status: r.status,
      })),
    };

    const promptText = `You are an expert Tender Procurement Consultant. Analyze the following tender submission checklist and point out any compliance risks, missing mandatory documents, or advice for bidder:
${JSON.stringify(summaryData, null, 2)}

Provide a concise, bulleted assessment in ${language === 'bn' ? 'Bengali (বাংলা)' : 'English'}.`;

    try {
      // Call Google Gemini API (gemini-1.5-flash) using user's provided key
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
          }),
        }
      );

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `API error: HTTP ${res.status}`);
      }

      const data = await res.json();
      const output = data.candidates?.[0]?.content?.parts?.[0]?.text;
      setResponse(output || 'No response generated.');
    } catch (err: any) {
      setError(err.message || 'Failed to communicate with AI API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SparklesIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {t.aiHelp}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 2 }}>
          {language === 'en'
            ? 'In accordance with Rulebook Section 5.5, users must provide their own API key. Keys are never embedded in source code and are saved only in your local browser storage.'
            : 'নিয়মাবলীর ৫.৫ ধারা অনুযায়ী, ব্যবহারকারীকে নিজস্ব এপিআই কি ব্যবহার করতে হবে। কি কখনই সোর্স কোডে রাখা হয় না, শুধুমাত্র আপনার ব্রাউজারে সংরক্ষিত থাকে।'}
        </Alert>

        <Box sx={{ mb: 3 }}>
          <TextField
            label={t.aiApiKey}
            type="password"
            fullWidth
            size="small"
            value={apiKey}
            onChange={(e) => handleSaveKey(e.target.value)}
            placeholder="AIzaSy..."
            helperText={language === 'en' ? 'Stored locally in your browser' : 'শুধুমাত্র আপনার ব্রাউজারে সংরক্ষিত'}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleAnalyze}
            disabled={loading || !tender}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SparklesIcon />}
          >
            {loading ? (language === 'en' ? 'Analyzing...' : 'বিশ্লেষণ হচ্ছে...') : t.askAi}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {response && (
          <Paper sx={{ p: 2, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#0f2942' }}>
              {language === 'en' ? 'AI Compliance Analysis:' : 'এআই চেকলিস্ট বিশ্লেষণ:'}
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {response}
            </Typography>
          </Paper>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          {language === 'en' ? 'Close' : 'বন্ধ করুন'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
