export default function Home() {
    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>HRX Core State Machine API</h1>
            <p>The API is active at <code>/api/transition</code>.</p>
            <p>Test it with a query like:</p>
            <pre style={{ background: '#eee', padding: '10px', borderRadius: '5px' }}>
                /api/transition?role=HR_PRO&state=IN_PROGRESS&action=SUBMIT_EVIDENCE
            </pre>
        </div>
    );
}
