const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Load the HTML file
  await page.goto(`file:${path.join(__dirname, 'apt-poster.html')}`, {
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
        padding: 8mm !important;
      }
      .poster {
        height: auto !important;
        min-height: 0 !important;
      }
      .header {
        padding: 3mm 0 !important;
        margin-bottom: 2mm !important;
      }
      h1 {
        font-size: 18pt !important;
        margin-bottom: 2mm !important;
      }
      .subheading {
        font-size: 11pt !important;
        margin-bottom: 2mm !important;
      }
      .location {
        padding: 2mm 4mm !important;
      }
      .gallery {
        margin: 2mm 0 !important;
        gap: 1.5mm !important;
      }
      .gallery img {
        height: 35mm !important;
      }
      .price-section {
        margin: 2mm 0 !important;
        padding: 3mm !important;
      }
      .price-tag {
        font-size: 20pt !important;
        margin-bottom: 1mm !important;
      }
      .price-note {
        font-size: 9pt !important;
        line-height: 1.3 !important;
      }
      .content-section {
        margin: 2mm 0 !important;
        padding: 2mm !important;
      }
      .content-grid {
        gap: 2mm !important;
      }
      .content-column {
        padding: 2mm !important;
      }
      .content-column h3 {
        font-size: 11pt !important;
        margin-bottom: 1.5mm !important;
        padding-bottom: 1mm !important;
      }
      .content-column li {
        margin-bottom: 1.5mm !important;
        padding-bottom: 0.5mm !important;
      }
      .label {
        font-size: 8pt !important;
        margin-bottom: 0.5mm !important;
      }
      .value {
        font-size: 9pt !important;
      }
      .buttons {
        margin: 2mm 0 !important;
        gap: 2mm !important;
      }
      .button {
        padding: 2mm 3mm !important;
        font-size: 10pt !important;
      }
      .urls {
        font-size: 8pt !important;
        margin-top: 1mm !important;
      }
      .qr-section {
        margin: 2mm 0 !important;
      }
      .qr-section img {
        width: 25mm !important;
        height: 25mm !important;
        padding: 1mm !important;
      }
      .qr-note {
        font-size: 8pt !important;
        margin-top: 1mm !important;
      }
    `
  });

  // Generate PDF
  await page.pdf({
    path: 'apt-poster.pdf',
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