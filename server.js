const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize data if not exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ requests: [], nextId: 1000 }, null, 2));
}

function readData() {
    const rawData = fs.readFileSync(DATA_FILE);
    return JSON.parse(rawData);
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Submit Request
app.post('/api/requests', (req, res) => {
    const { employee, department, software, version, type, justification, urgency, requiredBy } = req.body;
    
    // License Validation (Advanced Feature)
    if (software === 'Adobe Photoshop' && justification.length < 20) {
        return res.status(400).json({ error: 'Adobe Photoshop requires a detailed justification (min 20 chars).' });
    }

    const data = readData();
    
    // Duplicate Detection (Advanced Feature)
    const existing = data.requests.find(r => r.employee === employee && r.software === software && r.state !== 'Closed' && r.state !== 'Rejected');
    if (existing) {
        return res.status(400).json({ error: 'You already have an active request for this software.' });
    }

    const newRequest = {
        id: `REQ${data.nextId++}`,
        employee,
        department,
        software,
        version,
        type,
        justification,
        urgency,
        requiredBy,
        state: 'Manager Approval', // Requested -> Manager Approval
        createdAt: new Date().toISOString(),
        managerApproved: false,
        itApproved: false,
        installed: false,
        logs: [
            { timestamp: new Date().toISOString(), message: 'Request submitted successfully.' },
            { timestamp: new Date().toISOString(), message: 'Notification sent to Employee: Request Submitted.' },
            { timestamp: new Date().toISOString(), message: 'Notification sent to Manager: Approval Pending.' }
        ]
    };

    data.requests.push(newRequest);
    writeData(data);
    res.status(201).json({ message: 'Request submitted successfully', request: newRequest });
});

// 2. Get All Requests (For Dashboard / Admin)
app.get('/api/requests', (req, res) => {
    const data = readData();
    res.json(data.requests);
});

// 3. Get Employee Requests
app.get('/api/requests/employee/:name', (req, res) => {
    const data = readData();
    const myRequests = data.requests.filter(r => r.employee === req.params.name);
    res.json(myRequests);
});

// 4. Update Request State (Approvals & IT Task)
app.patch('/api/requests/:id', (req, res) => {
    const { id } = req.params;
    const { action, role, comments } = req.body;
    const data = readData();
    const reqIndex = data.requests.findIndex(r => r.id === id);

    if (reqIndex === -1) {
        return res.status(404).json({ error: 'Request not found' });
    }

    let request = data.requests[reqIndex];
    let time = new Date().toISOString();

    if (role === 'Manager') {
        if (action === 'Approve') {
            request.state = 'IT Approval';
            request.managerApproved = true;
            request.logs.push({ timestamp: time, message: `Manager approved. Comments: ${comments || 'None'}` });
            request.logs.push({ timestamp: time, message: 'Notification sent to Employee: Manager Approved.' });
            request.logs.push({ timestamp: time, message: 'Notification sent to IT: Approval Pending.' });
        } else if (action === 'Reject') {
            request.state = 'Rejected';
            request.logs.push({ timestamp: time, message: `Manager rejected. Comments: ${comments}` });
            request.logs.push({ timestamp: time, message: 'Notification sent to Employee: Request Rejected.' });
        }
    } else if (role === 'IT') {
        if (action === 'Approve') {
            request.state = 'In Progress';
            request.itApproved = true;
            request.logs.push({ timestamp: time, message: `IT approved. Comments: ${comments || 'None'}` });
            request.logs.push({ timestamp: time, message: 'IT Fulfillment Task Created.' });
        } else if (action === 'Reject') {
            request.state = 'Rejected';
            request.logs.push({ timestamp: time, message: `IT rejected. Comments: ${comments}` });
            request.logs.push({ timestamp: time, message: 'Notification sent to Employee: Request Rejected.' });
        } else if (action === 'Install') {
            request.state = 'Installed';
            request.installed = true;
            request.logs.push({ timestamp: time, message: 'Software installed successfully.' });
            request.logs.push({ timestamp: time, message: 'Notification sent to Employee: Installation Completed.' });
        } else if (action === 'Close') {
            request.state = 'Closed';
            request.resolvedAt = time;
            request.logs.push({ timestamp: time, message: 'Request closed.' });
            request.logs.push({ timestamp: time, message: 'Notification sent to Employee: Request Closed.' });
        }
    }

    data.requests[reqIndex] = request;
    writeData(data);
    res.json({ message: 'Request updated', request });
});

// 5. Dashboard Stats
app.get('/api/stats', (req, res) => {
    const data = readData();
    const stats = {
        total: data.requests.length,
        pending: data.requests.filter(r => ['Manager Approval', 'IT Approval'].includes(r.state)).length,
        inProgress: data.requests.filter(r => r.state === 'In Progress').length,
        completed: data.requests.filter(r => r.state === 'Closed' || r.state === 'Installed').length,
        rejected: data.requests.filter(r => r.state === 'Rejected').length,
        softwareCounts: {}
    };

    data.requests.forEach(r => {
        stats.softwareCounts[r.software] = (stats.softwareCounts[r.software] || 0) + 1;
    });

    res.json(stats);
});

// Catch-all to index.html for SPA-like behavior (optional)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
