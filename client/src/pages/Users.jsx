import { useState } from 'react';
import { api } from '../api.js';
import { useApi } from '../useApi.js';
import { useAuth } from '../auth.jsx';
import { ROLE_LABELS, formatDate } from '../format.js';
import { ErrorMessage, LoadingRows, SuccessMessage } from '../components/Feedback.jsx';

function UserRow({ person, departments, isSelf, onSaved }) {
  const [role, setRole] = useState(person.role);
  const [departmentId, setDepartmentId] = useState(person.departmentId ?? '');
  const [error, setError] = useState(null);
  const changed = role !== person.role || String(departmentId) !== String(person.departmentId ?? '');

  async function save(extra = {}) {
    setError(null);
    try {
      await api(`/admin/users/${person.id}`, {
        method: 'PATCH',
        body: { role, departmentId: departmentId === '' ? null : Number(departmentId), ...extra },
      });
      onSaved(`${person.name} saved.`);
    } catch (err) {
      setError(err);
    }
  }

  return (
    <tr className={person.isActive ? undefined : 'is-inactive'}>
      <td data-label="Person"><span>{person.name}{isSelf && ' (you)'}<span className="sub">{person.email}</span></span></td>
      <td data-label="Role">
        <select className="select select--sm" value={role} disabled={isSelf} aria-label={`Role for ${person.name}`}
          onChange={(e) => setRole(e.target.value)}>
          {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </td>
      <td data-label="Department">
        <select className="select select--sm" value={departmentId} aria-label={`Department for ${person.name}`}
          onChange={(e) => setDepartmentId(e.target.value)}>
          <option value="">None</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </td>
      <td data-label="Joined">{formatDate(person.createdAt)}</td>
      <td data-label="Access">
        {changed && <button type="button" className="btn btn--primary btn--sm" onClick={() => save()}>Save</button>}
        {!changed && !isSelf && (
          <button type="button" className="text-button" onClick={() => save({ isActive: !person.isActive })}>
            {person.isActive ? 'Switch off' : 'Switch on'}
          </button>
        )}
        {error && <span className="field__error">{error.message}</span>}
      </td>
    </tr>
  );
}

export default function Users() {
  const { user } = useAuth();
  const users = useApi('/admin/users');
  const departments = useApi('/departments');
  const [message, setMessage] = useState('');

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Users</h1>
          <p>Managers approve for their own department. A change takes effect at once, even for someone already signed in.</p>
        </div>
      </div>
      {message && <SuccessMessage>{message}</SuccessMessage>}
      <ErrorMessage error={users.error || departments.error} onRetry={users.reload} />
      {users.loading && !users.data && <LoadingRows />}
      {users.data && departments.data && (
        <div className="table-card">
          <div className="table-scroll">
            <table className="table table--stack">
              <thead><tr><th scope="col">Person</th><th scope="col">Role</th><th scope="col">Department</th><th scope="col">Joined</th><th scope="col">Access</th></tr></thead>
              <tbody>
                {users.data.users.map((person) => (
                  <UserRow
                    key={`${person.id}-${person.role}-${person.departmentId}-${person.isActive}`}
                    person={person}
                    departments={departments.data.departments}
                    isSelf={person.id === user.id}
                    onSaved={(text) => { setMessage(text); users.reload(); }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
