let DISEASES = [];
(async () => {
  await requireAuth();
  DISEASES = await apiRequest('/api/diseases');
  await load();
})();

async function load() {
  const rows = await apiRequest('/api/recommendations');
  document.getElementById('tbody').innerHTML = rows.map(r => `
    <tr>
      <td>${r.recommendation_id}</td>
      <td>${r.disease_name}</td>
      <td style="max-width:260px;">${r.treatment_text}</td>
      <td style="max-width:260px;">${r.pesticide_fertilizer_guide || '—'}</td>
      <td>${r.source_reference || '—'}</td>
      <td>
        <button class="btn btn-secondary" onclick='edit(${JSON.stringify(r)})'>Edit</button>
        <button class="btn btn-danger" onclick="del(${r.recommendation_id})">Delete</button>
      </td>
    </tr>`).join('') || '<tr><td colspan="6" style="text-align:center;color:#999;">None yet</td></tr>';
}

function fillSelect(selected) {
  const sel = document.getElementById('disease_id');
  sel.innerHTML = DISEASES.map(d => `<option value="${d.disease_id}" ${d.disease_id===selected?'selected':''}>${d.disease_name}</option>`).join('');
}

function openModal() {
  document.getElementById('modalTitle').textContent = 'Add Recommendation';
  ['editId','treatment_text','pesticide_fertilizer_guide','source_reference'].forEach(id => document.getElementById(id).value = '');
  fillSelect(); document.getElementById('modalBg').classList.add('show');
}
function closeModal() { document.getElementById('modalBg').classList.remove('show'); }
function edit(r) {
  document.getElementById('modalTitle').textContent = 'Edit Recommendation';
  document.getElementById('editId').value = r.recommendation_id;
  fillSelect(r.disease_id);
  document.getElementById('treatment_text').value = r.treatment_text;
  document.getElementById('pesticide_fertilizer_guide').value = r.pesticide_fertilizer_guide || '';
  document.getElementById('source_reference').value = r.source_reference || '';
  document.getElementById('modalBg').classList.add('show');
}
async function save() {
  const id = document.getElementById('editId').value;
  const payload = {
    disease_id: parseInt(document.getElementById('disease_id').value),
    treatment_text: document.getElementById('treatment_text').value.trim(),
    pesticide_fertilizer_guide: document.getElementById('pesticide_fertilizer_guide').value.trim(),
    source_reference: document.getElementById('source_reference').value.trim()
  };
  await apiRequest(id ? `/api/recommendations/${id}` : '/api/recommendations', {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload), credentials: 'include'
  });
  closeModal(); load();
}
async function del(id) {
  if (!confirm('Delete this recommendation?')) return;
  await apiRequest(`/api/recommendations/${id}`, { method: 'DELETE' });
  load();
}