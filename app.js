// Main application logic
class AirQualityDashboard {
    constructor() {
        this.chartManager = new ChartManager();
        this.currentData = null;
        this.isConnected = false;
        this.updateInterval = null;
        this.lastValues = {
            temperature: 28.5,
            humidity: 65.2,
            airQuality: 25,
            rawValue: 425
        };

        this.init();
    
    }

    init() {
        this.initializeEventListeners();
        this.updateTimeDisplay();
        this.startDataUpdates();

        // Time display update every second
        setInterval(() => this.updateTimeDisplay(), 1000);
    }

    initializeEventListeners() {
        // Time filter buttons (1H, 6H, 24H)
        document.querySelectorAll('.time-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                document
                    .querySelectorAll('.time-btn')
                    .forEach((b) => b.classList.remove('active'));
                e.target.classList.add('active');
                const hours = parseInt(e.target.dataset.hours);
                if (!isNaN(hours)) {
                    this.chartManager.updateTimeRange(hours);
                }
            });
        });

        // Export CSV button
        const exportBtn = document.getElementById('export-data');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        // Forecast button (AQI prediction for next 60 minutes)
        const forecastBtn = document.getElementById('run-forecast');
        if (forecastBtn) {
            forecastBtn.addEventListener('click', () => {
                this.runForecastNextHour();
            });
        }
    }

    updateTimeDisplay() {
        const now = new Date();
        const el = document.getElementById('current-time');
        if (!el) return;

        el.textContent = now.toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    async startDataUpdates() {
        // Initial fetch
        await this.fetchData();

        // Periodic updates
        this.updateInterval = setInterval(() => {
            this.fetchData();
        }, CONFIG.THINGSPEAK.UPDATE_INTERVAL);
    }

    async fetchData() {
        try {
            let data;

            if (CONFIG.SIMULATION.ENABLED) {
                // Local simulation
                data = this.generateRealisticData();
            } else {
                // ThingSpeak se live data
                data = await this.fetchThingSpeakData();
            }

            // Check if data fresh hai ya purana
            const now = Date.now();
            const ageMs = now - data.timestamp.getTime();

            const staleThreshold =
                CONFIG.THINGSPEAK.STALE_AFTER_MS ||
                CONFIG.THINGSPEAK.UPDATE_INTERVAL * 3; // fallback agar STALE_AFTER_MS na ho

            const isFresh = ageMs <= staleThreshold;

            // Dashboard UI update
            this.updateDashboard(data);

            // Connection status update (fresh data hi "Connected" maana jayega)
            this.isConnected = isFresh;
            this.updateConnectionStatus(isFresh);
        } catch (error) {
            console.error('Error fetching data:', error);
            this.isConnected = false;
            this.updateConnectionStatus(false);
        }
    }

    generateRealisticData() {
        const now = new Date();

        // Daily pattern
        const tempVariation = Math.sin(now.getHours() * 0.26) * 5;
        const humidityVariation = Math.cos(now.getHours() * 0.26) * 15;

        this.lastValues = {
            temperature: this.addSmoothVariation(
                this.lastValues.temperature,
                28.5 + tempVariation,
                0.3
            ),
            humidity: this.addSmoothVariation(
                this.lastValues.humidity,
                65 + humidityVariation,
                2
            ),
            airQuality: this.addSmoothVariation(
                this.lastValues.airQuality,
                25 + Math.random() * 10,
                1
            ),
            rawValue: this.addSmoothVariation(
                this.lastValues.rawValue,
                400 + Math.random() * 100,
                20
            )
        };

        return {
            timestamp: now,
            temperature: parseFloat(this.lastValues.temperature.toFixed(1)),
            humidity: parseFloat(this.lastValues.humidity.toFixed(1)),
            airQuality: parseFloat(this.lastValues.airQuality.toFixed(1)),
            rawValue: Math.round(this.lastValues.rawValue),
            status: this.calculateStatus(this.lastValues.airQuality)
        };
    }

    addSmoothVariation(current, target, maxStep) {
        const diff = target - current;
        const step = Math.sign(diff) * Math.min(Math.abs(diff), maxStep);
        return current + step + (Math.random() - 0.5) * 0.5;
    }

    async fetchThingSpeakData() {
        const url = `https://api.thingspeak.com/channels/${CONFIG.THINGSPEAK.CHANNEL_ID}/feeds/last.json?api_key=${CONFIG.THINGSPEAK.READ_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        return {
            timestamp: new Date(data.created_at),
            temperature: parseFloat(data.field1),
            humidity: parseFloat(data.field2),
            airQuality: parseFloat(data.field3),
            rawValue: 0,
            status: parseInt(data.field4)
        };
    }

    calculateStatus(aqiValue) {
        if (aqiValue <= 40) return 1; // Good
        if (aqiValue <= 70) return 2; // Moderate
        if (aqiValue <= 90) return 3; // Poor
        return 4; // Hazardous
    }

    updateDashboard(data) {
        this.currentData = data;

        // Main sensor values
        const tempEl = document.getElementById('temp-value');
        const humEl = document.getElementById('humidity-value');
        const rawEl = document.getElementById('raw-value');
        const aqiEl = document.getElementById('aqi-value');

        if (tempEl) tempEl.textContent = data.temperature.toFixed(1);
        if (humEl) humEl.textContent = data.humidity.toFixed(1);
        if (rawEl) rawEl.textContent = Math.round(data.rawValue);
        if (aqiEl) aqiEl.textContent = data.airQuality.toFixed(1);

        // Gauge update
        this.chartManager.updateGauge(data.airQuality);

        // Status category update
        this.updateStatusDisplay(data.status);

        // Charts update
        this.chartManager.updateTrendChart(data);

        // Recent table update
        this.updateReadingsTable(data);

        // Stats update
        this.updateStatistics();

        // Animation
        this.addUpdateAnimation();
    }

    updateStatusDisplay(statusCode) {
        const statusConfig =
            Object.values(CONFIG.AQI_STATUS).find(
                (s) =>
                    s.range[0] <= this.currentData.airQuality &&
                    this.currentData.airQuality < s.range[1]
            ) || CONFIG.AQI_STATUS.GOOD;

        const statusElement = document.getElementById('overall-status');
        const categoryElement = document.getElementById('aqi-category');

        if (statusElement) {
            statusElement.textContent = statusConfig.label;
            statusElement.setAttribute(
                'data-status',
                statusConfig.label.toLowerCase()
            );
        }

        if (categoryElement) {
            categoryElement.textContent = statusConfig.label;
            categoryElement.className = `value status-${statusConfig.label.toLowerCase()}`;
        }
    }

    updateReadingsTable(data) {
        const tableBody = document.getElementById('readings-table');
        if (!tableBody) return;

        const newRow = document.createElement('tr');

        newRow.innerHTML = `
            <td>${data.timestamp.toLocaleTimeString()}</td>
            <td>${data.temperature.toFixed(1)}</td>
            <td>${data.humidity.toFixed(1)}</td>
            <td>${data.airQuality.toFixed(1)}</td>
            <td><span class="status-${this.getStatusText(
                data.status
            ).toLowerCase()}">${this.getStatusText(data.status)}</span></td>
        `;

        // Naya row sabse upar
        tableBody.insertBefore(newRow, tableBody.firstChild);

        // Sirf last 10 rows rakhni ho to:
        while (tableBody.children.length > 10) {
            tableBody.removeChild(tableBody.lastChild);
        }

        // Agar tum 100 rows chahte ho:
        // while (tableBody.children.length > 100) {
        //     tableBody.removeChild(tableBody.lastChild);
        // }
    }

    getStatusText(statusCode) {
        switch (statusCode) {
            case 1:
                return 'Good';
            case 2:
                return 'Moderate';
            case 3:
                return 'Poor';
            case 4:
                return 'Hazardous';
            default:
                return 'Unknown';
        }
    }

    updateStatistics() {
        if (this.chartManager.historicalData.length > 0) {
            const temps = this.chartManager.historicalData.map(
                (d) => d.temperature
            );
            const humidities = this.chartManager.historicalData.map(
                (d) => d.humidity
            );
            const aqis = this.chartManager.historicalData.map(
                (d) => d.airQuality
            );
    
            const avgTemp =
                temps.reduce((a, b) => a + b, 0) / temps.length || 0;
            const avgHum =
                humidities.reduce((a, b) => a + b, 0) / humidities.length || 0;
            const avgAqi =
                aqis.reduce((a, b) => a + b, 0) / aqis.length || 0;
    
            const avgTempEl = document.getElementById('avg-temp');
            const avgHumEl = document.getElementById('avg-humidity');
            const avgAqiEl = document.getElementById('avg-aqi');
            const countEl = document.getElementById('readings-count');
    
            if (avgTempEl) avgTempEl.textContent = avgTemp.toFixed(1) + '°C';
            if (avgHumEl) avgHumEl.textContent = avgHum.toFixed(1) + '%';
            if (avgAqiEl) avgAqiEl.textContent = avgAqi.toFixed(1);
            if (countEl)
                countEl.textContent = this.chartManager.historicalData.length;
    
            // Calculate status distribution
            this.updateStatusDistribution(aqis);
        }
    
        const lastUpdateEl = document.getElementById('last-update');
        if (lastUpdateEl) lastUpdateEl.textContent = 'Just now';
    }
    
    updateStatusDistribution(aqiValues) {
        if (!aqiValues || aqiValues.length === 0) return;
    
        // Count readings in each category
        const counts = {
            good: 0,
            moderate: 0,
            poor: 0,
            hazardous: 0
        };
    
        aqiValues.forEach(aqi => {
            if (aqi <= 40) counts.good++;
            else if (aqi <= 70) counts.moderate++;
            else if (aqi <= 90) counts.poor++;
            else counts.hazardous++;
        });
    
        const total = aqiValues.length;
    
        // Calculate percentages
        const percentages = {
            good: (counts.good / total) * 100,
            moderate: (counts.moderate / total) * 100,
            poor: (counts.poor / total) * 100,
            hazardous: (counts.hazardous / total) * 100
        };
    
        // Update the bars
        const goodBar = document.querySelector('.dist-bar.good');
        const moderateBar = document.querySelector('.dist-bar.moderate');
        const poorBar = document.querySelector('.dist-bar.poor');
        const hazardousBar = document.querySelector('.dist-bar.hazardous');
    
        if (goodBar) {
            goodBar.style.width = percentages.good + '%';
            goodBar.innerHTML = percentages.good > 5 ? `<span>Good: ${percentages.good.toFixed(0)}%</span>` : '';
        }
    
        if (moderateBar) {
            moderateBar.style.width = percentages.moderate + '%';
            moderateBar.innerHTML = percentages.moderate > 5 ? `<span>Moderate: ${percentages.moderate.toFixed(0)}%</span>` : '';
        }
    
        if (poorBar) {
            poorBar.style.width = percentages.poor + '%';
            poorBar.innerHTML = percentages.poor > 5 ? `<span>Poor: ${percentages.poor.toFixed(0)}%</span>` : '';
        }
    
        if (hazardousBar) {
            hazardousBar.style.width = percentages.hazardous + '%';
            hazardousBar.innerHTML = percentages.hazardous > 5 ? `<span>Hazardous: ${percentages.hazardous.toFixed(0)}%</span>` : '';
        }
    }

    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connection-status');
        if (!statusElement) return;

        if (connected) {
            statusElement.textContent = '● Connected';
            statusElement.className = 'status-pill status-connected';
        } else {
            statusElement.textContent = '● No recent data';
            statusElement.className = 'status-pill status-disconnected';
        }
    }

    addUpdateAnimation() {
        const elements = document.querySelectorAll('.sensor-value');
        elements.forEach((el) => {
            el.classList.add('updating');
            setTimeout(() => el.classList.remove('updating'), 1000);
        });
    }

    exportData() {
        if (!this.chartManager.historicalData.length) return;

        const csvContent = this.convertToCSV(this.chartManager.historicalData);
        this.downloadCSV(csvContent, 'air_quality_data.csv');
    }

    convertToCSV(data) {
        const headers = [
            'Timestamp',
            'Temperature (°C)',
            'Humidity (%)',
            'Air Quality',
            'Status'
        ];
        const rows = data.map((d) => [
            d.timestamp.toISOString(),
            d.temperature.toFixed(1),
            d.humidity.toFixed(1),
            d.airQuality.toFixed(1),
            this.getStatusText(this.calculateStatus(d.airQuality))
        ]);

        return [headers, ...rows].map((row) => row.join(',')).join('\n');
    }

    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // ---------- PREDICTION (NEXT 60 MINUTES) ----------

    // Simple linear regression based forecast on recent AQI
    runForecastNextHour() {
        const data = this.chartManager.historicalData;
        if (!data || data.length < 10) {
            alert('Not enough data for prediction (need at least 10 readings).');
            return;
        }

        // Last N points se trend uthao
        const N = Math.min(30, data.length);
        const recent = data.slice(data.length - N);

        // Time index: minutes from first recent timestamp
        const t0 = recent[0].timestamp.getTime();
        const t = recent.map(
            (d) => (d.timestamp.getTime() - t0) / 60000 // minutes
        );
        const y = recent.map((d) => d.airQuality);

        // Linear regression: y = a + b*t
        const n = t.length;
        const sumT = t.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumTT = t.reduce((a, b) => a + b * b, 0);
        const sumTY = t.reduce((acc, ti, i) => acc + ti * y[i], 0);

        const denom = n * sumTT - sumT * sumT;
        if (denom === 0) {
            alert('Unable to compute prediction.');
            return;
        }

        const b = (n * sumTY - sumT * sumY) / denom;
        const a = (sumY - b * sumT) / n;

        // 60 minute future forecast
        const lastTs = recent[recent.length - 1].timestamp;
        const predictions = [];
        for (let i = 1; i <= 60; i++) {
            const futureTs = new Date(lastTs.getTime() + i * 60000);
            const futureTmin = (futureTs.getTime() - t0) / 60000;

            let predAQI = a + b * futureTmin;

            // Reasonable range
            if (predAQI < 0) predAQI = 0;
            if (predAQI > 100) predAQI = 100;

            predictions.push({
                timestamp: futureTs,
                airQuality: parseFloat(predAQI.toFixed(2))
            });
        }

        // Chart me show karo
        this.chartManager.updateForecastChart(predictions);
    }
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.airQualityDashboard = new AirQualityDashboard();
});
