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
  Clear as ClearIcon,
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

  // Set of currently matched file IDs
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
          <Tooltip title={row.statusExplanation}>
            <Chip
              icon={<OkIcon />}
              label={t.statusOk}
              color="success"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Tooltip>
        );
      case 'Missing':
        return (
          <Tooltip title={row.statusExplanation}>
            <Chip
              icon={<ErrorIcon />}
              label={t.statusMissing}
              color="error"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Tooltip>
        );
      case 'Expiry date needed':
        return (
          <Tooltip title={row.statusExplanation}>
            <Chip
              icon={<WarningIcon />}
              label={t.statusExpiryNeeded}
              color="warning"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Tooltip>
        );
      case 'Expired':
        return (
          <Tooltip title={row.statusExplanation}>
            <Chip
              icon={<ErrorIcon />}
              label={t.statusExpired}
              color="error"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Tooltip>
        );
      case 'Not provided':
        return (
          <Tooltip title={row.statusExplanation}>
            <Chip
              icon={<HelpIcon />}
              label={t.statusNotProvided}
              color="default"
              size="small"
              variant="outlined"
            />
          </Tooltip>
        );
      default:
        return null;
    }
  };

  return (
    <Card elevation={1} sx={{ mb: 3, border: '1px solid #e2e8f0' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t.requirementsChecklist}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {language === 'en'
                ? 'Match uploaded PDFs to required items and verify compliance'
                : 'প্রয়োজনীয় নথির সাথে আপলোড করা ফাইল যুক্ত করুন এবং যাচাই করুন'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              startIcon={<AutoFixIcon />}
              onClick={onAutoMatch}
              disabled={files.length === 0}
            >
              {t.autoMatch}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ClearIcon />}
              onClick={onClearMatches}
            >
              {t.clearMatches}
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 700, width: '60px' }}>{t.order}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t.documentRequirement}</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '110px' }}>{t.type}</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: '240px' }}>{t.matchedFile}</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: '160px' }}>{t.expiryDate}</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '160px' }}>{t.status}</TableCell>
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
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>{row.requirement.order}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {altTitle} ({row.requirement.id})
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {row.requirement.mandatory ? (
                        <Chip label={t.mandatory} color="primary" size="small" variant="filled" />
                      ) : (
                        <Chip label={t.optional} size="small" variant="outlined" />
                      )}
                    </TableCell>

                    <TableCell>
                      <FormControl fullWidth size="small">
                        <Select
                          value={row.matchedFileId || ''}
                          displayEmpty
                          onChange={(e) =>
                            onMatchChange(row.requirement.id, e.target.value === '' ? null : e.target.value)
                          }
                          sx={{ fontSize: '0.875rem' }}
                        >
                          <MenuItem value="">
                            <em>{t.selectFile}</em>
                          </MenuItem>
                          {files.map((file) => {
                            // Section 4.3 & 4.6:
                            // Check if file is already matched to another requirement
                            const isMatchedElsewhere =
                              matchedFileIds.has(file.id) && row.matchedFileId !== file.id;

                            // Check duplicate content: If identical content is matched to another requirement,
                            // Rule 4.6 says: "Do not allow them to be matched to different documents."
                            const isDuplicateMatchedElsewhere =
                              matchedHashes.has(file.hash) &&
                              (!row.matchedFileId ||
                                files.find((f) => f.id === row.matchedFileId)?.hash !== file.hash);

                            const isDisabled = isMatchedElsewhere || isDuplicateMatchedElsewhere;

                            let label = file.name;
                            if (file.pageCount > 0) label += ` (${file.pageCount}p)`;
                            if (isMatchedElsewhere) label += ' [Already matched]';
                            else if (isDuplicateMatchedElsewhere) label += ' [Duplicate content matched elsewhere]';

                            return (
                              <MenuItem key={file.id} value={file.id} disabled={isDisabled}>
                                {label}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </TableCell>

                    <TableCell>
                      {row.requirement.has_expiry ? (
                        <TextField
                          type="date"
                          size="small"
                          fullWidth
                          value={row.expiryDate}
                          onChange={(e) => onExpiryDateChange(row.requirement.id, e.target.value)}
                          disabled={!row.matchedFileId}
                          InputLabelProps={{ shrink: true }}
                          placeholder="YYYY-MM-DD"
                          sx={{ fontSize: '0.85rem' }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.disabled">
                          {language === 'en' ? 'Not Applicable' : 'প্রযোজ্য নয়'}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>{getStatusChip(row)}</TableCell>
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
