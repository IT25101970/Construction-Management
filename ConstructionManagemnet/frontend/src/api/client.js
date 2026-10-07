const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
let csrf;

export async function request(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && !csrf) {
    csrf = await request('/auth/csrf');
  }
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(csrf && !['GET', 'HEAD', 'OPTIONS'].includes(method) ? { [csrf.headerName]: csrf.token } : {}),
      ...options.headers,
    },
  });
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : null; }
  catch { throw new Error('Server returned an invalid response. Check the API URL.'); }
  if (!response.ok) {
    if (response.status === 401) window.dispatchEvent(new Event('session-expired'));
    if (response.status === 401 || response.status === 403) csrf = undefined;
    throw new Error(data?.message || (data?.errors ? Object.values(data.errors).join(', ') : `Request failed (${response.status})`));
  }
  if (endpoint === '/auth/logout') csrf = undefined;
  return data;
}
