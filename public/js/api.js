const BASE = 'http://localhost:3000';

const getToken = () => localStorage.getItem('ems_token');

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(BASE + endpoint, { ...options, headers });

  if (res.status === 401) {
    localStorage.clear();
    const role = window.location.pathname.includes('/employee/') ? 'employee' : 'admin';
    window.location.replace(role === 'employee' ? '../employee/login.html' : '../admin/login.html');
    return;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

const api = {
  get:    (url)        => request(url),
  post:   (url, body)  => request(url, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (url, body)  => request(url, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (url)        => request(url, { method: 'DELETE' }),
};

export default api;
