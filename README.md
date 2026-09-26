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
- **Frontend**: Vite, React, TypeScript, Tailwind CSS, React Router (Static SPA deployed to GitHub Pages).
- **Mock Data Layer**: Client-side `localStorage` store simulating the ServiceNow backend for demo purposes.
- **ServiceNow Backend**: Update set, Flow Designer logic, SLA definitions, and ACLs (Deployable via XML).

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

1. **Employee Role**: Open the live site and log in as "Ananya Rao" (Employee). Navigate to "My Requests" and submit a new request for "Adobe Photoshop". Note the restricted software warning.
2. **Manager Role**: Log out and log in as "Karthik Iyer" (Manager). Navigate to "Approvals". You will see the pending approval. Click "Approve".
3. **IT Support Role**: Log out and log in as "Priya Shah" (IT Support). The request has automatically bypassed IT Approval (since Priya is IT) or routed to "In Progress". Navigate to "Fulfillment Queue" and click "Mark Installed".
4. **Admin/Reporting Role**: Log in as "Vikram Singh" (Admin). Open the Dashboard and verify the metrics update dynamically based on the recent actions.

## Technologies Used
- **React (Vite) & TypeScript**
- **Tailwind CSS**
- **Lucide React** (Icons)
- **ServiceNow** (Backend definition)

---
*Created by [RishanthDeveloper](https://github.com/RishanthDeveloper)*

## Frontend (Next.js)

A modern, startup-quality frontend is built using Next.js 14 (App Router) in the /frontend directory. It sits on top of the ServiceNow REST APIs and replaces the legacy Service Portal widgets.

### Local Setup for Frontend

1. Ensure you have Node.js installed.
2. Navigate to the frontend directory: `cd frontend`
3. Install dependencies: `npm install`
4. Copy `.env.local.example` to `.env.local` and add your ServiceNow credentials:
   ```
   NEXT_PUBLIC_SN_INSTANCE_URL=https://your-instance.service-now.com
   SN_CLIENT_ID=your_oauth_client_id
   SN_CLIENT_SECRET=your_oauth_client_secret
   NEXTAUTH_SECRET=a_random_secret_string
   NEXTAUTH_URL=http://localhost:3000
   ```
5. Run the development server: `npm run dev`

### Relation to Backend
The frontend is completely decoupled from the ServiceNow backend but relies on it for data persistence, Flow Designer automation, and Access Control Lists (ACLs). The frontend talks to the ServiceNow Table API and custom Scripted REST APIs (for dashboard stats). All SLA timers and license validations still happen securely on the ServiceNow server.

