import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

async function generateSamplePackage() {
  const reqData = JSON.parse(fs.readFileSync('sample-pack/requirements.json', 'utf8'));
  const tender = reqData.tender;

  const resolvedMatches = [
    { id: 'R01', file: 'trade_license_2026.pdf', expiry: '2027-06-30' },
    { id: 'R02', file: '03_tin_certificate.pdf', expiry: '' },
    { id: 'R03', file: '04_vat_certificate.pdf', expiry: '' },
    { id: 'R04', file: 'bank_solvency.pdf', expiry: '2026-12-31' },
    { id: 'R05', file: 'experience_cert.pdf', expiry: '' },
    { id: 'R08', file: '02_technical_proposal.pdf', expiry: '' },
    { id: 'R09', file: '01_financial_proposal.pdf', expiry: '' },
    { id: 'R10', file: 'scan_0042.pdf', expiry: '' },
  ];

  const mergedPdf = await PDFDocument.create();
  const helvetica = await mergedPdf.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 50;

  // 1. Cover Page
  const coverPage = mergedPdf.addPage([pageWidth, pageHeight]);

  coverPage.drawRectangle({
    x: 0,
    y: pageHeight - 120,
    width: pageWidth,
    height: 120,
    color: rgb(0.08, 0.25, 0.45),
  });

  coverPage.drawText('TENDER SUBMISSION PACKAGE', {
    x: margin,
    y: pageHeight - 65,
    size: 20,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });

  coverPage.drawText(`Tender ID: ${tender.tender_id}`, {
    x: margin,
    y: pageHeight - 95,
    size: 13,
    font: helvetica,
    color: rgb(0.85, 0.92, 1),
  });

  let cursorY = pageHeight - 150;
  const metaLabels = [
    { label: 'Tender Title:', value: tender.title },
    { label: 'Procuring Entity:', value: tender.procuring_entity },
    { label: 'Bidder Name:', value: tender.bidder },
    { label: 'Submission Deadline:', value: tender.submission_deadline },
    { label: 'Package Date:', value: '2026-10-06' },
  ];

  coverPage.drawRectangle({
    x: margin,
    y: cursorY - 125,
    width: pageWidth - 2 * margin,
    height: 135,
    color: rgb(0.96, 0.97, 0.98),
    borderColor: rgb(0.85, 0.88, 0.92),
    borderWidth: 1,
  });

  cursorY -= 15;
  for (const item of metaLabels) {
    coverPage.drawText(item.label, {
      x: margin + 15,
      y: cursorY,
      size: 10,
      font: helveticaBold,
      color: rgb(0.2, 0.25, 0.3),
    });
    coverPage.drawText(item.value, {
      x: margin + 160,
      y: cursorY,
      size: 10,
      font: helvetica,
      color: rgb(0.1, 0.1, 0.1),
    });
    cursorY -= 22;
  }

  cursorY -= 25;
  coverPage.drawText('LIST OF INCLUDED DOCUMENTS', {
    x: margin,
    y: cursorY,
    size: 12,
    font: helveticaBold,
    color: rgb(0.08, 0.25, 0.45),
  });

  cursorY -= 8;
  coverPage.drawLine({
    start: { x: margin, y: cursorY },
    end: { x: pageWidth - margin, y: cursorY },
    thickness: 1.5,
    color: rgb(0.08, 0.25, 0.45),
  });

  cursorY -= 20;
  coverPage.drawText('No.', { x: margin + 5, y: cursorY, size: 9, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) });
  coverPage.drawText('Document Name', { x: margin + 35, y: cursorY, size: 9, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) });
  coverPage.drawText('Requirement', { x: margin + 310, y: cursorY, size: 9, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) });
  coverPage.drawText('Status', { x: margin + 410, y: cursorY, size: 9, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) });

  cursorY -= 8;
  coverPage.drawLine({
    start: { x: margin, y: cursorY },
    end: { x: pageWidth - margin, y: cursorY },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });

  cursorY -= 16;
  const includedDocs = resolvedMatches.map((m) => {
    const req = reqData.requirements.find((r) => r.id === m.id);
    return { req, ...m };
  }).sort((a, b) => a.req.order - b.req.order);

  let docIndex = 1;
  for (const item of includedDocs) {
    coverPage.drawText(`${docIndex}.`, { x: margin + 5, y: cursorY, size: 9, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
    coverPage.drawText(item.req.title_en, { x: margin + 35, y: cursorY, size: 9, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
    coverPage.drawText(item.req.mandatory ? 'Mandatory' : 'Optional', { x: margin + 310, y: cursorY, size: 9, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
    coverPage.drawText('OK', { x: margin + 410, y: cursorY, size: 9, font: helvetica, color: rgb(0.1, 0.55, 0.2) });
    cursorY -= 19;
    docIndex++;
  }

  // 2. Index Page
  const indexPage = mergedPdf.addPage([pageWidth, pageHeight]);
  let idxY = pageHeight - 70;
  indexPage.drawText('DOCUMENT INDEX & DIRECTORY', {
    x: margin,
    y: idxY,
    size: 16,
    font: helveticaBold,
    color: rgb(0.08, 0.25, 0.45),
  });

  idxY -= 10;
  indexPage.drawLine({
    start: { x: margin, y: idxY },
    end: { x: pageWidth - margin, y: idxY },
    thickness: 1.5,
    color: rgb(0.08, 0.25, 0.45),
  });

  idxY -= 25;
  indexPage.drawText('Order', { x: margin + 5, y: idxY, size: 9, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) });
  indexPage.drawText('Document Title', { x: margin + 45, y: idxY, size: 9, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) });
  indexPage.drawText('File Attached', { x: margin + 260, y: idxY, size: 9, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) });
  indexPage.drawText('Pages', { x: margin + 410, y: idxY, size: 9, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) });
  indexPage.drawText('Start Page', { x: margin + 460, y: idxY, size: 9, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) });

  idxY -= 8;
  indexPage.drawLine({
    start: { x: margin, y: idxY },
    end: { x: pageWidth - margin, y: idxY },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });

  let currentPageNumber = 3; // Cover = 1, Index = 2
  const documentPageRanges = [];

  for (const item of includedDocs) {
    const filePath = path.join('sample-pack/documents', item.file);
    const fileBytes = fs.readFileSync(filePath);
    const srcDoc = await PDFDocument.load(fileBytes);
    const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());

    const startPage = currentPageNumber;
    for (const p of copiedPages) {
      mergedPdf.addPage(p);
      currentPageNumber++;
    }

    documentPageRanges.push({
      item,
      startPage,
      pageCount: copiedPages.length,
    });
  }

  // Draw index rows
  idxY -= 20;
  for (const range of documentPageRanges) {
    indexPage.drawText(`${range.item.req.order}`, { x: margin + 10, y: idxY, size: 9, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
    indexPage.drawText(range.item.req.title_en, { x: margin + 45, y: idxY, size: 9, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
    indexPage.drawText(range.item.file, { x: margin + 260, y: idxY, size: 8, font: helvetica, color: rgb(0.35, 0.35, 0.35) });
    indexPage.drawText(`${range.pageCount}`, { x: margin + 415, y: idxY, size: 9, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
    indexPage.drawText(`Page ${range.startPage}`, { x: margin + 460, y: idxY, size: 9, font: helveticaBold, color: rgb(0.08, 0.25, 0.45) });
    idxY -= 24;
  }

  // 3. Footers on every page
  const allPages = mergedPdf.getPages();
  const totalCount = allPages.length;

  for (let i = 0; i < totalCount; i++) {
    const page = allPages[i];
    const { width } = page.getSize();
    const footerText = `${tender.tender_id} | Page ${i + 1} of ${totalCount}`;
    const textWidth = helvetica.widthOfTextAtSize(footerText, 9);

    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: 25,
      color: rgb(0.98, 0.98, 0.99),
      opacity: 0.9,
    });

    page.drawLine({
      start: { x: 30, y: 25 },
      end: { x: width - 30, y: 25 },
      thickness: 0.5,
      color: rgb(0.82, 0.85, 0.88),
    });

    page.drawText(footerText, {
      x: (width - textWidth) / 2,
      y: 8,
      size: 9,
      font: helvetica,
      color: rgb(0.25, 0.3, 0.35),
    });
  }

  const finalPdfBytes = await mergedPdf.save();
  const outputPath = `output/${tender.tender_id}_Package.pdf`;
  fs.writeFileSync(outputPath, finalPdfBytes);
  console.log(`Successfully generated ${outputPath} with ${totalCount} pages!`);
}

generateSamplePackage().catch(console.error);
