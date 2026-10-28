(async () => { await requireAuth(); load(); })();

async function load() {
  const rows = await apiRequest('/api/detections');
  document.getElementById('tbody').innerHTML = rows.map(d => `
    <tr>
      <td>#${d.detection_id}</td>
      <td>${d.full_name || '—'}</td>
      <td>${d.disease_name || 'Unclassified'}</td>
      <td>${parseFloat(d.confidence_score).toFixed(1)}%</td>
      <td>${d.gps_location || '—'}</td>
      <td>${new Date(d.date_captured).toLocaleString()}</td>
      <td><button class="btn btn-danger" onclick="del(${d.detection_id})">Delete</button></td>
    </tr>`).join('') || '<tr><td colspan="7" style="text-align:center;color:#999;">No records</td></tr>';
}

async function del(id) {
  if (!confirm('Delete this record?')) return;
  await apiRequest(`/api/detections/${id}`, { method: 'DELETE' });
  load();
}