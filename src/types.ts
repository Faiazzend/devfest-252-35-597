export interface TenderInfo {
  tender_id: string;
  title: string;
  procuring_entity: string;
  bidder: string;
  submission_deadline: string; // YYYY-MM-DD
}

export interface Requirement {
  id: string;
  order: number;
  title_en: string;
  title_bn: string;
  mandatory: boolean;
  has_expiry: boolean;
}

export interface RequirementsData {
  tender: TenderInfo;
  requirements: Requirement[];
}

export interface UploadedPdf {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  hash: string;
  isDuplicate: boolean;
  duplicateGroup?: string[];
  error?: string;
  arrayBuffer?: ArrayBuffer;
}

export type DocumentStatus = 'OK' | 'Missing' | 'Expiry date needed' | 'Expired' | 'Not provided';

export interface DocumentRowState {
  requirement: Requirement;
  matchedFileId: string | null;
  expiryDate: string; // YYYY-MM-DD
  status: DocumentStatus;
  isBlocking: boolean;
  statusExplanation: string;
}

export interface SealConfig {
  file: File | null;
  dataUrl: string | null;
  placement: 'cover' | 'all' | 'last';
  position: 'bottom-right' | 'bottom-left' | 'top-right';
  opacity: number;
}
