const http = require('http');

function request(url, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };

        const req = http.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data }));
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function test() {
    console.log('Testing HR Pro API...');

    // 1. Get Tasks
    console.log('\n1. GET /api/hr/tasks');
    const res1 = await request('http://localhost:3000/api/hr/tasks');
    console.log('Status:', res1.status);
    const tasks = JSON.parse(res1.data);
    // Find a REVISION_REQUIRED task (from previous mentor rejection) if available
    const revisionTask = tasks.find(t => t.status === 'REVISION_REQUIRED');
    const newStartTask = tasks.find(t => t.status === 'NOT_STARTED' || t.status === 'IN_PROGRESS');

    if (revisionTask) {
        console.log(`\n2. Resubmitting Evidence for Task ${revisionTask.id} (${revisionTask.status})`);
        const res2 = await request('http://localhost:3000/api/hr/tasks', 'POST', {
            taskId: revisionTask.id,
            evidenceLink: 'https://docs.google.com/updated-evidence'
        });
        console.log('Status:', res2.status);
        console.log('Data:', res2.data);
    } else {
        console.log('\nNo REVISION_REQUIRED task found to test resubmission.');
    }

    // 3. Submit evidence for IN_PROGRESS task (if any)
    // Note: I created task-3 as IN_PROGRESS in store.ts
    const inProgressTask = tasks.find(t => t.status === 'IN_PROGRESS');
    if (inProgressTask) {
        console.log(`\n3. Submitting Evidence for Task ${inProgressTask.id} (${inProgressTask.status})`);
        const res3 = await request('http://localhost:3000/api/hr/tasks', 'POST', {
            taskId: inProgressTask.id,
            evidenceLink: 'https://docs.google.com/initial-evidence'
        });
        console.log('Status:', res3.status);
        console.log('Data:', res3.data);
    } else {
        console.log('\nNo IN_PROGRESS task found to test submission.');
    }

    // 4. Try to submit for APPROVED task (should fail)
    const approvedTask = tasks.find(t => t.status === 'APPROVED');
    if (approvedTask) {
        console.log(`\n4. Attempt submit on APPROVED Task ${approvedTask.id}`);
        const res4 = await request('http://localhost:3000/api/hr/tasks', 'POST', {
            taskId: approvedTask.id,
            evidenceLink: 'https://fail.com'
        });
        console.log('Status:', res4.status);
        console.log('Data:', res4.data); // Expect error
    }
}

test();
