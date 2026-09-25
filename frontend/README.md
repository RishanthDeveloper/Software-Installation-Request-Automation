# Software Request Frontend

This is a Next.js 14 (App Router) frontend built on top of the ServiceNow backend repository. It acts as a modern, startup-quality interface for the IT Software Installation Request process, replacing the standard ServiceNow Service Portal widgets without modifying the underlying ServiceNow data model, Flow Designer logic, or ACLs.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts
- NextAuth (OAuth 2.0 with ServiceNow)

## Local Setup

1. Make sure you are in the `/frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in the variables with your ServiceNow instance credentials and OAuth client details.

4. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Relation to ServiceNow Backend
This frontend talks to ServiceNow over REST. It relies on the Table API for standard CRUD operations and a Scripted REST API for specific actions (like triggering Flow actions not accessible directly via the Table API). The core business logic, license validation, and multi-tier approvals remain securely in the ServiceNow backend hosted in the root of this repository.
