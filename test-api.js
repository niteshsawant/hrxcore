const http = require('http');

function get(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function test() {
    console.log('Testing API...');

    // Test 1: Valid
    const url1 = 'http://localhost:3000/api/transition?role=HR_PRO&state=IN_PROGRESS&action=SUBMIT_EVIDENCE';
    console.log(`\nGET ${url1}`);
    try {
        const res1 = await get(url1);
        console.log('Response:', res1);
    } catch (e) {
        console.error('Error:', e.message);
    }

    // Test 2: Invalid
    const url2 = 'http://localhost:3000/api/transition?role=MENTOR&state=IN_PROGRESS&action=APPROVE';
    console.log(`\nGET ${url2}`);
    try {
        const res2 = await get(url2);
        console.log('Response:', res2);
    } catch (e) {
        console.error('Error:', e.message);
    }
}

test();
