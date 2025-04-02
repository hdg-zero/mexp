import Chart from 'chart.js/auto';

'use strict';

var charts = {
    quality: null,
    year: null,
    genre: null,
    location: null,
    storageQuality: null,
    trend: null
};

export function initCharts() {
    if (typeof Chart === 'undefined') return;
    const data = window.mediaData || [];
    if (data.length === 0) return;

    const qualityCanvas = document.getElementById('qualityChart');
    if (qualityCanvas) {
      const qualityCtx = qualityCanvas.getContext('2d');
      charts.quality = new Chart(qualityCtx, {
          type: 'doughnut',
          data: getChartData('quality', 'count'),
          options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                  legend: { position: 'right', labels: { font: { family: 'Inter, sans-serif', size: 12 } } },
                  tooltip: {
                      callbacks: {
                          label: function(context) {
                              const label = context.label || '';
                              const value = context.raw || 0;
                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                              const percentage = Math.round((value / total) * 100);
                              return `${label}: ${value} (${percentage}%)`;
                          }
                      }
                  }
              }
          }
      });
    }
    
    const yearCanvas = document.getElementById('yearChart');
    if (yearCanvas) {
      const yearCtx = yearCanvas.getContext('2d');
      charts.year = new Chart(yearCtx, {
          type: 'bar',
          data: getChartData('year', 'count'),
          options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                  y: {
                      beginAtZero: true,
                      ticks: { precision: 0, font: { family: 'Inter, sans-serif', size: 12 } }
                  },
                  x: {
                      ticks: { font: { family: 'Inter, sans-serif', size: 12 } }
                  }
              },
              plugins: {
                  legend: { display: false },
                  tooltip: {
                      callbacks: {
                          label: function(context) {
                              const label = context.dataset.label || '';
                              const value = context.raw || 0;
                              return `${label}: ${value}`;
                          }
                      }
                  }
              }
          }
      });
    }
    
    const genreCanvas = document.getElementById('genreChart');
    if (genreCanvas) {
      const genreCtx = genreCanvas.getContext('2d');
      charts.genre = new Chart(genreCtx, {
          type: 'bar',
          data: getChartData('genre', 'count'),
          options: {
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                  x: {
                      beginAtZero: true,
                      ticks: { precision: 0, font: { family: 'Inter, sans-serif', size: 12 } }
                  },
                  y: {
                      ticks: { font: { family: 'Inter, sans-serif', size: 12 } }
                  }
              },
              plugins: {
                  legend: { display: false },
                  tooltip: {
                      callbacks: {
                          label: function(context) {
                              const label = context.dataset.label || '';
                              const value = context.raw || 0;
                              const total = (window.mediaData || []).length || 1;
                              const percentage = Math.round((value / total) * 100);
                              return `${label}: ${value} (${percentage}%)`;
                          }
                      }
                  }
              }
          }
      });
    }
    
    const locationCanvas = document.getElementById('locationChart');
    if (locationCanvas) {
      const locationCtx = locationCanvas.getContext('2d');
      charts.location = new Chart(locationCtx, {
          type: 'doughnut',
          data: getChartData('location', 'size'),
          options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                  legend: { position: 'right', labels: { font: { family: 'Inter, sans-serif', size: 12 } } },
                  tooltip: {
                      callbacks: {
                          label: function(context) {
                              const label = context.label || '';
                              const value = context.raw || 0;
                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                              const percentage = Math.round((value / total) * 100);
                              return `${label}: ${value.toFixed(1)} GB (${percentage}%)`;
                          }
                      }
                  }
              }
          }
      });
    }
    
    const storageQualityCanvas = document.getElementById('storageQualityChart');
    if (storageQualityCanvas) {
      const storageQualityCtx = storageQualityCanvas.getContext('2d');
      charts.storageQuality = new Chart(storageQualityCtx, {
          type: 'pie',
          data: getChartData('quality', 'size'),
          options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                  legend: { position: 'right', labels: { font: { family: 'Inter, sans-serif', size: 12 } } },
                  tooltip: {
                      callbacks: {
                          label: function(context) {
                              const label = context.label || '';
                              const value = context.raw || 0;
                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                              const percentage = Math.round((value / total) * 100);
                              return `${label}: ${value.toFixed(1)} GB (${percentage}%)`;
                          }
                      }
                  }
              }
          }
      });
    }
    
    const trendCanvas = document.getElementById('trendChart');
    if (trendCanvas) {
      const trendCtx = trendCanvas.getContext('2d');
      charts.trend = new Chart(trendCtx, {
          type: 'line',
          data: getTrendChartData(),
          options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                  x: {
                      title: { display: true, text: 'Année', font: { family: 'Inter, sans-serif', size: 14 } },
                      ticks: { font: { family: 'Inter, sans-serif', size: 12 } }
                  },
                  y: {
                      title: { display: true, text: "Nombre d'items", font: { family: 'Inter, sans-serif', size: 14 } },
                      beginAtZero: true,
                      ticks: { font: { family: 'Inter, sans-serif', size: 12 } }
                  }
              },
              plugins: {
                  legend: { display: false },
                  tooltip: {
                      callbacks: {
                          label: function(context) {
                              return ` ${context.parsed.y} items`;
                          }
                      }
                  }
              }
          }
      });
    }
}

