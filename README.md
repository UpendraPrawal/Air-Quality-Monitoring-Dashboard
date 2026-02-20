<div align="center">

# 🌍 Air Quality Monitoring & Prediction Dashboard

### Real-Time IoT Monitoring · AQI Classification · 60-Min Forecasting
### `ESP32` · `MQ135` · `DHT11` · `ThingSpeak` · `ApexCharts`

<br>

<a href="https://upendraprawal.github.io/Air-Quality-Monitoring-Dashboard/">
  <img src="https://img.shields.io/badge/🌐_Live_Dashboard-Open_Now-00c9ff?style=for-the-badge&labelColor=0d3b6e" />
</a>
&nbsp;
<img src="https://img.shields.io/badge/Status-Live-00e676?style=for-the-badge&labelColor=0d1a2e" />
&nbsp;
<img src="https://img.shields.io/github/stars/UpendraPrawal/Air-Quality-Monitoring-Dashboard?style=for-the-badge&color=ffd700&labelColor=0d1a2e" />
&nbsp;
<img src="https://img.shields.io/github/license/UpendraPrawal/Air-Quality-Monitoring-Dashboard?style=for-the-badge&color=7c4dff&labelColor=0d1a2e" />

<br><br>

> An end-to-end IoT system that reads air quality data from physical sensors, streams it to the cloud, and presents live AQI metrics with predictive analytics on an interactive web dashboard.

</div>

---

## What This Project Does

Real-world air quality is captured by an **ESP32 microcontroller** paired with an **MQ135 gas sensor** and **DHT11 temperature/humidity sensor**. Readings are pushed to **ThingSpeak Cloud** every few seconds, then pulled into a web dashboard that visualises trends, classifies AQI level, and forecasts the next 60 minutes of air quality — all updating live in the browser.

```
MQ135 ──┐
         ├──► ESP32 ──► ThingSpeak Cloud ──► Web Dashboard ──► AQI Prediction
DHT11 ──┘
```

---

## Features

| Feature | Details |
|---|---|
| **Live Sensor Readings** | AQI, CO₂, temperature, humidity updated in real-time |
| **AQI Classification** | Good · Moderate · Unhealthy · Hazardous with colour coding |
| **Interactive Charts** | Time-series, trend, and gauge charts via ApexCharts |
| **60-Min Prediction** | Forecasted AQI based on recent sensor trend |
| **CSV Export** | Download historical readings for offline analysis |
| **Responsive UI** | Works on desktop, tablet, and mobile |

---

## Hardware

| Component | Role |
|---|---|
| ESP32 | Wi-Fi microcontroller — reads sensors & posts data |
| MQ135 | Detects CO₂, NH₃, benzene, smoke |
| DHT11 | Measures temperature & relative humidity |
| Breadboard + Jumper Wires | Circuit assembly |
| USB Cable | Power & Arduino IDE programming |

---

## Tech Stack

**Firmware:** Arduino IDE (C++), ESP32 Wi-Fi libraries  
**Cloud:** ThingSpeak (MQTT / REST API)  
**Dashboard:** HTML · CSS · JavaScript · ApexCharts  
**Hosting:** GitHub Pages

---

## Getting Started

### 1 — Hardware

Wire the MQ135 and DHT11 to your ESP32 according to the schematic in `/Circuit_Diagram/`.

### 2 — Firmware

1. Open `ESP32_Code/main.ino` in Arduino IDE.
2. Fill in your Wi-Fi credentials and ThingSpeak **Channel ID** + **Write API Key**.
3. Flash to your ESP32.

### 3 — Dashboard

```bash
git clone https://github.com/UpendraPrawal/Air-Quality-Monitoring-Dashboard.git
cd Air-Quality-Monitoring-Dashboard
```

Open `Dashboard_Code/index.html` in any modern browser — or visit the live deployment below.

**[→ Open Live Dashboard](https://upendraprawal.github.io/Air-Quality-Monitoring-Dashboard/)**

---

## Repository Structure

```
Air-Quality-Monitoring-Dashboard/
├── ESP32_Code/          # Arduino firmware
├── Dashboard_Code/      # Web dashboard (HTML/CSS/JS)
├── Circuit_Diagram/     # Wiring schematic
├── Dataset/             # Sample sensor recordings
├── Results/             # Screenshots & charts
└── README.md
```

---

## AQI Reference

| AQI Range | Category | Meaning |
|---|---|---|
| 0 – 50 | **Good** | Air quality is satisfactory |
| 51 – 100 | **Moderate** | Acceptable; some pollutants may affect sensitive groups |
| 101 – 150 | **Unhealthy for Sensitive Groups** | Sensitive individuals should limit outdoor exposure |
| 151 – 200 | **Unhealthy** | Everyone may begin to experience effects |
| 201 – 300 | **Very Unhealthy** | Health alert — serious effects for all |
| 301+ | **Hazardous** | Emergency conditions |

---

## Use Cases

- **Smart Cities** — municipal air quality networks
- **Industrial Sites** — pollution threshold alerting
- **Healthcare** — indoor air safety monitoring
- **Research** — environmental data logging & analysis

---

## Developer

**Upendra Prawal** — Electronics & IoT Engineer

[![GitHub](https://img.shields.io/badge/GitHub-UpendraPrawal-181717?style=flat-square&logo=github)](https://github.com/UpendraPrawal)

**Harshit Upadhyay** — Contributor

[![GitHub](https://img.shields.io/badge/GitHub-harshit008--upadhyay-181717?style=flat-square&logo=github)](https://github.com/harshit008-upadhyay)

---

## Contributing

Issues and pull requests are welcome. Please open an issue first to discuss significant changes.

---

## License

Released under the [MIT License](LICENSE).

---

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:00c9ff,100:0d3b6e&height=100&section=footer" />
</div>
