// ===== UI UTILITIES =====

/* ─── Toast ─── */
const ICONS = {
  success: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 13.01 9 10.01"/></svg>`,
  error:   `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  warning: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info:    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
};

let _toastContainer = null;
function getToastContainer() {
  if (!_toastContainer) {
    _toastContainer = Object.assign(document.createElement('div'), { className: 'toast-container' });
    document.body.appendChild(_toastContainer);
  }
  return _toastContainer;
}

export function toast(type, message, title) {
  const titles = { success: 'Success', error: 'Error', warning: 'Warning', info: 'Info' };
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `
    <div class="toast-icon">${ICONS[type]}</div>
    <div>
      <div class="toast-title">${title || titles[type]}</div>
      <div class="toast-message">${message}</div>
    </div>`;
  getToastContainer().appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
  setTimeout(() => {
    el.classList.add('hiding');
    el.addEventListener('transitionend', () => el.remove(), { once: true });
  }, 3600);
}

/* ─── Avatar helpers ─── */
const PALETTE = ['#3b5bdb','#7048e8','#0c8599','#2f9e44','#e67700','#c92a2a','#e8590c','#5c7cfa','#099268','#862e9c'];

export function avatarColor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
}

export function initials(name = '') {
  const p = name.trim().split(/\s+/);
  if (p.length === 1) return p[0][0]?.toUpperCase() || '?';
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

/* ─── Formatting ─── */
export function formatINR(n) {
  if (n == null || n === '') return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function deptStyle(dept) {
  const MAP = {
    Engineering: { bg:'#eef2ff', color:'#3b5bdb' },
    HR:          { bg:'#f8f0fc', color:'#862e9c' },
    Finance:     { bg:'#ebfbee', color:'#2f9e44' },
    Marketing:   { bg:'#fff4e6', color:'#e67700' },
    Operations:  { bg:'#e3fafc', color:'#0c8599' },
    Design:      { bg:'#fff0f6', color:'#c2255c' },
  };
  return MAP[dept] || { bg:'#f1f3f5', color:'#495057' };
}

/* ─── Count-up animation ─── */
export function countUp(el, target, ms = 1100) {
  let start = null;
  const step = (ts) => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / ms, 1);
    el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}

/* ─── Button loading state ─── */
export function btnLoading(btn, on) {
  if (on) {
    btn.dataset.orig = btn.innerHTML;
    btn.innerHTML = `<span class="spinner"></span>`;
    btn.disabled = true;
  } else {
    btn.innerHTML = btn.dataset.orig || btn.innerHTML;
    btn.disabled = false;
  }
}

/* ─── Status badge HTML ─── */
export function statusBadge(status) {
  const map = { Active:'badge-active', Inactive:'badge-inactive', 'On Leave':'badge-leave' };
  return `<span class="badge ${map[status] || 'badge-inactive'}">${status || 'Unknown'}</span>`;
}
