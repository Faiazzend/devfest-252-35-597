import React from 'react';
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
  Select,
  MenuItem,
  FormControl,
  TextField,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as OkIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  HelpOutline as HelpIcon,
  AutoFixHigh as AutoFixIcon,
  RestartAlt as ClearIcon,
  Checklist as ChecklistIcon,
} from '@mui/icons-material';
import { DocumentRowState, UploadedPdf } from '../types';
import { Language, translations } from '../i18n';

interface RequirementsTableProps {
  rows: DocumentRowState[];
  files: UploadedPdf[];
  language: Language;
  onMatchChange: (requirementId: string, fileId: string | null) => void;
  onExpiryDateChange: (requirementId: string, date: string) => void;
  onAutoMatch: () => void;
  onClearMatches: () => void;
}

export const RequirementsTable: React.FC<RequirementsTableProps> = ({
  rows,
  files,
  language,
  onMatchChange,
  onExpiryDateChange,
  onAutoMatch,
  onClearMatches,
}) => {
  const t = translations[language];

  const matchedFileIds = new Set<string>();
  const matchedHashes = new Set<string>();

  for (const r of rows) {
    if (r.matchedFileId) {
      matchedFileIds.add(r.matchedFileId);
      const f = files.find((file) => file.id === r.matchedFileId);
      if (f) matchedHashes.add(f.hash);
    }
  }

  const getStatusChip = (row: DocumentRowState) => {
    switch (row.status) {
      case 'OK':
        return (
          <Tooltip title={row.statusExplanation} arrow>
            <Chip
              icon={<OkIcon sx={{ fontSize: '15px !important', color: '#059669 !important' }} />}
              label={t.statusOk}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.78rem',
                backgroundColor: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                px: 0.5,
              }}
            />
          </Tooltip>
        );
      case 'Missing':
        return (
          <Tooltip title={row.statusExplanation} arrow>
            <Chip
              icon={<ErrorIcon sx={{ fontSize: '15px !important', color: '#dc2626 !important' }} />}
              label={t.statusMissing}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.78rem',
                backgroundColor: '#fff1f2',
                color: '#be123c',
                border: '1px solid #fecdd3',
                borderRadius: '8px',
                px: 0.5,
              }}
            />
          </Tooltip>
        );
      case 'Expiry date needed':
        return (
          <Tooltip title={row.statusExplanation} arrow>
            <Chip
              icon={<WarningIcon sx={{ fontSize: '15px !important', color: '#d97706 !important' }} />}
              label={t.statusExpiryNeeded}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.78rem',
                backgroundColor: '#fffbeb',
                color: '#b45309',
                border: '1px solid #fde68a',
                borderRadius: '8px',
                px: 0.5,
              }}
            />
          </Tooltip>
        );
      case 'Expired':
        return (
          <Tooltip title={row.statusExplanation} arrow>
            <Chip
              icon={<ErrorIcon sx={{ fontSize: '15px !important', color: '#b91c1c !important' }} />}
              label={t.statusExpired}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.78rem',
                backgroundColor: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                px: 0.5,
              }}
            />
          </Tooltip>
        );
      case 'Not provided':
        return (
          <Tooltip title={`${row.statusExplanation} (${t.optionalDocSkippedHint})`} arrow>
            <Chip
              icon={<HelpIcon sx={{ fontSize: '15px !important', color: '#64748b !important' }} />}
              label={t.statusNotProvided}
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: '0.76rem',
                backgroundColor: '#f8fafc',
                color: '#64748b',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                px: 0.5,
              }}
            />
          </Tooltip>
        );
      default:
        return null;
    }
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
            mb: 2.5,
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                backgroundColor: '#f0fdf4',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #dcfce7',
              }}
            >
              <ChecklistIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>
                {t.requirementsChecklist}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                {language === 'en'
                  ? 'Verify compliance, match documents 1:1, and manage expiry deadlines'
                  : 'প্রয়োজনীয় নথির সাথে আপলোড করা ফাইল যুক্ত করুন এবং যাচাই করুন'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.2 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<AutoFixIcon />}
              onClick={onAutoMatch}
              disabled={files.length === 0}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.84rem',
                px: 2,
                py: 0.7,
                background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4338ca 0%, #312e81 100%)',
                },
              }}
            >
              {t.autoMatch}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ClearIcon />}
              onClick={onClearMatches}
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
              {t.clearMatches}
            </Button>
          </Box>
        </Box>

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            overflow: 'auto',
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, backgroundColor: '#f8fafc', color: '#475569', width: '65px', py: 1.3 }}>{t.order}</TableCell>
                <TableCell sx={{ fontWeight: 700, backgroundColor: '#f8fafc', color: '#475569', py: 1.3 }}>{t.documentRequirement}</TableCell>
                <TableCell sx={{ fontWeight: 700, backgroundColor: '#f8fafc', color: '#475569', width: '115px', py: 1.3 }}>{t.type}</TableCell>
                <TableCell sx={{ fontWeight: 700, backgroundColor: '#f8fafc', color: '#475569', minWidth: '250px', py: 1.3 }}>{t.matchedFile}</TableCell>
                <TableCell sx={{ fontWeight: 700, backgroundColor: '#f8fafc', color: '#475569', minWidth: '165px', py: 1.3 }}>{t.expiryDate}</TableCell>
                <TableCell sx={{ fontWeight: 700, backgroundColor: '#f8fafc', color: '#475569', width: '175px', py: 1.3 }}>{t.status}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const title = language === 'bn' ? row.requirement.title_bn : row.requirement.title_en;
                const altTitle = language === 'bn' ? row.requirement.title_en : row.requirement.title_bn;

                return (
                  <TableRow
                    key={row.requirement.id}
                    hover
                    sx={{
                      backgroundColor: row.isBlocking ? '#fffafb' : 'inherit',
                      '&:last-child td': { borderBottom: 0 },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700, color: '#334155', py: 1.4 }}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '6px',
                          backgroundColor: '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: '#475569',
                        }}
                      >
                        {row.requirement.order}
                      </Box>
                    </TableCell>

                    <TableCell sx={{ py: 1.4 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        {title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.76rem' }}>
                        {altTitle} • <span style={{ fontFamily: 'monospace' }}>{row.requirement.id}</span>
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ py: 1.4 }}>
                      {row.requirement.mandatory ? (
                        <Chip
                          label={t.mandatory}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            backgroundColor: '#dbeafe',
                            color: '#1d4ed8',
                            borderRadius: '6px',
                          }}
                        />
                      ) : (
                        <Chip
                          label={t.optional}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            backgroundColor: '#f1f5f9',
                            color: '#64748b',
                            borderRadius: '6px',
                          }}
                        />
                      )}
                    </TableCell>

                    <TableCell sx={{ py: 1.4 }}>
                      <FormControl fullWidth size="small">
                        <Select
                          value={row.matchedFileId || ''}
                          displayEmpty
                          onChange={(e) =>
                            onMatchChange(row.requirement.id, e.target.value === '' ? null : e.target.value)
                          }
                          sx={{
                            fontSize: '0.84rem',
                            borderRadius: '8px',
                            backgroundColor: row.matchedFileId ? '#f8fafc' : '#ffffff',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#e2e8f0',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#cbd5e1',
                            },
                          }}
                        >
                          <MenuItem value="">
                            <em style={{ color: '#94a3b8', fontStyle: 'normal' }}>{t.selectFile}</em>
                          </MenuItem>
                          {files.map((file) => {
                            const isMatchedElsewhere =
                              matchedFileIds.has(file.id) && row.matchedFileId !== file.id;

                            const isDuplicateMatchedElsewhere =
                              matchedHashes.has(file.hash) &&
                              (!row.matchedFileId ||
                                files.find((f) => f.id === row.matchedFileId)?.hash !== file.hash);

                            const isDisabled = isMatchedElsewhere || isDuplicateMatchedElsewhere;

                            let label = file.name;
                            if (file.pageCount > 0) label += ` (${file.pageCount}p)`;
                            if (isMatchedElsewhere) label += ' [Assigned]';
                            else if (isDuplicateMatchedElsewhere) label += ' [Duplicate content assigned]';

                            return (
                              <MenuItem key={file.id} value={file.id} disabled={isDisabled} sx={{ fontSize: '0.84rem' }}>
                                {label}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </TableCell>

                    <TableCell sx={{ py: 1.4 }}>
                      {row.requirement.has_expiry ? (
                        <TextField
                          type="date"
                          size="small"
                          fullWidth
                          value={row.expiryDate}
                          onChange={(e) => onExpiryDateChange(row.requirement.id, e.target.value)}
                          disabled={!row.matchedFileId}
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              fontSize: '0.84rem',
                              backgroundColor: row.matchedFileId ? '#ffffff' : '#f8fafc',
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#e2e8f0',
                            },
                          }}
                        />
                      ) : (
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                          {language === 'en' ? 'No expiry required' : 'মেয়াদ প্রযোজ্য নয়'}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell sx={{ py: 1.4 }}>{getStatusChip(row)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};
