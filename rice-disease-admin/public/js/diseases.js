(async () => { await requireAuth(); load(); })();

function tag(c) {
  const map = { Fungal:'tag-fungal', Bacterial:'tag-bacterial', Viral:'tag-viral', 'Insect Pest':'tag-insect', Healthy:'tag-healthy' };
  return `<span class="tag ${map[c] || ''}">${c}</span>`;
}

async function load() {
  const rows = await apiRequest('/api/diseases');
  document.getElementById('tbody').innerHTML = rows.map(d => `
    <tr>
      <td>${d.disease_id}</td><td>${d.disease_name}</td><td>${tag(d.category)}</td>
      <td style="max-width:340px;">${d.description || '—'}</td>
      <td>
        <button class="btn btn-secondary" onclick='edit(${JSON.stringify(d)})'>Edit</button>
        <button class="btn btn-danger" onclick="del(${d.disease_id})">Delete</button>
      </td>
    </tr>`).join('');
}

function openModal() {
  document.getElementById('modalTitle').textContent = 'Add Disease';
  ['editId','disease_name','description','glcm_feature_profile'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('category').value = 'Fungal';
  document.getElementById('modalBg').classList.add('show');
}
function closeModal() { document.getElementById('modalBg').classList.remove('show'); }
function edit(d) {
  document.getElementById('modalTitle').textContent = 'Edit Disease';
  document.getElementById('editId').value = d.disease_id;
  document.getElementById('disease_name').value = d.disease_name;
  document.getElementById('category').value = d.category;
  document.getElementById('description').value = d.description || '';
  document.getElementById('glcm_feature_profile').value = d.glcm_feature_profile || '';
  document.getElementById('modalBg').classList.add('show');
}
async function saveDisease() {
  const id = document.getElementById('editId').value;
  const payload = {
    disease_name: document.getElementById('disease_name').value.trim(),
    category: document.getElementById('category').value,
    description: document.getElementById('description').value.trim(),
    glcm_feature_profile: document.getElementById('glcm_feature_profile').value.trim()
  };
  await apiRequest(id ? `/api/diseases/${id}` : '/api/diseases', {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload), credentials: 'include'
  });
  closeModal(); load();
}
async function del(id) {
  if (!confirm('Delete this disease?')) return;
  await apiRequest(`/api/diseases/${id}`, { method: 'DELETE' });
  load();
}