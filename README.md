# 🌳 IoT-Based Tree Theft, Fall, and Wildfire Detection Dashboard

This project is a real-time IoT dashboard that monitors forest conditions and sends alerts for events like fire risk, tree theft, and tree falls using sensor data. The system uses Firebase for live data, Chart.js for graphs, and IFTTT for free email alerts.

---

## 📌 Features

### 🔴 Live Sensor Readings
- Temperature & Pressure
- GPS: Latitude, Longitude, Altitude
- Speed, Satellite Count, HDOP
- MPU6050: Accelerometer & Gyroscope

### 🗺️ Real-Time Location Tracking
- Embedded live map with current location pin
- GPS position updates every few seconds

### 🚨 Smart Alerts Panel
- Critical alerts for:
  - 🔥 Wildfire Risk
  - 🪓 Tree Theft
  - 🌳 Tree Fall
- Color-coded by severity (red/yellow/green)
- Email alert via **IFTTT Webhook → Gmail**

### 📈 Sensor History Charts
- Temperature, Pressure, Speed over time
- Altitude, Acceleration, Gyroscope, HDOP trends
- Chart.js based interactive graphs

### 👥 User Access Control
- Firebase Authentication
- Basic login system with role support (Admin/User)

### 📤 Data Export
- Download logs in `.csv` format for reporting or analysis

---

## 🧱 Tech Stack

| Layer        | Tools Used |
|--------------|-------------|
| Frontend     | HTML, CSS, JS, Chart.js, Firebase Auth |
| Backend DB   | Firebase Realtime Database |
| Hosting      | Firebase Hosting (free tier) |
| Alerts       | IFTTT Webhooks + Gmail |
| Deployment   | Firebase CLI |
| Device Data  | Simulated Python script (or real Arduino + MPU6050 + GPS + BMP280) |

---

## 🚀 Live Demo

🔗 [Click to View Live Dashboard](https://tree-theft-wildfire-dete-3cc24.web.app/)  

---

