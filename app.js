
const supabaseUrl = "https://przmomhaqfcqjzhnqnmh.supabase.co";
const supabaseKey = "SUA_PUBLISHABLE_KEY_AQUI";

const supabase = supabase.createClient(supabaseUrl, supabaseKey);
document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('tbody');
  const searchInput = document.getElementById('busca');
  const situationFilter = document.getElementById('f-sit');
  const totalKpi = document.getElementById('k-total');
  const criticalKpi = document.getElementById('k-crit');
  const completedKpi = document.getElementById('k-ok');

  let originalData = window.tableData; // Access the data injected from Python
  let filteredData = [...originalData]; // Data currently being displayed

  function renderTable() {
    tbody.innerHTML = ''; // Clear existing rows
    if (filteredData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">Nenhum cliente encontrado.</td></tr>';
      updateKPIs();
      return;
    }

    filteredData.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.Cliente}</td>
        <td>${row.Cidade}</td>
        <td>${row.Dias}</td>
        <td>${row['Situação']}</td>
        <td>${row.Horas}</td>
      `;
      tbody.appendChild(tr);
    });
    updateKPIs();
  }

  function updateKPIs() {
    totalKpi.innerText = filteredData.length;
    criticalKpi.innerText = filteredData.filter(c => c.Dias > 30).length; // Assuming 'Dias' is the column for days
    completedKpi.innerText = filteredData.filter(c => c['Situação'] === 'Concluído').length; // Assuming 'Situação' is the column for situation
  }

  function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedSituation = situationFilter.value;

    filteredData = originalData.filter(item => {
      const matchesSearch = searchTerm === '' ||
                            item.Cliente.toLowerCase().includes(searchTerm) ||
                            item.Cidade.toLowerCase().includes(searchTerm);

      const matchesSituation = selectedSituation === '' ||
                               item['Situação'] === selectedSituation;

      return matchesSearch && matchesSituation;
    });
    renderTable();
  }

  // Debounce for search input
  let timer;
  searchInput.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(applyFilters, 300);
  });

  situationFilter.addEventListener('change', applyFilters);

  // Clear filters function
  window.limpar = () => {
    searchInput.value = '';
    situationFilter.value = '';
    filteredData = [...originalData]; // Reset to original data
    renderTable();
  };

  // Initial render
  renderTable();
});
