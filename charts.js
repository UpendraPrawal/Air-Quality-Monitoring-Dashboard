// Chart initialization and management
class ChartManager {
    constructor() {
        this.trendChart = null;
        this.environmentChart = null;
        this.gaugeChart = null;
        this.forecastChart = null;   // 👈 NEW
        this.historicalData = [];
        this.initCharts();
    }

    initCharts() {
        this.initTrendChart();
        this.initEnvironmentChart();
        this.initGaugeChart();
        this.initForecastChart();    // 👈 NEW
    }

    initTrendChart() {
        const options = {
            series: [{
                name: 'Air Quality',
                data: []
            }],
            chart: {
                height: 300,
                type: 'line',
                zoom: {
                    enabled: true
                },
                animations: {
                    enabled: true,
                    easing: 'linear',
                    dynamicAnimation: {
                        speed: 1000
                    }
                },
                toolbar: {
                    show: true,
                    tools: {
                        zoom: true,
                        zoomin: true,
                        zoomout: true,
                        pan: true,
                        reset: true
                    }
                },
                foreColor: '#e5e7eb'   // text color (dark theme friendly)
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth',
                width: 3
            },
            colors: [CONFIG.CHARTS.COLOR_SCHEME.airQuality],
            grid: {
                borderColor: '#1f2933'
            },
            xaxis: {
                type: 'datetime',
                labels: {
                    datetimeUTC: false   // local time
                },
                axisBorder: {
                    color: '#4b5563'
                },
                axisTicks: {
                    color: '#4b5563'
                }
            },
            yaxis: {
                title: {
                    text: 'Air Quality Index',
                    style: { color: '#9ca3af' }
                },
                min: 0,
                max: 100,
                labels: {
                    formatter: function (val) {
                        return val.toFixed(1); // 1 decimal
                    }
                }
            },
            tooltip: {
                theme: 'dark',
                x: {
                    format: 'dd/MM/yy HH:mm'
                },
                y: {
                    formatter: function (val) {
                        return val.toFixed(1) + ' AQI';
                    }
                }
            }
        };

        const el = document.querySelector("#trend-chart");
        if (!el) return;

        this.trendChart = new ApexCharts(el, options);
        this.trendChart.render();
    }

    initEnvironmentChart() {
        const options = {
            series: [{
                name: 'Temperature',
                data: []
            }, {
                name: 'Humidity',
                data: []
            }],
            chart: {
                height: 300,
                type: 'line',
                zoom: {
                    enabled: true
                },
                animations: {
                    enabled: true,
                    easing: 'linear'
                },
                foreColor: '#e5e7eb'
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth',
                width: 3
            },
            colors: [
                CONFIG.CHARTS.COLOR_SCHEME.temperature,
                CONFIG.CHARTS.COLOR_SCHEME.humidity
            ],
            grid: {
                borderColor: '#1f2933'
            },
            xaxis: {
                type: 'datetime',
                labels: {
                    datetimeUTC: false,
                    datetimeFormatter: {
                        hour: 'HH:mm',
                        minute: 'HH:mm'
                    }
                },
                axisBorder: {
                    color: '#4b5563'
                },
                axisTicks: {
                    color: '#4b5563'
                }
            },
            yaxis: [
                {
                    title: {
                        text: 'Temperature (°C)',
                        style: { color: '#f97373' }
                    },
                    min: 0,
                    max: 50,
                    labels: {
                        formatter: function (val) {
                            return val.toFixed(1);
                        }
                    }
                },
                {
                    opposite: true,
                    title: {
                        text: 'Humidity (%)',
                        style: { color: '#38bdf8' }
                    },
                    min: 0,
                    max: 100,
                    labels: {
                        formatter: function (val) {
                            return val.toFixed(1);
                        }
                    }
                }
            ],
            tooltip: {
                theme: 'dark',
                x: {
                    format: 'dd/MM/yy HH:mm'
                },
                y: [
                    {
                        formatter: function (val) {
                            return val.toFixed(1) + '°C';
                        }
                    },
                    {
                        formatter: function (val) {
                            return val.toFixed(1) + '%';
                        }
                    }
                ]
            }
        };

        const el = document.querySelector("#environment-chart");
        if (!el) return;

        this.environmentChart = new ApexCharts(el, options);
        this.environmentChart.render();
    }

    initGaugeChart() {
        const canvas = document.getElementById('aqi-gauge');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Draw gauge background
        this.drawGaugeBackground(ctx);

        // Initial gauge value
        this.updateGauge(25);
    }

    drawGaugeBackground(ctx) {
        const centerX = 100;
        const centerY = 100;
        const radius = 80;

        // Draw gauge background arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 20;
        ctx.stroke();

        // Draw colored segments
        const segments = [
            { start: 0, end: 0.4, color: CONFIG.CHARTS.COLOR_SCHEME.statusGood },
            { start: 0.4, end: 0.7, color: CONFIG.CHARTS.COLOR_SCHEME.statusModerate },
            { start: 0.7, end: 0.9, color: CONFIG.CHARTS.COLOR_SCHEME.statusPoor },
            { start: 0.9, end: 1.0, color: CONFIG.CHARTS.COLOR_SCHEME.statusHazardous }
        ];

        segments.forEach(segment => {
            ctx.beginPath();
            ctx.arc(
                centerX,
                centerY,
                radius,
                Math.PI + (segment.start * Math.PI),
                Math.PI + (segment.end * Math.PI)
            );
            ctx.strokeStyle = segment.color;
            ctx.lineWidth = 20;
            ctx.stroke();
        });
    }

