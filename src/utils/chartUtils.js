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
const createRevenueTrendsChart = (filteredData, years, charts) => {
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
const createRevenueCompositionChart = (data, charts, selectedYear = 'FY24') => {
  // Destroy existing chart if it exists
  if (charts.revenueComposition) {
    charts.revenueComposition.destroy();
  }

  // Get canvas element
  const ctx = document.getElementById('revenueCompositionChart');
  if (!ctx) return;

  // Prepare data for the chart
  const labels = [];
  const values = [];
  const backgroundColors = [
    '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b',
    '#5a5c69', '#858796', '#3a3b45', '#00bcd4', '#ff9800',
    '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4',
    '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39'
  ];

  // Get the first data point (assuming data is filtered by state)
  if (data.length > 0) {
    const item = data[0];
    
    // Get all years from the data
    const years = Object.keys(item).filter(key => 
      key !== 'States' && key !== 'State Code' && key !== 'Total' && 
      key !== 'Total Tax Revenue' && key !== 'Total Non-Tax Revenue' &&
      key !== 'Total Revenue' && key !== 'Population (in crores)' &&
      key !== 'Per Capita Income (in INR)'
    );

    // Find the closest matching year if exact match not found
    let yearToUse = selectedYear;
    if (!(selectedYear in item)) {
      // Try to find a year that starts with the same prefix (e.g., FY24-RE for FY24)
      const yearPrefix = selectedYear.replace(/-.*$/, '');
      const matchingYear = years.find(y => y.startsWith(yearPrefix));
      if (matchingYear) {
        yearToUse = matchingYear;
      } else {
        // Fallback to the latest available year
        yearToUse = years[years.length - 1];
      }
    }

    // Add all revenue categories for the selected year
    const sortedKeys = Object.entries(item)
      .filter(([key, value]) => 
        key !== 'States' && 
        key !== 'State Code' && 
        key !== 'Total' &&
        key !== 'Total Tax Revenue' && 
        key !== 'Total Non-Tax Revenue' &&
        key !== 'Total Revenue' && 
        key !== 'Population (in crores)' && 
        key !== 'Per Capita Income (in INR)' &&
        typeof value === 'number' && 
        value > 0
      )
      .sort((a, b) => b[1] - a[1]); // Sort by value in descending order

    sortedKeys.forEach(([key, value]) => {
      labels.push(key.replace(/_/g, ' '));
      values.push(value);
    });
  }

  // Create the chart
  charts.revenueComposition = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: backgroundColors.slice(0, values.length),
        hoverBackgroundColor: backgroundColors.slice(0, values.length).map(c => `${c}cc`),
        hoverBorderColor: 'rgba(234, 236, 244, 1)',
        borderWidth: 2,
      }],
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        tooltip: {
          backgroundColor: "rgb(255,255,255)",
          bodyColor: "#5a5c69",
          titleColor: "#4e73df",
          titleFont: {
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            size: 13
          },
          borderColor: '#dddfeb',
          borderWidth: 1,
          padding: 15,
          displayColors: false,
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ₹${value.toLocaleString('en-IN')} (${percentage}%)`;
            }
          }
        },
        legend: {
          display: true,
          position: 'right',
          labels: {
            padding: 15,
            usePointStyle: true,
            font: {
              size: 12
            },
            generateLabels: function(chart) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map((label, i) => {
                  const value = data.datasets[0].data[i];
                  const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  
                  return {
                    text: `${label} (${percentage}%)`,
                    fillStyle: data.datasets[0].backgroundColor[i],
                    hidden: false,
                    lineCap: 'round',
                    lineDash: [],
                    lineDashOffset: 0,
                    lineJoin: 'round',
                    lineWidth: 1,
                    strokeStyle: 'transparent',
                    pointStyle: 'circle',
                    rotation: 0,
                    // Add click handler to show/hide segments
                    datasetIndex: 0,
                    index: i
                  };
                });
              }
              return [];
            }
          },
          onClick: function(e, legendItem, legend) {
            // Get the chart instance
            const chart = legend.chart;
            // Get the dataset meta for the first dataset
            const meta = chart.getDatasetMeta(0);
            // Toggle the visibility of the segment
            meta.data[legendItem.index].hidden = !meta.data[legendItem.index].hidden;
            // Update the chart
            chart.update();
          }
        },
        title: {
          display: true,
          text: 'Revenue Composition by Category',
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: {
            top: 10,
            bottom: 20
          }
        }
      },
      cutout: '65%',
      onHover: (event, chartElement) => {
        // Change cursor style when hovering over chart elements
        if (chartElement.length) {
          event.native.target.style.cursor = 'pointer';
        } else {
          event.native.target.style.cursor = 'default';
        }
      },
      onClick: (event, elements) => {
        if (elements.length > 0) {
          // Handle click on chart segment
          const chart = charts.revenueComposition;
          const activeElement = elements[0];
          const { datasetIndex, index } = activeElement;
          const label = chart.data.labels[index];
          const value = chart.data.datasets[datasetIndex].data[index];
          
          // You can add custom behavior here, like showing a modal with details
          console.log(`Clicked on ${label}: ${value}`);
        }
      }
    },
  });
};

// Create state comparison chart
const createStateComparisonChart = (data, stateFilter, years, charts = {}) => {
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
  
  return container;
};

// Create CAGR chart
const createCAGRChart = (data, charts) => {
  // Destroy existing chart if it exists
  if (charts.cagrChart) {
    charts.cagrChart.destroy();
  }

  // Get canvas element
  const ctx = document.getElementById('cagrChart');
  if (!ctx) return;

  // Group data by state and calculate average CAGR
  const stateCAGR = {};
  
  data.forEach(item => {
    if (!stateCAGR[item.States]) {
      stateCAGR[item.States] = [];
    }
    // Convert CAGR to percentage (it's stored as decimal)
    stateCAGR[item.States].push(item.CAGR * 100);
  });

  // Calculate average CAGR for each state
  const states = Object.keys(stateCAGR);
  const avgCAGR = states.map(state => {
    const cagrs = stateCAGR[state];
    const sum = cagrs.reduce((a, b) => a + b, 0);
    return sum / cagrs.length; // Average CAGR
  });

  // Sort states by CAGR in descending order
  const sortedIndices = avgCAGR
    .map((cagr, index) => ({ cagr, index }))
    .sort((a, b) => b.cagr - a.cagr)
    .map(item => item.index);

  const sortedStates = sortedIndices.map(i => states[i]);
  const sortedCAGR = sortedIndices.map(i => avgCAGR[i]);

  // Create the chart
  charts.cagrChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sortedStates,
      datasets: [{
        label: 'Average CAGR (%)',
        data: sortedCAGR,
        backgroundColor: sortedCAGR.map(cagr => 
          cagr >= 0 ? 'rgba(28, 200, 138, 0.8)' : 'rgba(231, 74, 59, 0.8)'
        ),
        borderColor: sortedCAGR.map(cagr => 
          cagr >= 0 ? 'rgba(28, 200, 138, 1)' : 'rgba(231, 74, 59, 1)'
        ),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return `CAGR: ${context.raw.toFixed(2)}%`;
            }
          }
        },
        title: {
          display: true,
          text: 'Average Compound Annual Growth Rate (CAGR) by State',
          font: {
            size: 16
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'CAGR (%)',
            font: {
              weight: 'bold'
            }
          },
          grid: {
            display: false
          }
        },
        y: {
          grid: {
            display: false
          },
          ticks: {
            autoSkip: false
          }
        }
      }
    }
  });
};

// Create growth rate chart
const createGrowthRateChart = (data, charts, selectedYear = 'FY24') => {
  // Destroy existing chart if it exists
  if (charts.growthRate) {
    charts.growthRate.destroy();
  }

  // Get canvas element
  const ctx = document.getElementById('growthRateChart');
  if (!ctx) return;

  // Extract all available years from the data
  const allYears = [];
  if (data.length > 0) {
    Object.keys(data[0]).forEach(key => {
      if (key.match(/^FY\d{2}(-\w+)?$/) && key !== 'States' && key !== 'State Code') {
        allYears.push(key);
      }
    });
    allYears.sort();
  }

  // Find the previous year for comparison
  const yearMatch = selectedYear.match(/^(FY\d{2})(-\w+)?$/);
  let previousYear = '';
  if (yearMatch) {
    const yearNum = parseInt(yearMatch[1].substring(2));
    const suffix = yearMatch[2] || '';
    previousYear = `FY${String(yearNum - 1).padStart(2, '0')}${suffix}`;
    
    // If previous year with suffix doesn't exist, try without suffix
    if (!allYears.includes(previousYear) && suffix) {
      previousYear = `FY${String(yearNum - 1).padStart(2, '0')}`;
    }
  }

  // If we couldn't find a valid previous year, use the one before in the array
  if (!previousYear || !allYears.includes(previousYear)) {
    const currentIndex = allYears.indexOf(selectedYear);
    if (currentIndex > 0) {
      previousYear = allYears[currentIndex - 1];
    } else if (allYears.length > 1) {
      // If selected year is the first one, use the next one
      previousYear = allYears[1];
    } else {
      // Fallback if we can't find a suitable comparison year
      previousYear = '';
    }
  }


  // Prepare data for the chart
  const labels = [];
  const growthRates = [];
  const currentValues = [];
  const previousValues = [];

  if (data.length > 0) {
    // Get all revenue categories
    const categories = Object.keys(data[0]).filter(key => 
      key !== 'States' && 
      key !== 'State Code' && 
      key !== 'Total' &&
      key !== 'Total Tax Revenue' && 
      key !== 'Total Non-Tax Revenue' &&
      key !== 'Total Revenue' && 
      key !== 'Population (in crores)' && 
      key !== 'Per Capita Income (in INR)' &&
      !key.match(/^FY\d{2}(-\w+)?$/)
    );

    // Calculate growth rates for each category
    categories.forEach(category => {
      const current = parseFloat(data[0][selectedYear] || 0);
      const previous = parseFloat(data[0][previousYear] || 0);
      
      // Only include categories with non-zero values
      if (current > 0 || previous > 0) {
        let growth = 0;
        if (previous > 0) {
          growth = ((current - previous) / Math.abs(previous)) * 100;
        } else if (current > 0) {
          growth = 100; // 100% growth from 0
        }
        
        labels.push(category.replace(/_/g, ' '));
        growthRates.push(growth);
        currentValues.push(current);
        previousValues.push(previous);
      }
    });
  }

  // Create the chart
  charts.growthRate = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: `Growth Rate (${previousYear} to ${selectedYear})`,
        data: growthRates,
        backgroundColor: growthRates.map(rate => 
          rate >= 0 ? 'rgba(28, 200, 138, 0.7)' : 'rgba(231, 74, 59, 0.7)'
        ),
        borderColor: growthRates.map(rate =>
          rate >= 0 ? 'rgba(28, 200, 138, 1)' : 'rgba(231, 74, 59, 1)'
        ),
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 'flex',
        maxBarThickness: 30,
        categoryPercentage: 0.8,
        barPercentage: 0.9
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      scales: {
        x: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Growth Rate (%)',
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
            callback: (value) => `${value}%`
          }
        },
        y: {
          grid: {
            display: false
          },
          ticks: {
            autoSkip: false,
            maxRotation: 0,
            minRotation: 0
          }
        }
      },
      plugins: {
        tooltip: {
          backgroundColor: "rgb(255,255,255)",
          bodyColor: "#5a5c69",
          titleColor: "#4e73df",
          titleFont: {
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            size: 13
          },
          borderColor: '#dddfeb',
          borderWidth: 1,
          padding: 15,
          displayColors: false,
          callbacks: {
            title: function(context) {
              return context[0].label;
            },
            label: function(context) {
              const index = context.dataIndex;
              const growth = growthRates[index];
              const current = currentValues[index];
              const previous = previousValues[index];
              
              return [
                `Growth Rate: ${growth >= 0 ? '+' : ''}${growth.toFixed(2)}%`,
                `${selectedYear}: ₹${current.toLocaleString('en-IN')} Cr`,
                `${previousYear}: ₹${previous.toLocaleString('en-IN')} Cr`
              ];
            }
          }
        },
        legend: {
          display: false
        },
        title: {
          display: true,
          text: `Year-over-Year Growth (${previousYear} to ${selectedYear})`,
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: {
            top: 10,
            bottom: 20
          }
        }
      },
      layout: {
        padding: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10
        }
      },
      onHover: (event, chartElement) => {
        // Change cursor style when hovering over chart elements
        if (chartElement.length) {
          event.native.target.style.cursor = 'pointer';
        } else {
          event.native.target.style.cursor = 'default';
        }
      },
      onClick: (event, elements) => {
        if (elements.length > 0) {
          // Handle click on chart segment
          const chart = charts.growthRate;
          const activeElement = elements[0];
          const { datasetIndex, index } = activeElement;
          const label = chart.data.labels[index];
          const value = chart.data.datasets[datasetIndex].data[index];
          
          // You can add custom behavior here, like showing a modal with details
          console.log(`Clicked on ${label}: ${value}% growth`);
        }
      }
    }
  });
};

// Export all utility functions
export { 
  formatCurrency, 
  formatPercentage, 
  createRevenueTrendsChart, 
  createRevenueCompositionChart, 
  createStateComparisonChart, 
  createGrowthRateChart,
  createCAGRChart
};
