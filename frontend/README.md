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

## Deployment (Vercel)

To deploy this Next.js frontend to Vercel as a standalone project:

1. Connect your GitHub repository to Vercel.
2. During project setup, set the **Root Directory** to `frontend`.
3. Vercel will automatically detect the Next.js framework.
4. **Critical**: Add the following Environment Variables in the Vercel dashboard before deploying:
   - `NEXT_PUBLIC_SN_INSTANCE_URL` (e.g., https://dev12345.service-now.com)
   - `SN_CLIENT_ID` (Your OAuth Client ID)
   - `SN_CLIENT_SECRET` (Your OAuth Client Secret)
   - `NEXTAUTH_SECRET` (Generate a random string, e.g., via `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (The production URL Vercel gives you, e.g., https://your-app.vercel.app)

*Do not commit real credentials to GitHub.*

