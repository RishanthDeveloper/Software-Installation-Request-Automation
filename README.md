# Software Installation Request Automation

A complete, full-stack IT Service Management (ITSM) application demonstrating advanced ServiceNow-like workflows, approvals, API integrations, and SLA tracking built for a modern web ecosystem.

## Problem
Manual software requests through email cause delays, poor tracking, lost IT fulfillment tasks, and zero analytics insight for the organization.

## Solution
A full-stack web application simulating an automated Service Catalog workflow. Employees submit structured software requests which automatically traverse a predefined approval engine (Manager → IT), create IT fulfillment tasks, track SLA metrics, simulate email notifications via an activity log, and roll up data into a real-time analytics dashboard.

## Features
- **Service Catalog Portal**: Dynamic request form with conditional logic (e.g., minimum character justification for licensed software like Adobe Photoshop).
- **Automated Routing & Approvals**: Conditional workflow states (Requested → Manager Approval → IT Approval → In Progress → Installed → Closed).
- **Advanced License / Duplicate Checks**: Real-time validation preventing users from submitting duplicate active requests for the same software.
- **IT Task Fulfillment UI**: Dedicated view for IT to manage assigned installations and close out tickets.
- **Real-Time Request Tracking**: An activity log mirroring ServiceNow's 'Work Notes' / 'Additional Comments' flow.
- **SLA Tracking Dashboard**: A Chart.js powered executive dashboard visualizing metrics, queue health, and software popularity.
- **Responsive UI**: Tailored with Tailwind CSS for mobile and desktop usage.

## Architecture
- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS, Chart.js
- **Backend**: Node.js, Express.js (REST API)
- **Database**: Local JSON File-based DB (`data.json`) for seamless portability and zero-setup deployment.

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/RishanthDeveloper/software-request-app.git
   cd software-request-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Server**
   ```bash
   npm start
   ```

4. **Access the Application**
   Open your browser and navigate to: [http://localhost:3000](http://localhost:3000)

## Demo Workflow Walkthrough

1. **Employee Role**: Open `http://localhost:3000/`. Submit a request for "Visual Studio Code". Observe it enters the "Manager Approval" state. Check your tracking panel to see the simulated email logs.
2. **Manager Role**: Open `http://localhost:3000/manager.html`. You will see the pending approval. Click "Approve". 
3. **IT Support Role**: Open `http://localhost:3000/it.html`. Notice the task moved from IT Approval to In Progress. Click "Mark Installed" and then "Close Request".
4. **Admin/Reporting Role**: Open `http://localhost:3000/dashboard.html` and verify the metrics update dynamically in the charts and scorecards.
5. **Test Advanced Features**: Try submitting a request for "Adobe Photoshop" with less than 20 characters in the justification—the system will block it. Try submitting a second request for "Visual Studio Code" before the first one closes—the duplicate detection will trigger.

## Technologies Used
- **Node.js & Express**
- **Vanilla JavaScript (ES6+)**
- **Tailwind CSS**
- **Chart.js**

---
*Created by [RishanthDeveloper](https://github.com/RishanthDeveloper)*
