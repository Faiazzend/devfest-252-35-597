# Tender Document Package Builder

**AI DevFest Vibe-Coding Contest 2026**  
**Participant Name:** Faiaz (`Faiazzend`)  
**Participant Registration Number:** `252-35-597`  
**GitHub Repository:** [https://github.com/Faiazzend/devfest-252-35-597](https://github.com/Faiazzend/devfest-252-35-597)  
**Public HTTPS Live Link:** [https://faiazzend.github.io/devfest-252-35-597/](https://faiazzend.github.io/devfest-252-35-597/)  
**License:** MIT License  

---

## 1. Overview & Problem Solved
When submitting bids for organizational tenders, vendors must assemble complex multi-document packages (Trade License, TIN, VAT, Bank Solvency, Proposals, Declarations, etc.) with strict order, expiry date validations, and no duplicate files.

**Tender Document Package Builder** is a client-side (frontend-only) web application built to streamline and error-proof this process:
- Parses `requirements.json` and loads required document metadata and deadlines.
- Accepts bulk PDF file uploads, computes cryptographic hashes (SHA-256) to detect duplicate contents across different filenames, and inspects page counts and integrity.
- Provides 1:1 matching with real-time status validation (Missing, Expiry date needed, Expired, Not provided, OK).
- Assembles a unified, publication-ready PDF submission package containing an elegant Cover Page, dynamic Index Directory, preserved multi-page documents in exact order, and consistent standard footers (`<tender_id> | Page X of Y`).

---

## 2. Main Features Implemented
1. **Load Requirements List (Section 4.1):** Upload `requirements.json` to extract tender details (Tender ID, Title, Procuring Entity, Bidder, Submission Deadline) and document requirements sorted by order.
2. **Bulk File Upload & Validation (Section 4.2):**
   - Multi-file drag-and-drop zone.
   - Non-PDF files (e.g. `.png`, `.docx`) are rejected with clear warnings.
   - Accurately counts pages for each PDF file.
   - Files can be removed individually at any time.
3. **1:1 Document Matching (Section 4.3):**
   - One document gets at most one file; one file goes to at most one document.
   - Matches can be updated or undone at any time.
4. **Expiry Date Validation (Section 4.4 & Section 5):**
   - Documents with `has_expiry = true` prompt for an expiry date.
   - Immediate evaluation against `submission_deadline`.
   - If expiry is on or after deadline, marked as **OK**. If before, marked as **Expired** (blocking).
5. **Real-time Status Engine (Section 4.5 & Section 5):**
   - `Missing`: Mandatory document without file (Blocking).
   - `Expiry date needed`: File matched, but date not entered (Blocking).
   - `Expired`: Expiry date is before submission deadline (Blocking).
   - `Not provided`: Optional document without file (Non-blocking).
   - `OK`: File matched and compliant (Non-blocking).
6. **Duplicate Content Detection (Section 4.6):**
   - Uses Web Crypto API SHA-256 hashing on raw ArrayBuffer bytes to identify identical files even when renamed (e.g., `experience_cert.pdf` vs `experience_cert (1).pdf`).
   - Prevents matching duplicate files to different requirements.
7. **Package Generation & Download (Section 4.7 & 4.8):**
   - "Generate Package" button remains disabled with clear itemized explanations whenever any blocking issue exists.
   - Downloads finalized PDF named `<tender_id>_Package.pdf`.
8. **Bilingual Support (Section 4.9 & 5.6):**
   - Instant language toggle between **English** and **Bangla (বাংলা)**.
   - All labels, buttons, notifications, statuses, and instructions fully translated.
   - Displays requirement titles dynamically from `title_en` or `title_bn`.
   - Persists language selection in `localStorage`.
9. **Package Rules Compliance (Section 6):**
   - **Page 1 Cover Page (English):** Tender ID, Tender Title, Procuring Entity, Bidder Name, Submission Deadline, Generation Date, and ordered list of included documents.
   - **Document Order:** Merged in exact ascending order; skips optional documents with no file.
   - **Footers:** Every single page (cover, index, documents) contains `<tender_id> | Page X of Y` in a legible, non-obstructive bar.

---

## 3. Bonus Features Implemented
- **Index Page (Page 2):** Lists included documents with their exact starting page numbers and total pages.
- **Bengali Typography on Cover/Index:** High-fidelity Bengali rendering via HTML5 Canvas rasterization into PDF to ensure proper Bangla conjuncts without font corruption.
- **Auto-Match:** Heuristic keyword matching algorithm suggests matches based on uploaded file names.
- **Company Seal / Signature Stamping:** Upload a transparent PNG seal/signature and choose placement (Cover, All Pages, Last Page) and position (Bottom-Right, Bottom-Left, Top-Right) with adjustable opacity.
- **Export Checklist (CSV):** Download structured CSV summary containing Document Name, File Name, Pages, Expiry Date, and Status.
- **Save and Reopen Project:** Export current session to `.json` file and reload anytime; also automatically auto-saves to browser `localStorage`.
- **Safe Handling of Corrupted Files:** Gracefully catches password-protected or corrupted PDFs and alerts user without crashing.
- **AI Tender Assistant:** Settings dialog allowing user to supply their own Gemini API key (stored securely in browser only) to run compliance audits.

---

## 4. How to Run the App Locally

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Steps
```bash
# Clone the repository
git clone https://github.com/<your-username>/devfest-252-35-597.git
cd devfest-252-35-597

# Install dependencies
npm install

# Start local development server
npm run dev

# Or build for production preview
npm run build
npm run preview
```
Open `http://localhost:5173/` in Google Chrome.

---

## 5. Known Problems
- Scanned documents without machine-readable text require the user to inspect the PDF manually and input the expiry date into the input field (handled seamlessly by the UI).

---

## 6. AI Tools Used
- Google Antigravity / Gemini 3.8 Flash (High) AI pair-programming assistant.

---

## 7. Most Useful Prompt
> *"Build the Tender Document Package Builder web application adhering to AI DevFest 2026 rules: frontend-only React + TypeScript + Material UI app that parses requirements.json, computes SHA-256 hashes to detect identical files across different names, enforces strict 1:1 matching and expiry date validation against submission deadline, generates a merged PDF with English cover page, index directory, and '<tender_id> | Page X of Y' footers, and supports seamless English/Bangla bilingual toggling."*
