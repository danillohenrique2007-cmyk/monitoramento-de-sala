let simInterval = null;
let isSimulating = true;
let quickChartInstance = null;
let analyticsChartInstance = null;

const tabMetaData = {
  'dashboard': { title: 'Visão Geral do Sistema', subtitle: 'Monitoramento e controle em tempo real' },
  'devices': { title: 'Controle de Dispositivos', subtitle: 'Gerencie atuadores e equipamentos' },
  'sensors': { title: 'Telemetria de Sensores', subtitle: 'Status e leituras detalhadas do ambiente' },
  'analytics': { title: 'Análise e Histórico', subtitle: 'Visualização gráfica de métricas' },
  'alerts': { title: 'Central de Alertas', subtitle: 'Notificações e avisos do sistema' },
  'feature': { title: 'Proposta da Equipe 01', subtitle: 'Melhoria integrada: Automação Inteligente' }
};

document.addEventListener('DOMContentLoaded', () => {
  initCharts();
  startSimulation();
});

function switchTab(tabId) {
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

  const activeBtn = document.querySelector(`[onclick="switchTab('${tabId}')"]`);
  if(activeBtn) activeBtn.classList.add('active');

  const selectedTab = document.getElementById(`tab-${tabId}`);
  if(selectedTab) selectedTab.classList.add('active');

  if(tabMetaData[tabId]) {
    document.getElementById('tab-title').innerText = tabMetaData[tabId].title;
    document.getElementById('tab-subtitle').innerText = tabMetaData[tabId].subtitle;
  }
}

// Comunicação com o servidor Python ao alterar switches
function toggleDevice(dev) {
  const isChecked = document.getElementById(`dev-${dev}`).checked;
  syncDevice(dev, isChecked);
}

function syncDevice(dev, state) {
  const el1 = document.getElementById(`dev-${dev}`);
  const el2 = document.getElementById(`dev-${dev}-2`);
  
  if(el1) el1.checked = state;
  if(el2) el2.checked = state;

  const statusEl = document.getElementById(`status-${dev}`);
  if(statusEl) {
    statusEl.innerText = state ? 'LIGADO' : 'DESLIGADO';
    statusEl.className = state ? 'status-on' : 'status-off';
  }

  // Envia requisição para a API Python
  fetch('/api/device/toggle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ device: dev, state: state })
  })
  .then(res => res.json())
  .then(data => console.log('Sincronizado com Python:', data))
  .catch(err => console.error('Erro ao conectar com Python:', err));
}

// Gráficos Chart.js
function initCharts() {
  const ctxQuick = document.getElementById('quickChart').getContext('2d');
  quickChartInstance = new Chart(ctxQuick, {
    type: 'line',
    data: {
      labels: ['10:00', '11:00', '12:00', '13:00', '14:00', 'Agora'],
      datasets: [{
        label: 'Consumo (kW)',
        data: [1.1, 1.3, 1.2, 1.5, 1.4, 1.42],
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } }
      }
    }
  });

  const ctxAnalytics = document.getElementById('analyticsChart').getContext('2d');
  analyticsChartInstance = new Chart(ctxAnalytics, {
    type: 'line',
    data: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      datasets: [
        { label: 'Temperatura (°C)', data: [21, 19, 22, 26, 25, 23], borderColor: '#ef4444', tension: 0.4 },
        { label: 'Umidade (%)', data: [65, 70, 60, 52, 55, 62], borderColor: '#38bdf8', tension: 0.4 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#f8fafc' } } },
      scales: {
        x: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } }
      }
    }
  });
}

// Busca dados ao vivo da API Python
function startSimulation() {
  simInterval = setInterval(() => {
    if (!isSimulating) return;

    fetch('/api/sensors')
      .then(res => res.json())
      .then(data => {
        document.getElementById('temp-val').innerText = data.temperature;
        document.getElementById('sensor-temp').innerText = `${data.temperature} °C`;

        document.getElementById('humidity-val').innerText = data.humidity;
        document.getElementById('sensor-hum').innerText = `${data.humidity} %`;

        document.getElementById('power-val').innerText = data.power;
        document.getElementById('latency-val').innerText = data.latency;

        if(quickChartInstance) {
          quickChartInstance.data.datasets[0].data.shift();
          quickChartInstance.data.datasets[0].data.push(data.power);
          quickChartInstance.update();
        }
      })
      .catch(err => console.error('Erro ao buscar dados do Python:', err));

  }, 3000);
}

function toggleSim() {
  isSimulating = !isSimulating;
  document.getElementById('sim-text').innerText = isSimulating ? 'Pausar Simulação' : 'Retomar Simulação';
  document.getElementById('sim-icon').innerText = isSimulating ? '⏸️' : '▶️';
}

function toggleAiMode(active) {
  const box = document.getElementById('ai-status');
  box.classList.toggle('hidden', !active);
}