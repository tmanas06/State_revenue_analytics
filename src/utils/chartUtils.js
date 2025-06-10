import { Chart, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

// Format currency for display
const formatCurrency = (value) => {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L Cr`;
  }
  return `₹${value.toLocaleString('en-IN')} Cr`;
};

// Format percentage for display
const formatPercentage = (value) => {
  return `${(value * 100).toFixed(1)}%`;
};

// Create revenue trends chart
export const createRevenueTrendsChart = (filteredData, years, charts) => {
  const ctx = document.getElementById('revenueTrendsChart')?.getContext('2d');
  if (!ctx) return;
  
  // Aggregate data by state and year
  const stateData = {};
  filteredData.forEach(item => {
    if (!stateData[item.States]) {
      stateData[item.States] = {};
    }
    years.forEach(year => {
      if (!stateData[item.States][year]) {
        stateData[item.States][year] = 0;
      }
      stateData[item.States][year] += item[year] || 0;
    });
  });
  
  const chartColors = [
    'rgba(54, 162, 235, 1)',
    'rgba(255, 99, 132, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(153, 102, 255, 1)'
  ];
  
  const datasets = Object.keys(stateData).map((state, index) => ({
    label: `${state} (${state === 'Odisha' ? 'OD' : 'UP'})`,
    data: years.map(year => stateData[state][year]),
    borderColor: chartColors[index % chartColors.length],
    backgroundColor: chartColors[index % chartColors.length] + '40',
    borderWidth: 2,
    tension: 0.4,
    fill: false
  }));
  
  // Destroy existing chart if it exists
  if (charts.revenueTrends) {
    charts.revenueTrends.destroy();
  }
  
  // Create new chart
  charts.revenueTrends = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => {
              return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
            }
          }
        },
        legend: {
          position: 'top',
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => formatCurrency(value)
          }
        }
      }
    }
  });
};

// Create revenue composition chart
export const createRevenueCompositionChart = (filteredData, charts) => {
  const ctx = document.getElementById('revenueCompositionChart')?.getContext('2d');
  if (!ctx) return;
  
  // Aggregate data by type
  const typeData = {};
  filteredData.forEach(item => {
    if (!typeData[item.Type]) {
      typeData[item.Type] = 0;
    }
    typeData[item.Type] += item['FY24'] || 0;
  });
  
  const chartColors = [
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 99, 132, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(255, 159, 64, 0.7)',
    'rgba(153, 102, 255, 0.7)'
  ];
  
  // Destroy existing chart if it exists
  if (charts.revenueComposition) {
    charts.revenueComposition.destroy();
  }
  
  // Create new chart
  charts.revenueComposition = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(typeData),
      datasets: [{
        data: Object.values(typeData),
        backgroundColor: chartColors.slice(0, Object.keys(typeData).length),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const value = context.raw;
              const percentage = Math.round((value / total) * 100);
              return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
            }
          }
        },
        legend: {
          position: 'right',
        }
      }
    }
  });
};

// Create state comparison chart
export const createStateComparisonChart = (data, stateFilter, years, charts = {}) => {
  const container = document.getElementById('stateComparisonContainer');
  if (!container) return null;
  
  // Clear previous charts
  container.innerHTML = '';
  
  // If no data, return
  if (!data || data.length === 0) {
    return null;
  }
  
  // Get unique states and types from the filtered data
  const states = [...new Set(data.map(item => item.States))];
  const types = [...new Set(data.map(item => item.Type))];
  const year = years[0] || 'FY24'; // Use the first year if multiple provided
  
  // Chart colors
  const chartColors = [
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 99, 132, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)'
  ];
  
  // Create a container for the charts
  const chartsContainer = document.createElement('div');
  chartsContainer.className = 'state-charts-container';
  container.appendChild(chartsContainer);
  
  // Create a chart for each selected state
  const selectedStates = [...new Set(data.map(item => item.States))];
  
  selectedStates.forEach((state, stateIndex) => {
    // Create chart container
    const chartContainer = document.createElement('div');
    chartContainer.className = 'state-chart-container';
    
    const canvas = document.createElement('canvas');
    canvas.id = `stateChart-${stateIndex}`;
    chartContainer.appendChild(canvas);
    chartsContainer.appendChild(chartContainer);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Filter data for this state and selected types
    const stateData = data.filter(item => item.States === state);
    
    // Prepare datasets for this state
    const chartData = {
      labels: stateData.map(item => item.Type),
      datasets: [{
        label: `Revenue (${year})`,
        data: stateData.map(item => item[year] || 0),
        backgroundColor: chartColors.slice(0, stateData.length),
        borderColor: chartColors.slice(0, stateData.length).map(color => color.replace('0.8', '1')),
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 20,
        categoryPercentage: 0.8,
        barPercentage: 0.9
      }]
    };
    
    // Create the chart
    new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'x', // Changed to x for vertical columns
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Revenue (₹ Cr)',
              font: {
                weight: 'bold',
                size: 13
              }
            },
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              callback: (value) => formatCurrency(value)
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              autoSkip: false,
              maxRotation: 45,
              minRotation: 45
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.raw || 0;
                return `${label}: ${formatCurrency(value)}`;
              },
              labelColor: function(context) {
                return {
                  borderColor: context.dataset.borderColor[context.dataIndex],
                  backgroundColor: context.dataset.backgroundColor[context.dataIndex],
                  borderWidth: 2,
                  borderRadius: 2,
                };
              }
            }
          },
          legend: {
            display: false
          },
          title: {
            display: true,
            text: state,
            font: {
              size: 16,
              weight: '600',
              family: 'Inter, system-ui, -apple-system, sans-serif'
            },
            padding: {
              top: 0,
              bottom: 20
            }
          }
        },
        layout: {
          padding: 20
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        }
      }
    });
  });
  
  return container;
};

// Create growth rate chart
export const createGrowthRateChart = (filteredData, charts) => {
  const ctx = document.getElementById('growthRateChart')?.getContext('2d');
  if (!ctx) return;
  
  // Calculate growth rates by type
  const growthRates = [];
  const labels = [];
  
  filteredData.forEach(item => {
    const current = item['FY24'] || 0;
    const previous = item['FY23'] || 0;
    const growth = previous ? ((current - previous) / previous) * 100 : 0;
    growthRates.push(growth);
    labels.push(item.Type);
  });
  
  // Destroy existing chart if it exists
  if (charts.growthRate) {
    charts.growthRate.destroy();
  }
  
  // Create new chart
  charts.growthRate = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Growth Rate (%)',
        data: growthRates,
        backgroundColor: growthRates.map(rate => 
          rate >= 0 ? 'rgba(75, 192, 192, 0.7)' : 'rgba(255, 99, 132, 0.7)'
        ),
        borderColor: growthRates.map(rate =>
          rate >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'
        ),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Growth Rate (%)'
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return `Growth: ${context.raw.toFixed(2)}%`;
            }
          }
        }
      }
    }
  });
};

export { formatCurrency, formatPercentage };
