const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Read the index.html file
const htmlContent = fs.readFileSync('index.html', 'utf8');

// Extract all links from the HTML
const links = new Set(); // Using Set to avoid duplicates

// Extract href attributes
const hrefRegex = /href=["']([^"']+)["']/g;
let match;
while ((match = hrefRegex.exec(htmlContent)) !== null) {
    const url = match[1];
    if (!url.startsWith('#') && !url.startsWith('data:') && !url.startsWith('javascript:')) {
        links.add(url);
    }
}

// Extract data-url attributes
const dataUrlRegex = /data-url=["']([^"']+)["']/g;
while ((match = dataUrlRegex.exec(htmlContent)) !== null) {
    const url = match[1];
    if (!url.startsWith('#') && !url.startsWith('data:') && !url.startsWith('javascript:')) {
        links.add(url);
    }
}

// List of domains to skip (CDNs, fonts, etc.)
const skipDomains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cdnjs.cloudflare.com'
];

// Filter out CDN resources
const filteredLinks = Array.from(links).filter(url => 
    !skipDomains.some(domain => url.includes(domain))
);

// Function to check if a URL is valid
function checkUrl(url) {
    return new Promise((resolve) => {
        // Handle relative URLs
        if (url.startsWith('./') || url.startsWith('/') || !url.startsWith('http')) {
            const filePath = path.join(process.cwd(), url);
            fs.access(filePath, fs.constants.F_OK, (err) => {
                resolve({
                    url,
                    status: err ? '404' : '200',
                    error: err ? err.message : null
                });
            });
            return;
        }

        // Handle external URLs
        const protocol = url.startsWith('https') ? https : http;
        const req = protocol.get(url, (res) => {
            // Consider redirects (301, 302) as successful
            const status = res.statusCode;
            const isSuccess = status === 200 || status === 301 || status === 302;
            resolve({
                url,
                status: isSuccess ? '200' : status,
                error: null
            });
        });

        req.on('error', (error) => {
            resolve({
                url,
                status: 'ERROR',
                error: error.message
            });
        });

        // Set a timeout
        req.setTimeout(5000, () => {
            req.destroy();
            resolve({
                url,
                status: 'TIMEOUT',
                error: 'Request timed out'
            });
        });
    });
}

// Main test function
async function testLinks() {
    console.log('🔍 Testing all important links in index.html...\n');
    
    const results = await Promise.all(filteredLinks.map(checkUrl));
    let hasErrors = false;

    results.forEach(({ url, status, error }) => {
        if (status === '200') {
            console.log(`✅ ${url} - OK`);
        } else {
            hasErrors = true;
            console.error(`❌ ${url} - ${status}${error ? ` (${error})` : ''}`);
        }
    });

    if (hasErrors) {
        console.error('\n❌ Some important links are broken!');
        process.exit(1);
    } else {
        console.log('\n✅ All important links are working!');
        process.exit(0);
    }
}

// Run the tests
testLinks();