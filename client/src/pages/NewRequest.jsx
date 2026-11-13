import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useApi } from '../useApi.js';
import { requestNumber } from '../format.js';
import { ErrorMessage, LoadingRows, Notice } from '../components/Feedback.jsx';
import { Field, fieldErrorsFrom, useFocusFirstError } from '../components/Field.jsx';

const LICENSED_MIN = 30;

export default function NewRequest() {
  const navigate = useNavigate();
  const catalog = useApi('/software');
  const [form, setForm] = useState({
    softwareId: '', version: '', deviceTag: '', urgency: 'normal', neededBy: '', justification: '',
  });
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState(null);
  const [busy, setBusy] = useState(false);
  useFocusFirstError(errors);

  const software = catalog.data?.software ?? [];
  const selected = software.find((s) => String(s.id) === form.softwareId);
  const minReason = selected?.requiresLicense ? LICENSED_MIN : 10;
  const noLicensesLeft = selected && selected.licenseCount !== null && selected.licensesInUse >= selected.licenseCount;

  const byCategory = useMemo(() => {
    const groups = {};
    software.forEach((s) => { (groups[s.category] ||= []).push(s); });
    return groups;
  }, [software]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const found = {};
    if (!form.softwareId) found.softwareId = 'Choose the software you need.';
    if (form.deviceTag.trim().length < 2) found.deviceTag = 'Enter the asset tag from the sticker on your computer.';
    if (form.justification.trim().length < minReason) {
      found.justification = `Say what you need it for, in at least ${minReason} characters.`;
    }
    setErrors(found);
    setFailure(null);
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      const { id } = await api('/requests', { method: 'POST', body: { ...form, softwareId: Number(form.softwareId) } });
      navigate(`/requests/${id}`, { state: { justCreated: true } });
    } catch (err) {
      const fieldErrors = fieldErrorsFrom(err);
      setErrors(fieldErrors);
      if (!Object.keys(fieldErrors).length) setFailure(err);
      setBusy(false);
    }
  }

  if (catalog.loading) return <><h1>Request software</h1><LoadingRows /></>;

  return (
    <div className="measure" style={{ maxWidth: '46rem' }}>
      <Link to="/requests" className="back">My requests</Link>
      <div className="page-head">
        <div>
          <h1>Request software</h1>
          <p>Your manager approves it first. IT then checks the license and installs it on the computer you name.</p>
        </div>
      </div>

      <ErrorMessage error={catalog.error} onRetry={catalog.reload} />
      {failure && (
        <Notice
          tone="error"
          action={failure.details?.existingId && (
            <Link className="link" to={`/requests/${failure.details.existingId}`}>
              Open {requestNumber(failure.details.existingId)}
            </Link>
          )}
        >
          {failure.message}
        </Notice>
      )}

      <form className="form card" onSubmit={submit} noValidate>
        <Field id="softwareId" label="Software" error={errors.softwareId}>
          <select className="select" value={form.softwareId} onChange={update('softwareId')}>
            <option value="">Choose from the catalog</option>
            {Object.entries(byCategory).map(([category, items]) => (
              <optgroup key={category} label={category}>
                {items.map((s) => <option key={s.id} value={s.id}>{s.name}, {s.vendor}</option>)}
              </optgroup>
            ))}
          </select>
        </Field>

        {selected?.requiresLicense && (
          <Notice tone="info">
            {selected.name} needs a paid license
            {selected.licenseCount !== null ? `: ${selected.licensesInUse} of ${selected.licenseCount} are in use.` : '.'}
            {noLicensesLeft && ' None are free right now, so IT may have to wait for one before approving.'}
          </Notice>
        )}

        <div className="form-row">
          <Field id="deviceTag" label="Computer asset tag" hint="On the sticker under your laptop, like LT-0042." error={errors.deviceTag}>
            <input className="input" value={form.deviceTag} onChange={update('deviceTag')} maxLength={40} />
          </Field>
          <Field id="version" label="Version" optional error={errors.version}>
            <input className="input" value={form.version} onChange={update('version')} placeholder="Latest" maxLength={40} />
          </Field>
        </div>

        <div className="form-row">
          <div className="field">
            <span className="field__label" id="urgency-label">Urgency</span>
            <div className="choices" role="radiogroup" aria-labelledby="urgency-label">
              {[['low', 'Low'], ['normal', 'Normal'], ['high', 'High']].map(([value, label]) => (
                <label key={value} className="choice">
                  <input type="radio" name="urgency" value={value} checked={form.urgency === value} onChange={update('urgency')} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <p className="field__hint">Targets: high 24 hours, normal 3 days, low 5 days.</p>
          </div>
          <Field id="neededBy" label="Needed by" optional error={errors.neededBy}>
            <input className="input" type="date" value={form.neededBy} onChange={update('neededBy')}
              min={new Date().toISOString().slice(0, 10)} />
          </Field>
        </div>

        <Field
          id="justification"
          label="What do you need it for?"
          hint={`${form.justification.trim().length} characters, at least ${minReason}. Name the project or task.`}
          error={errors.justification}
        >
          <textarea className="textarea" rows={5} maxLength={1000} value={form.justification} onChange={update('justification')} />
        </Field>

        <div className="btn-row">
          <button type="submit" className="btn btn--primary btn--go" disabled={busy}>
            {busy ? 'Sending' : 'Send request'}
          </button>
          <Link to="/requests" className="btn btn--secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
