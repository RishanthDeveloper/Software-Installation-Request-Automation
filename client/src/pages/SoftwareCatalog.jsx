import { useState } from 'react';
import { api } from '../api.js';
import { useApi } from '../useApi.js';
import { ErrorMessage, LoadingRows, SuccessMessage } from '../components/Feedback.jsx';
import { Field, fieldErrorsFrom, useFocusFirstError } from '../components/Field.jsx';

const EMPTY = { name: '', vendor: '', category: '', requiresLicense: false, licenseCount: '' };

function SoftwareRow({ item, onSaved }) {
  const [licenseCount, setLicenseCount] = useState(item.licenseCount ?? '');
  const [error, setError] = useState(null);
  const changed = String(licenseCount) !== String(item.licenseCount ?? '');

  async function save(changes) {
    setError(null);
    try {
      await api(`/software/${item.id}`, { method: 'PATCH', body: changes });
      onSaved(`${item.name} saved.`);
    } catch (err) {
      setError(err);
    }
  }

  return (
    <tr className={item.isActive ? undefined : 'is-inactive'}>
      <td data-label="Software"><span>{item.name}<span className="sub">{item.vendor}, {item.category}</span></span></td>
      <td data-label="Paid license">{item.requiresLicense ? 'Yes' : 'No'}</td>
      <td data-label="Licenses owned">
        <span className="btn-row">
          <input type="number" min="0" className="input input--sm" aria-label={`Licenses owned for ${item.name}`}
            placeholder="No limit" value={licenseCount} onChange={(e) => setLicenseCount(e.target.value)} />
          {changed && (
            <button type="button" className="btn btn--primary btn--sm"
              onClick={() => save({ licenseCount: licenseCount === '' ? null : Number(licenseCount) })}>Save</button>
          )}
        </span>
        {error && <span className="field__error">{error.message}</span>}
      </td>
      <td data-label="In use" className="num">{item.licensesInUse}</td>
      <td data-label="Catalog">
        <button type="button" className="text-button" onClick={() => save({ isActive: !item.isActive })}>
          {item.isActive ? 'Hide' : 'Show again'}
        </button>
      </td>
    </tr>
  );
}

export default function SoftwareCatalog() {
  const { data, error, loading, reload } = useApi('/software?all=1');
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState(null);
  const [message, setMessage] = useState('');
  useFocusFirstError(errors);

  async function add(e) {
    e.preventDefault();
    const found = {};
    if (form.name.trim().length < 2) found.name = 'Enter the software’s name.';
    if (form.vendor.trim().length < 2) found.vendor = 'Enter who makes it.';
    if (form.category.trim().length < 2) found.category = 'Enter a category, like Development.';
    setErrors(found);
    setFailure(null);
    if (Object.keys(found).length) return;
    try {
      await api('/software', {
        method: 'POST',
        body: { ...form, licenseCount: form.requiresLicense && form.licenseCount !== '' ? Number(form.licenseCount) : null },
      });
      setMessage(`${form.name} added to the catalog.`);
      setForm(EMPTY);
      reload();
    } catch (err) {
      const fe = fieldErrorsFrom(err);
      setErrors(fe);
      if (!Object.keys(fe).length) setFailure(err);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Catalog</h1>
          <p>What people can ask for. A hidden title can’t be requested, but open requests for it carry on.</p>
        </div>
      </div>
      {message && <SuccessMessage>{message}</SuccessMessage>}
      <ErrorMessage error={error} onRetry={reload} />
      {loading && !data && <LoadingRows />}

      {data && (
        <div className="table-card">
          <div className="table-scroll">
            <table className="table table--stack">
              <thead>
                <tr><th scope="col">Software</th><th scope="col">Paid license</th><th scope="col">Licenses owned</th><th scope="col">In use</th><th scope="col">Catalog</th></tr>
              </thead>
              <tbody>
                {data.software.map((item) => (
                  <SoftwareRow key={`${item.id}-${item.licenseCount}-${item.isActive}`} item={item}
                    onSaved={(text) => { setMessage(text); reload(); }} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <h2 className="section-title">Add software</h2>
      <form className="form card" onSubmit={add} noValidate style={{ maxWidth: '46rem' }}>
        <ErrorMessage error={failure} />
        <div className="form-row">
          <Field id="sw-name" label="Name" error={errors.name}>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field id="sw-vendor" label="Vendor" error={errors.vendor}>
            <input className="input" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} />
          </Field>
        </div>
        <div className="form-row">
          <Field id="sw-category" label="Category" error={errors.category}>
            <input className="input" list="categories" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </Field>
          {form.requiresLicense && (
            <Field id="sw-count" label="Licenses owned" hint="Leave empty for no limit.">
              <input className="input" type="number" min="0" value={form.licenseCount}
                onChange={(e) => setForm({ ...form, licenseCount: e.target.value })} />
            </Field>
          )}
        </div>
        <datalist id="categories">
          {[...new Set(data?.software.map((s) => s.category) ?? [])].map((c) => <option key={c} value={c} />)}
        </datalist>
        <label className="check">
          <input type="checkbox" checked={form.requiresLicense} onChange={(e) => setForm({ ...form, requiresLicense: e.target.checked })} />
          Needs a paid license
        </label>
        <div className="btn-row"><button type="submit" className="btn btn--primary">Add to catalog</button></div>
      </form>
    </>
  );
}
