const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Load the HTML file
  await page.goto(`file:${path.join(__dirname, 'storage-poster.html')}`, {
    waitUntil: 'networkidle0'
  });

  // Add custom CSS to make content more compact
  await page.addStyleTag({
    content: `
      * {
        margin: 0 !important;
        padding: 0 !important;
      }
      body {
        padding: 10mm !important;
      }
      .poster {
        height: auto !important;
        min-height: 0 !important;
      }
      .header {
        padding: 5mm 0 !important;
        margin-bottom: 3mm !important;
      }
      h1 {
        font-size: 20pt !important;
        margin-bottom: 2mm !important;
      }
      .subheading {
        font-size: 12pt !important;
        margin-bottom: 2mm !important;
      }
      .location {
        padding: 2mm 4mm !important;
        font-size: 12pt !important;
      }
      .gallery {
        margin: 2mm 0 !important;
        gap: 2mm !important;
      }
      .gallery img {
        height: 40mm !important;
      }
      .main-grid {
        gap: 3mm !important;
        margin: 3mm 0 !important;
      }
      .section-title {
        font-size: 20pt !important;
        margin-bottom: 3mm !important;
      }
      .info-section {
        margin-bottom: 4mm !important;
      }
      .info-section .label {
        font-size: 14pt !important;
        margin-bottom: 1mm !important;
      }
      .info-section .value {
        font-size: 16pt !important;
        line-height: 1.4 !important;
      }
      .price-tag {
        font-size: 28pt !important;
        margin-bottom: 1mm !important;
      }
      .price-note {
        font-size: 14pt !important;
      }
      .featured-image {
        height: 100% !important;
      }
      .buttons {
        margin: 3mm 0 !important;
        gap: 3mm !important;
      }
      .button {
        padding: 2mm 4mm !important;
        font-size: 12pt !important;
      }
      .qr-section {
        margin: 3mm 0 !important;
      }
      .qr-section img {
        width: 30mm !important;
        height: 30mm !important;
        padding: 1mm !important;
      }
      .qr-note {
        font-size: 12pt !important;
        margin-top: 1mm !important;
      }
    `
  });

  // Generate PDF
  await page.pdf({
    path: 'storage-poster.pdf',
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0mm',
      right: '0mm',
      bottom: '0mm',
      left: '0mm'
    }
  });

  await browser.close();
  console.log('PDF generated successfully!');
})(); 