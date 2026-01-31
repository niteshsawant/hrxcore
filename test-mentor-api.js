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
    console.log('Testing Mentor API...');

    // 1. Get Tasks
    console.log('\n1. GET /api/mentor/tasks');
    const res1 = await request('http://localhost:3000/api/mentor/tasks');
    console.log('Status:', res1.status);
    console.log('Data:', res1.data);
    const tasks = JSON.parse(res1.data);
    const taskToApprove = tasks[0];
    const taskToReject = tasks[1];

    if (!taskToApprove) {
        console.error('No tasks found to test review.');
        return;
    }

    // 2. Approve Task
    console.log(`\n2. POST /api/mentor/tasks (APPROVE ${taskToApprove.id})`);
    const res2 = await request('http://localhost:3000/api/mentor/tasks', 'POST', {
        taskId: taskToApprove.id,
        action: 'APPROVE',
        feedback: 'Great work, approved!'
    });
    console.log('Status:', res2.status);
    console.log('Data:', res2.data);

    // 3. Reject Task
    if (taskToReject) {
        console.log(`\n3. POST /api/mentor/tasks (REJECT ${taskToReject.id})`);
        const res3 = await request('http://localhost:3000/api/mentor/tasks', 'POST', {
            taskId: taskToReject.id,
            action: 'REJECT',
            feedback: 'Needs more detail on section 2.'
        });
        console.log('Status:', res3.status);
        console.log('Data:', res3.data);
    }

    // 4. Verify list checks out (should have fewer tasks now)
    console.log('\n4. GET /api/mentor/tasks (Verify updates)');
    const res4 = await request('http://localhost:3000/api/mentor/tasks');
    console.log('Data:', res4.data);
}

test();
