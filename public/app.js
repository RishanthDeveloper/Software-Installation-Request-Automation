// Submit Request
const form = document.getElementById('requestForm');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msgDiv = document.getElementById('formMsg');
        msgDiv.className = 'mt-2 text-sm font-bold text-gray-700';
        msgDiv.innerText = 'Submitting...';

        const payload = {
            employee: document.getElementById('employee').value,
            department: document.getElementById('department').value,
            software: document.getElementById('software').value,
            version: document.getElementById('version').value,
            type: document.getElementById('type').value,
            justification: document.getElementById('justification').value,
            urgency: document.getElementById('urgency').value,
            requiredBy: document.getElementById('requiredBy').value,
        };

        try {
            const res = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (!res.ok) {
                msgDiv.className = 'mt-2 text-sm font-bold text-red-600';
                msgDiv.innerText = data.error || 'Error submitting request.';
            } else {
                msgDiv.className = 'mt-2 text-sm font-bold text-green-600';
                msgDiv.innerText = 'Request submitted successfully! Tracking ID: ' + data.request.id;
                form.reset();
                if (typeof loadMyRequests === 'function') loadMyRequests();
            }
        } catch (err) {
            msgDiv.className = 'mt-2 text-sm font-bold text-red-600';
            msgDiv.innerText = 'Network error.';
        }
    });
}

// Load Employee Requests
async function loadMyRequests() {
    const user = document.getElementById('searchUser').value || 'Jane Doe';
    const container = document.getElementById('requestList');
    container.innerHTML = '<p class="text-gray-500">Loading...</p>';

    try {
        const res = await fetch(`/api/requests/employee/${encodeURIComponent(user)}`);
        const data = await res.json();
        
        container.innerHTML = '';
        if(data.length === 0) {
            container.innerHTML = '<p class="text-gray-500">No requests found.</p>';
            return;
        }

        // Sort by newest first
        data.reverse().forEach(r => {
            let color = 'bg-gray-100 text-gray-800';
            if(r.state === 'Closed' || r.state === 'Installed') color = 'bg-green-100 text-green-800';
            else if(r.state === 'Rejected') color = 'bg-red-100 text-red-800';
            else if(r.state === 'In Progress') color = 'bg-blue-100 text-blue-800';
            else color = 'bg-yellow-100 text-yellow-800'; // Pending approvals

            let logsHtml = r.logs.map(l => `<li class="text-xs text-gray-600">${new Date(l.timestamp).toLocaleString()}: ${l.message}</li>`).join('');

            container.innerHTML += `
                <div class="border p-4 rounded bg-gray-50 mb-2">
                    <div class="flex justify-between items-center mb-2">
                        <span class="font-bold">${r.id} - ${r.software}</span>
                        <span class="${color} text-xs px-2 py-1 rounded">${r.state}</span>
                    </div>
                    <p class="text-sm text-gray-600">Urgency: ${r.urgency.split(' ')[0]}</p>
                    <details class="mt-2 text-sm">
                        <summary class="cursor-pointer text-blue-600">View Activity Log</summary>
                        <ul class="list-disc pl-5 mt-1 border-t pt-1">
                            ${logsHtml}
                        </ul>
                    </details>
                </div>
            `;
        });
    } catch (err) {
        container.innerHTML = '<p class="text-red-500">Failed to load tracking data.</p>';
    }
}

if(document.getElementById('searchUser')) {
    loadMyRequests();
}

// Load Role specific requests (Manager or IT Approvals)
async function loadRoleRequests(targetState, containerId, role) {
    try {
        const res = await fetch('/api/requests');
        const data = await res.json();
        const filtered = data.filter(r => r.state === targetState);
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        if(filtered.length === 0) {
            container.innerHTML = `<p class="text-gray-500 col-span-2">No pending ${role} approvals.</p>`;
            return;
        }

        filtered.forEach(r => {
            container.innerHTML += `
                <div class="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-bold text-lg">${r.id}</h3>
                        <span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">${r.state}</span>
                    </div>
                    <p class="text-sm"><strong>Employee:</strong> ${r.employee} (${r.department})</p>
                    <p class="text-sm"><strong>Software:</strong> ${r.software} (${r.version})</p>
                    <p class="text-sm"><strong>Justification:</strong> ${r.justification}</p>
                    <div class="mt-4 border-t pt-3 flex space-x-2">
                        <button onclick="updateRequest('${r.id}', 'Approve', '${role}')" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm font-bold w-1/2">Approve</button>
                        <button onclick="updateRequest('${r.id}', 'Reject', '${role}')" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm font-bold w-1/2">Reject</button>
                    </div>
                </div>
            `;
        });
    } catch (err) {
        console.error(err);
    }
}

async function updateRequest(id, action, role) {
    let comments = '';
    if (action === 'Reject') {
        comments = prompt("Please provide a reason for rejection:");
        if (comments === null) return; // cancelled
    }
    try {
        await fetch(`/api/requests/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, role, comments })
        });
        window.location.reload();
    } catch (err) {
        alert("Error updating request.");
    }
}
