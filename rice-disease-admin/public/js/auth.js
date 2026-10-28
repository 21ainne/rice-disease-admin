async function requireAuth() {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (!res.ok) { window.location.href = '/index.html'; return null; }
    const data = await res.json();
    const userEl = document.getElementById('currentUser');
    if (userEl) userEl.textContent = `${data.user.full_name} (${data.user.role})`;
    return data.user;
  } catch (e) {
    window.location.href = '/index.html';
  }
}

async function apiRequest(url, options = {}) {
  let res;
  try {
    res = await fetch(url, { credentials: 'include', ...options });
  } catch {
    throw new Error('Cannot connect to the server. Start the app from the workspace root with npm start.');
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`The server returned an invalid response (${res.status}).`);
  }

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status}).`);
  }

  return data;
}

function showPageError(error) {
  let banner = document.getElementById('pageError');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'pageError';
    banner.className = 'page-error';
    banner.setAttribute('role', 'alert');
    const target = document.querySelector('.content') || document.body;
    target.prepend(banner);
  }
  banner.textContent = error instanceof Error ? error.message : String(error);
}

window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault();
  showPageError(event.reason);
});

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  window.location.href = '/index.html';
}

// Highlight active nav
document.addEventListener('DOMContentLoaded', () => {
  const path = location.pathname.split('/').pop() || 'dashboard.html';
  document.querySelectorAll('.sidebar nav a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
  
  // Restore sidebar state if it was collapsed
  if (localStorage.getItem('sidebarCollapsed') === 'true') {
    const sb = document.getElementById('sidebar');
    if(sb) sb.classList.add('collapsed');
  }
});

// THE TOGGLE FUNCTION
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  
  sidebar.classList.toggle('collapsed');
  
  // Save state
  if (sidebar.classList.contains('collapsed')) {
    localStorage.setItem('sidebarCollapsed', 'true');
  } else {
    localStorage.setItem('sidebarCollapsed', 'false');
  }
}