    updateGauge(value) {
        const canvas = document.getElementById('aqi-gauge');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const centerX = 100;
        const centerY = 100;
        const radius = 80;

        // Clear area
        ctx.clearRect(0, 0, 200, 120);

        // Redraw background
        this.drawGaugeBackground(ctx);

        // Draw needle
        const angle = Math.PI + (value / 100) * Math.PI;
        const needleLength = 60;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(angle) * needleLength,
            centerY + Math.sin(angle) * needleLength
        );
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#e5e7eb';
        ctx.fill();

        // Value text
        ctx.fillStyle = '#e5e7eb';
        ctx.font = 'bold 16px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(value.toFixed(1), centerX, centerY + 40);
    }

    updateTrendChart(newData) {
        this.historicalData.push({
            timestamp: newData.timestamp,
            temperature: parseFloat(newData.temperature.toFixed(1)),
            humidity: parseFloat(newData.humidity.toFixed(1)),
            airQuality: parseFloat(newData.airQuality.toFixed(1)),
            rawValue: Math.round(newData.rawValue)
        });

        // Yahan tum limit set kar sakte ho:
        // e.g. last 1000 points
        if (this.historicalData.length > 1000) {
            this.historicalData.shift();
        }

        const aqiData = this.historicalData.map(d => ({
            x: d.timestamp.getTime(),
            y: d.airQuality
        }));

        const tempData = this.historicalData.map(d => ({
            x: d.timestamp.getTime(),
            y: d.temperature
        }));

        const humidityData = this.historicalData.map(d => ({
            x: d.timestamp.getTime(),
            y: d.humidity
        }));

        if (this.trendChart) {
            this.trendChart.updateSeries([{
                name: 'Air Quality',
                data: aqiData
            }]);
        }

        if (this.environmentChart) {
            this.environmentChart.updateSeries([{
                name: 'Temperature',
                data: tempData
            }, {
                name: 'Humidity',
                data: humidityData
            }]);
        }
    }

    updateTimeRange(hours) {
        const now = new Date();
        const timeThreshold = new Date(now.getTime() - (hours * 60 * 60 * 1000));

        const filteredData = this.historicalData.filter(d => d.timestamp >= timeThreshold);

        const aqiData = filteredData.map(d => ({
            x: d.timestamp.getTime(),
            y: d.airQuality
        }));

        const tempData = filteredData.map(d => ({
            x: d.timestamp.getTime(),
            y: d.temperature
        }));

        const humidityData = filteredData.map(d => ({
            x: d.timestamp.getTime(),
            y: d.humidity
        }));

        if (this.trendChart) {
            this.trendChart.updateSeries([{
                name: 'Air Quality',
                data: aqiData
            }]);
        }

        if (this.environmentChart) {
            this.environmentChart.updateSeries([{
                name: 'Temperature',
                data: tempData
            }, {
                name: 'Humidity',
                data: humidityData
            }]);
        }
    }

    // ---------- FORECAST CHART (PREDICTION) ----------

    initForecastChart() {
        const el = document.querySelector('#forecast-chart');
        if (!el) return; // agar HTML me nahi hai to skip

        const options = {
            series: [{
                name: 'Predicted AQI',
                data: []
            }],
            chart: {
                height: 300,
                type: 'line',
                animations: {
                    enabled: true,
                    easing: 'linear',
                    dynamicAnimation: { speed: 800 }
                },
                toolbar: { show: false },
                foreColor: '#e5e7eb'
            },
            dataLabels: { enabled: false },
            stroke: {
                curve: 'smooth',
                width: 3,
                dashArray: 5        // dotted line look
            },
            colors: ['#22d3ee'],
            grid: { borderColor: '#1f2933' },
            xaxis: {
                type: 'datetime',
                labels: { datetimeUTC: false },
                axisBorder: { color: '#4b5563' },
                axisTicks: { color: '#4b5563' }
            },
            yaxis: {
                title: {
                    text: 'Predicted AQI',
                    style: { color: '#9ca3af' }
                },
                min: 0,
                max: 100
            },
            tooltip: {
                theme: 'dark',
                x: { format: 'dd/MM/yy HH:mm' },
                y: {
                    formatter: (val) => val.toFixed(1) + ' AQI'
                }
            }
        };

        this.forecastChart = new ApexCharts(el, options);
        this.forecastChart.render();
    }

    // predictions: [{ timestamp: Date, airQuality: number }, ...]
    updateForecastChart(predictions) {
        if (!this.forecastChart) return;

        const seriesData = predictions.map(p => ({
            x: p.timestamp.getTime(),
            y: p.airQuality
        }));

        this.forecastChart.updateSeries([{
            name: 'Predicted AQI',
            data: seriesData
        }]);
    }
}
