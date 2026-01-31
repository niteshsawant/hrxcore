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

function findTask(tasks, id) {
    return tasks.find(t => t.id === id);
}

async function test() {
    console.log('Testing Subtasks & Unlocking Logic...');

    // 1. Get Initial State
    const res1 = await request('http://localhost:3000/api/mentor/tasks');
    let tasks = JSON.parse(res1.data);
    console.log('Fetched Tasks:', tasks.length);

    // Verify 1.1 is UNDER_REVIEW and 1.2 is NOT_STARTED
    // Note: Mentor API only returns UNDER_REVIEW tasks.
    // We need to fetch from HR API to see all statuses? 
    // - Actually store.getTasksByStatus(UNDER_REVIEW) is what Mentor API does.
    // - HR API returns ALL. 

    const resHR = await request('http://localhost:3000/api/hr/tasks');
    let allTasks = JSON.parse(resHR.data);

    const t1_1 = findTask(allTasks, 'task-1-1');
    const t1_2 = findTask(allTasks, 'task-1-2');
    const t2_1 = findTask(allTasks, 'task-2-1');

    console.log(`Initial State: 1.1=${t1_1.status}, 1.2=${t1_2.status}, 2.1=${t2_1.status}`);

    if (t1_1.status !== 'UNDER_REVIEW') {
        console.log('SKIP: Task 1.1 is not UNDER_REVIEW (already approved?)');
    } else {
        // 2. Approve Task 1.1
        console.log('\n2. Approving Task 1.1...');
        const resApprove = await request('http://localhost:3000/api/mentor/tasks', 'POST', {
            taskId: 'task-1-1',
            action: 'APPROVE',
            feedback: 'Great root cause analysis!'
        });
        console.log('Approve Status:', resApprove.status);
    }

    // 3. Check if 1.2 Unlocked
    const resHR2 = await request('http://localhost:3000/api/hr/tasks');
    allTasks = JSON.parse(resHR2.data);
    const t1_1_new = findTask(allTasks, 'task-1-1');
    const t1_2_new = findTask(allTasks, 'task-1-2');

    console.log(`\nState After Approval: 1.1=${t1_1_new.status}, 1.2=${t1_2_new.status}`);

    if (t1_1_new.status === 'APPROVED' && t1_2_new.status === 'IN_PROGRESS') {
        console.log('[PASS] Task 1.1 Approved -> Task 1.2 Unlocked (IN_PROGRESS)');
    } else {
        console.log('[FAIL] Task 1.2 did not unlock or 1.1 not approved.');
    }

    // 4. Verify Portfolio
    console.log('\n4. Verifying Portfolio...');
    const resPortfolio = await request('http://localhost:3000/api/portfolio');
    const portfolio = JSON.parse(resPortfolio.data);
    console.log('Portfolio Items:', portfolio.length);

    const inPortfolio = portfolio.find(t => t.id === 'task-1-1');
    if (inPortfolio) {
        console.log('[PASS] Task 1.1 found in Portfolio.');
        console.log('Approved At:', inPortfolio.approvedAt);
    } else {
        console.log('[FAIL] Task 1.1 not found in Portfolio.');
    }
}

test();
