// Small wrapper around fetch. The session lives in an httpOnly cookie,
// so the browser sends it automatically and JavaScript never sees the token.
export async function api(path, { method = 'GET', body } = {}) {
  const options = { method, credentials: 'same-origin', headers: {} };
  if (method !== 'GET') {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body ?? {});
  }

  let res;
  try {
    res = await fetch(`/api${path}`, options);
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(data?.error || `Request failed (${res.status}).`);
    error.status = res.status;
    error.details = data?.details;
    throw error;
  }
  return data;
}
