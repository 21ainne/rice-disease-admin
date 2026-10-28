(async () => {
  await requireAuth();

  const [users, diseases, detections, evals] = await Promise.all([
    apiRequest('/api/users'),
    apiRequest('/api/diseases'),
    apiRequest('/api/detections'),
    apiRequest('/api/evaluations')
  ]);

  document.getElementById('stats').innerHTML = `
    <div class="stat-card"><h3>Total Users</h3><div class="val">${users.length}</div></div>
    <div class="stat-card"><h3>Diseases/Pests</h3><div class="val">${diseases.length}</div></div>
    <div class="stat-card"><h3>Detection Records</h3><div class="val">${detections.length}</div></div>
    <div class="stat-card"><h3>Evaluations</h3><div class="val">${evals.length}</div></div>
  `;

  document.getElementById('recentBody').innerHTML = detections.slice(0, 10).map(d => `
    <tr>
      <td>#${d.detection_id}</td>
      <td>${d.full_name || '—'}</td>
      <td>${d.disease_name || 'Unclassified'}</td>
      <td>${parseFloat(d.confidence_score).toFixed(1)}%</td>
      <td>${new Date(d.date_captured).toLocaleString()}</td>
    </tr>
  `).join('') || '<tr><td colspan="5" style="text-align:center;color:#999;">No records yet</td></tr>';
})();