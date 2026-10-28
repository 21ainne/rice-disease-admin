(async () => { await requireAuth(); loadUsers(); })();

async function loadUsers() {
  const rows = await apiRequest('/api/users');
  document.getElementById('tbody').innerHTML = rows.map(u => `
    <tr>
      <td>${u.user_id}</td><td>${u.full_name}</td><td>${u.username}</td>
      <td>${u.role}</td><td>${u.barangay || '—'}</td>
      <td>${u.is_active ? '✅ Active' : '⛔ Inactive'}</td>
      <td>
        <button class="btn btn-secondary" onclick='editUser(${JSON.stringify(u)})'>Edit</button>
        <button class="btn btn-danger" onclick="delUser(${u.user_id})">Delete</button>
      </td>
    </tr>`).join('');
}

function openModal() {
  document.getElementById('modalTitle').textContent = 'Add User';
  ['editId','full_name','username','password','contact_number','barangay'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('role').value = 'Farmer';
  document.getElementById('is_active').value = '1';
  document.getElementById('modalBg').classList.add('show');
}
function closeModal() { document.getElementById('modalBg').classList.remove('show'); }

function editUser(u) {
  document.getElementById('modalTitle').textContent = 'Edit User';
  document.getElementById('editId').value = u.user_id;
  document.getElementById('full_name').value = u.full_name;
  document.getElementById('username').value = u.username;
  document.getElementById('password').value = '';
  document.getElementById('role').value = u.role;
  document.getElementById('contact_number').value = u.contact_number || '';
  document.getElementById('barangay').value = u.barangay || '';
  document.getElementById('is_active').value = u.is_active ? '1' : '0';
  document.getElementById('modalBg').classList.add('show');
}

async function saveUser() {
  const id = document.getElementById('editId').value;
  const payload = {
    full_name: document.getElementById('full_name').value.trim(),
    username: document.getElementById('username').value.trim(),
    password: document.getElementById('password').value,
    role: document.getElementById('role').value,
    contact_number: document.getElementById('contact_number').value.trim(),
    barangay: document.getElementById('barangay').value.trim(),
    is_active: parseInt(document.getElementById('is_active').value)
  };
  const url = id ? `/api/users/${id}` : '/api/users';
  const method = id ? 'PUT' : 'POST';
  await apiRequest(url, {
    method, headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload), credentials: 'include'
  });
  closeModal(); loadUsers();
}

async function delUser(id) {
  if (!confirm('Delete this user?')) return;
  await apiRequest(`/api/users/${id}`, { method: 'DELETE' });
  loadUsers();
}