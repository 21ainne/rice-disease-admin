(async () => {
  await requireAuth();
  const rows = await apiRequest('/api/evaluations');
  document.getElementById('tbody').innerHTML = rows.map(e => `
    <tr>
      <td>${e.response_id}</td>
      <td>${e.full_name}</td>
      <td>${e.role}</td>
      <td>${e.evaluation_criterion}</td>
      <td>${'★'.repeat(e.rating_score)}${'☆'.repeat(5-e.rating_score)}</td>
      <td>${new Date(e.date_submitted).toLocaleString()}</td>
    </tr>`).join('') || '<tr><td colspan="6" style="text-align:center;color:#999;">No evaluations yet</td></tr>';
})();
