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

while ((match = linkRegex.exec(htmlContent)) !== null) {
    // Skip anchor links (those starting with #)
    if (!match[1].startsWith('#')) {
        links.push(match[1]);
    }
}

// Function to check if a URL is valid
function checkUrl(url) {
    return new Promise((resolve) => {
        // Skip data URLs and javascript: links
        if (url.startsWith('data:') || url.startsWith('javascript:')) {
            resolve({
                url,
                status: 'SKIPPED',
                error: 'Data or JavaScript URL'
            });
            return;
        }

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
    console.log('🔍 Testing all links in index.html...\n');
    
    const results = await Promise.all(links.map(checkUrl));
    let hasErrors = false;

    results.forEach(({ url, status, error }) => {
        if (status === '200' || status === 'SKIPPED') {
            console.log(`✅ ${url} - ${status === 'SKIPPED' ? 'SKIPPED' : 'OK'}`);
        } else {
            hasErrors = true;
            console.error(`❌ ${url} - ${status}${error ? ` (${error})` : ''}`);
        }
    });

    if (hasErrors) {
        console.error('\n❌ Some links are broken!');
        process.exit(1);
    } else {
        console.log('\n✅ All links are working!');
        process.exit(0);
    }
}

// Run the tests
testLinks();