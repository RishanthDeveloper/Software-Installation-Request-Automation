# Software Request Automation - Demo Frontend

This directory (`/web`) contains a client-side only React application built with Vite, TypeScript, and Tailwind CSS. It is deployed as a static site to GitHub Pages.

## Demo vs Real

This frontend is a **Demo UX**. Because GitHub Pages only serves static files (and cannot run a secure backend server), **Authentication and Data persistence are mocked**:
- **Auth**: The login page uses a mock `localStorage` session with 4 pre-defined users representing the 4 roles (Employee, Manager, IT Support, Admin). It does NOT connect to the ServiceNow OAuth endpoints.
- **Data**: New requests, approvals, and queue updates are persisted to a shared `localStorage` store so the dashboard and tables update in real-time across the mock users. It does NOT hit the ServiceNow Table API.

The actual ServiceNow backend, Flow Designer logic, SLA definitions, and ACLs (documented in `/docs` and `/update-set`) are real and deployable to a ServiceNow developer instance. This frontend is simply a portfolio showcase of the intended user experience.

### Switching to Real Auth (Stretch Goal)
To connect this frontend to a real ServiceNow instance:
1. You must host this application on a platform that supports serverless functions (like Vercel or Cloudflare Pages).
2. Swap the mock `AuthContext` with a real OAuth token exchange flow (via a serverless endpoint) or use Firebase/Clerk for identity.
3. Replace the `requestsStore` with React Query calls to your ServiceNow instance's REST APIs.

## Local Development

1. Install dependencies:
   ```bash
   cd web
   npm install
   ```

2. Run the dev server:
   ```bash
   npm run dev
   ```

## Deployment

This app is deployed to GitHub pages using the `gh-pages` package.

```bash
npm run predeploy # Builds the app to /dist
npm run deploy    # Pushes the /dist folder to the gh-pages branch
```
