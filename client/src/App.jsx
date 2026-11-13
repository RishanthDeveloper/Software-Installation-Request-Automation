import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { homePath, useAuth } from './auth.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import MyRequests from './pages/MyRequests.jsx';
import NewRequest from './pages/NewRequest.jsx';
import RequestDetail from './pages/RequestDetail.jsx';
import Approvals from './pages/Approvals.jsx';
import Queue from './pages/Queue.jsx';
import Reports from './pages/Reports.jsx';
import AllRequests from './pages/AllRequests.jsx';
import SoftwareCatalog from './pages/SoftwareCatalog.jsx';
import Users from './pages/Users.jsx';
import AuditLog from './pages/AuditLog.jsx';

function RequireUser({ roles, children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="page-head">
        <div>
          <h1>No access</h1>
          <p>Your account doesn’t have this page. Ask an admin if you need it.</p>
        </div>
      </div>
    );
  }
  return children;
}

export default function App() {
  const { user, checking } = useAuth();
  if (checking) return <div className="boot">Loading…</div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={homePath(user)} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={homePath(user)} replace /> : <Register />} />

      <Route element={<RequireUser><Layout /></RequireUser>}>
        <Route index element={<Navigate to={homePath(user)} replace />} />
        <Route path="requests" element={<MyRequests />} />
        <Route path="requests/new" element={<NewRequest />} />
        <Route path="requests/:id" element={<RequestDetail />} />
        <Route path="approvals" element={<RequireUser roles={['manager', 'admin']}><Approvals /></RequireUser>} />
        <Route path="queue" element={<RequireUser roles={['it_support', 'admin']}><Queue /></RequireUser>} />
        <Route path="reports" element={<RequireUser roles={['manager', 'it_support', 'admin']}><Reports /></RequireUser>} />
        <Route path="admin/requests" element={<RequireUser roles={['admin']}><AllRequests /></RequireUser>} />
        <Route path="admin/software" element={<RequireUser roles={['admin']}><SoftwareCatalog /></RequireUser>} />
        <Route path="admin/users" element={<RequireUser roles={['admin']}><Users /></RequireUser>} />
        <Route path="admin/audit" element={<RequireUser roles={['admin']}><AuditLog /></RequireUser>} />
        <Route path="*" element={<div className="page-head"><div><h1>Page not found</h1><p>Check the address, or use the menu.</p></div></div>} />
      </Route>
    </Routes>
  );
}
