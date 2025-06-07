const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Read the index.html file
const htmlContent = fs.readFileSync('index.html', 'utf8');

// Extract all links from the HTML
const linkRegex = /href=["']([^"']+)["']/g;
const links = [];
let match;

// List of domains to skip (CDNs, fonts, etc.)
const skipDomains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cdnjs.cloudflare.com'
];

// List of domains to check (social media, etc.)
const checkDomains = [
    'instagram.com',
    'linkedin.com',
    'wa.me',
    'github.com'
];

while ((match = linkRegex.exec(htmlContent)) !== null) {
    const url = match[1];
    
    // Skip anchor links
    if (url.startsWith('#')) continue;
    
    // Skip CDN and font resources
    if (skipDomains.some(domain => url.includes(domain))) continue;
    
    // Skip data URLs and javascript: links
    if (url.startsWith('data:') || url.startsWith('javascript:')) continue;
    
    // Check if it's a social media or external link we want to verify
    const isExternalLink = checkDomains.some(domain => url.includes(domain));
    
    // Add the link if it's either a local file or a social media/external link we want to check
    if (!url.startsWith('http') || isExternalLink) {
        links.push(url);
    }
}

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
            resolve({
                url,
                status: res.statusCode,
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
    
    const results = await Promise.all(links.map(checkUrl));
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