export function updateCharts() {
    if (!window.mediaData || window.mediaData.length === 0) return;
    document.getElementById('statsTotalItems').textContent = window.mediaData.length.toLocaleString();
    const totalSizeGB = window.mediaData.reduce((sum, item) => sum + item.size, 0);
    document.getElementById('statsTotalSize').textContent = `${totalSizeGB.toFixed(1)} GB`;
    const allGenres = window.mediaData.flatMap(item => item.genres);
    const uniqueGenres = [...new Set(allGenres)];
    document.getElementById('statsUniqueGenres').textContent = uniqueGenres.length.toLocaleString();
    if (window.mediaData.length > 0) {
        const earliestYear = Math.min(...window.mediaData.map(item => item.year));
        document.getElementById('statsEarliestYear').textContent = earliestYear;
    }
    ['quality', 'year'].forEach(chartName => {
        updateChartDisplay(chartName, 'count');
    });
    if(charts.trend) {
      charts.trend.data = getTrendChartData();
      charts.trend.update();
    }
}

export function updateChartDisplay(chartName, displayType) {
    if (!charts[chartName]) return;
    const newData = getChartData(chartName, displayType);
    charts[chartName].data.datasets[0].label = newData.datasets[0].label;
    charts[chartName].data.datasets[0].data = newData.datasets[0].data;
    if (['quality', 'year'].includes(chartName)) {
        charts[chartName].options.plugins.tooltip.callbacks.label = function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return displayType === 'count'
              ? `${label}: ${value} (${percentage}%)`
              : `${label}: ${value.toFixed(1)} GB (${percentage}%)`;
        };
        if (chartName === 'year') {
            if (displayType === 'size') {
                charts.year.options.scales.y.ticks.callback = function(value) {
                    return value + ' GB';
                };
            } else {
                charts.year.options.scales.y.ticks = { precision: 0 };
            }
        }
    }
    charts[chartName].update();
}

function getChartData(chartType, dataType) {
    const data = window.mediaData || [];
    switch(chartType) {
        case 'quality':
            const qualityCounts = {};
            const qualitySizes = {};
            data.forEach(item => {
                qualityCounts[item.quality] = (qualityCounts[item.quality] || 0) + 1;
                qualitySizes[item.quality] = (qualitySizes[item.quality] || 0) + item.size;
            });
            const qualityColors = {};
            Object.keys(qualityCounts).forEach(q => {
                qualityColors[q] = q === 'HD' ? '#3B82F6' : q === '4K' ? '#EF4444' : '#10B981';
            });
            return {
                labels: Object.keys(qualityCounts),
                datasets: [{
                    label: dataType === 'count' ? 'Count' : 'Size (GB)',
                    data: dataType === 'count' ? Object.values(qualityCounts) : Object.values(qualitySizes),
                    backgroundColor: Object.keys(qualityCounts).map(q => qualityColors[q]),
                    borderWidth: 1
                }]
            };
        case 'year':
            const yearCounts = {};
            const yearSizes = {};
            data.forEach(item => {
                yearCounts[item.year] = (yearCounts[item.year] || 0) + 1;
                yearSizes[item.year] = (yearSizes[item.year] || 0) + item.size;
            });
            const sortedYears = Object.keys(yearCounts).sort((a, b) => a - b);
            return {
                labels: sortedYears,
                datasets: [{
                    label: dataType === 'count' ? 'Count' : 'Size (GB)',
                    data: dataType === 'count' ? sortedYears.map(year => yearCounts[year]) : sortedYears.map(year => yearSizes[year]),
                    backgroundColor: '#4F46E5',
                    borderWidth: 1
                }]
            };
        case 'genre':
            const allGenres = data.flatMap(item => item.genres);
            const genreCounts = {};
            allGenres.forEach(genre => {
                genreCounts[genre] = (genreCounts[genre] || 0) + 1;
            });
            const sortedGenres = Object.entries(genreCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);
            return {
                labels: sortedGenres.map(g => g[0]),
                datasets: [{
                    label: 'Count',
                    data: sortedGenres.map(g => g[1]),
                    backgroundColor: '#4F46E5',
                    borderWidth: 1
                }]
            };
        case 'location':
            const locationSizes = {};
            data.forEach(item => {
                locationSizes[item.location] = (locationSizes[item.location] || 0) + item.size;
            });
            const locationColors = ['#4F46E5', '#EC4899', '#10B981', '#F59E0B', '#84CC16', '#06B6D4', '#8B5CF6', '#EF4444', '#14B8A6', '#F97316'];
            return {
                labels: Object.keys(locationSizes),
                datasets: [{
                    label: 'Size (GB)',
                    data: Object.values(locationSizes),
                    backgroundColor: Object.keys(locationSizes).map((_, i) => locationColors[i % locationColors.length]),
                    borderWidth: 1
                }]
            };
        default:
            return { labels: [], datasets: [] };
    }
}

function getTrendChartData() {
    const data = window.mediaData || [];
    const trendCounts = {};
    data.forEach(item => {
        trendCounts[item.year] = (trendCounts[item.year] || 0) + 1;
    });
    const sortedYears = Object.keys(trendCounts).sort((a, b) => a - b);
    return {
        labels: sortedYears,
        datasets: [{
            label: "Items Added",
            data: sortedYears.map(year => trendCounts[year]),
            borderColor: '#6366F1',
            backgroundColor: 'rgba(99,102,241,0.2)',
            tension: 0.3,
            fill: true
        }]
    };
}

export function destroyCharts() {
    Object.keys(charts).forEach(chartName => {
        if (charts[chartName]) {
            charts[chartName].destroy();
            charts[chartName] = null;
        }
    });
}
