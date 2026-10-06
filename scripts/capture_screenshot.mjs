import puppeteer from 'puppeteer-core';
import path from 'path';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1200 });
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

  // Wait a second for app to render
  await new Promise((r) => setTimeout(r, 1000));

  // Click "Load Sample Data" button
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate((el) => el.innerText, btn);
    if (text.includes('Load Sample Data')) {
      await btn.click();
      console.log('Clicked Load Sample Data');
      break;
    }
  }

  await new Promise((r) => setTimeout(r, 1000));

  // Click "Load Sample PDFs" button
  const pdfButtons = await page.$$('button');
  for (const btn of pdfButtons) {
    const text = await page.evaluate((el) => el.innerText, btn);
    if (text.includes('Load Sample PDFs')) {
      await btn.click();
      console.log('Clicked Load Sample PDFs');
      break;
    }
  }

  await new Promise((r) => setTimeout(r, 1500));

  // Click "Auto-Match Files" button
  const matchButtons = await page.$$('button');
  for (const btn of matchButtons) {
    const text = await page.evaluate((el) => el.innerText, btn);
    if (text.includes('Auto-Match Files')) {
      await btn.click();
      console.log('Clicked Auto-Match Files');
      break;
    }
  }

  await new Promise((r) => setTimeout(r, 1000));

  // Take screenshot 1: Document Statuses
  await page.screenshot({
    path: 'screenshots/document_statuses.png',
    fullPage: true,
  });
  console.log('Saved screenshots/document_statuses.png');

  // Switch to Bengali
  const bnButtons = await page.$$('button');
  for (const btn of bnButtons) {
    const text = await page.evaluate((el) => el.innerText, btn);
    if (text === 'বাং') {
      await btn.click();
      console.log('Switched language to Bengali');
      break;
    }
  }

  await new Promise((r) => setTimeout(r, 800));

  // Take screenshot 2: Bengali Interface
  await page.screenshot({
    path: 'screenshots/bilingual_ui_bengali.png',
    fullPage: true,
  });
  console.log('Saved screenshots/bilingual_ui_bengali.png');

  await browser.close();
  console.log('Done capturing screenshots!');
}

capture().catch(console.error);
