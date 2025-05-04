let latestAltitude = null;
let latestSpeed = null;

let sleepMode = false;
let lastSnapshot = null;

// Global datasets
const historyLabels = [];
const latData = [], lngData = [], altData = [], speedData = [];
const accX = [], accY = [], accZ = [];
const gyroX = [], gyroY = [], gyroZ = [];
const satData = [], hdopData = [];
const tempData = [];
const pressureData = [];
const labels = [];

// Initialize charts
const tempChart = new Chart(document.getElementById('tempChart').getContext('2d'), {
  type: 'line',
  data: {
    labels: labels,
    datasets: [{
      label: 'Temperature (°C)',
      borderColor: 'red',
      data: tempData,
      fill: false
    }]
  }
});

const pressureChart = new Chart(document.getElementById('pressureChart').getContext('2d'), {
  type: 'line',
  data: {
    labels: labels,
    datasets: [{
      label: 'Pressure (hPa)',
      borderColor: 'blue',
      data: pressureData,
      fill: false
    }]
  }
});

function createChart(ctx, label, color, dataArr) {
    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: historyLabels,
        datasets: [{
          label: label,
          borderColor: color,
          data: dataArr,
          fill: false
        }]
      },
      options: {
        animation: false,
        scales: {
          x: {
            ticks: { autoSkip: true, maxTicksLimit: 10 }
          }
        }
      }
    });
  }
  
  // Initialize charts
  const latChart = createChart(document.getElementById('latChart').getContext('2d'), "Latitude", "purple", latData);
  const lngChart = createChart(document.getElementById('lngChart').getContext('2d'), "Longitude", "brown", lngData);
  const altChart = createChart(document.getElementById('altChart').getContext('2d'), "Altitude (m)", "green", altData);
  const speedChart = createChart(document.getElementById('speedChart').getContext('2d'), "Speed (km/h)", "blue", speedData);
  
  const accChart = new Chart(document.getElementById('accChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: historyLabels,
      datasets: [
        { label: "Acc X", borderColor: "red", data: accX, fill: false },
        { label: "Acc Y", borderColor: "green", data: accY, fill: false },
        { label: "Acc Z", borderColor: "blue", data: accZ, fill: false },
      ]
    },
    options: { animation: false }
  });
  
  const gyroChart = new Chart(document.getElementById('gyroChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: historyLabels,
      datasets: [
        { label: "Gyro X", borderColor: "orange", data: gyroX, fill: false },
        { label: "Gyro Y", borderColor: "purple", data: gyroY, fill: false },
        { label: "Gyro Z", borderColor: "brown", data: gyroZ, fill: false },
      ]
    },
    options: { animation: false }
  });
  
  const satChart = createChart(document.getElementById('satChart').getContext('2d'), "Satellites", "#ffc107", satData);
  const hdopChart = createChart(document.getElementById('hdopChart').getContext('2d'), "HDOP", "#17a2b8", hdopData);
  

const db = firebase.database();

function fetchLatestSensorData() {
    const logsRef = db.ref("logs");
  
    logsRef.limitToLast(1).on("value", (snapshot) => {
      if (sleepMode) return; // Pause updates if in sleep mode
  
      const data = snapshot.val();
      if (data) {
        lastSnapshot = data; // Cache the latest for sleep view
        const latestKey = Object.keys(data)[0];
        const values = data[latestKey];
        updateUI(values);  // Use the new helper function
      }
    });
  }

function updateUI(values) {
    document.getElementById("temperature").textContent = values.temperature ?? "--";
    document.getElementById("pressure").textContent = values.pressure ?? "--";
    document.getElementById("latitude").textContent = values.latitude ?? "--";
    document.getElementById("longitude").textContent = values.longitude ?? "--";
    document.getElementById("altitude").textContent = values.altitude ?? "--";
    document.getElementById("acc_x").textContent = values.acc_x ?? "--";
    document.getElementById("acc_y").textContent = values.acc_y ?? "--";
    document.getElementById("acc_z").textContent = values.acc_z ?? "--";
    document.getElementById("gyro_x").textContent = values.gyro_x ?? "--";
    document.getElementById("gyro_y").textContent = values.gyro_y ?? "--";
    document.getElementById("gyro_z").textContent = values.gyro_z ?? "--";
    document.getElementById("speed").textContent = values.speed ?? "--";
    document.getElementById("satellites").textContent = values.satellites ?? "--";
    document.getElementById("hdop").textContent = values.hdop ?? "--";
    document.getElementById("utc").textContent = values.utc ?? "--";

    if (typeof updateMap === "function") {
        updateMap(values.latitude, values.longitude);
    }

    latestAltitude = values.altitude;
    latestSpeed = values.speed;

    updateCharts(values);
    generateAlert(values);
    updateHistoryCharts(values);

}
  
let lastLat = null;
let lastLng = null;

function generateAlert(values) {
  const alertsDiv = document.getElementById("alerts");
  alertsDiv.innerHTML = ""; // Clear old alerts

  const now = new Date().toLocaleString();
  const alerts = [];

  // ==== 1. Fire Risk ====
  if (values.temperature > 60) {
    alerts.push({ msg: "🔥 Fire Risk Detected", level: "critical" });
  }

  // ==== 2. Speed Motion Alert ====
  if (values.speed > 5) {
    alerts.push({ msg: "🚨 Motion Detected - Possible Theft", level: "critical" });
  }

  // ==== 3. Tree Fall / Theft Detection ====
  const isHighAccel = Math.abs(values.acc_x) > 0.5 || Math.abs(values.acc_y) > 0.5 || Math.abs(values.acc_z - 1.0) > 0.5;
  const isHighGyro = Math.abs(values.gyro_x) > 20 || Math.abs(values.gyro_y) > 20 || Math.abs(values.gyro_z) > 20;
  const isAltDrop = values.altitude < 100; // Adjust based on your typical simulated altitude

  if (alerts.length > 0) {
    alerts.forEach(a => {
      if (a.level === "critical") {
        sendIFTTTAlert(a.msg, now);
      }
    });
  }
  
  // Track previous GPS to detect movement
  const isLatLngSame = lastLat !== null && lastLng !== null &&
                       Math.abs(values.latitude - lastLat) < 0.0001 &&
                       Math.abs(values.longitude - lastLng) < 0.0001;

  // Save current for next time
  lastLat = values.latitude;
  lastLng = values.longitude;

  if (isHighAccel && isHighGyro && isAltDrop) {
    if (isLatLngSame) {
      alerts.push({ msg: "🌳 Tree Fall Detected", level: "critical" });
    } else {
      alerts.push({ msg: "🪓 Tree Theft Detected", level: "critical" });
    }
  }

  // ==== 4. Normal State ====
  if (alerts.length === 0) {
    alerts.push({ msg: "✅ Normal Conditions", level: "normal" });
  }

  // ==== 5. Render Alerts ====
  alerts.forEach(a => {
    alertsDiv.appendChild(createAlertBox(a.msg, now, a.level));
  });
}
  
  // Helper to create alert HTML
  function createAlertBox(message, timestamp, level) {
    const div = document.createElement("div");
    div.className = `alert-card alert-${level}`;
    div.innerHTML = `<strong>${message}</strong><br><small>${timestamp}</small>`;
    return div;
  }

  function updateCharts(values) {
    const timestamp = new Date().toLocaleTimeString();
  
    labels.push(timestamp);
    tempData.push(values.temperature);
    pressureData.push(values.pressure);
    speedData.push(values.speed);
  
    // Keep only latest 20 points
    if (labels.length > 20) {
      labels.shift();
      tempData.shift();
      pressureData.shift();
      speedData.shift();
    }
  
    tempChart.update();
    pressureChart.update();
    speedChart.update();
  }

  function downloadCSV() {
    const dbRef = firebase.database().ref("logs");
  
    dbRef.once("value", (snapshot) => {
      const logs = snapshot.val();
      if (!logs) {
        alert("No data available!");
        return;
      }
  
      const headers = [
        "temperature", "pressure", "latitude", "longitude",
        "altitude", "speed", "satellites", "hdop", "utc"
      ];
  
      const rows = [headers.join(",")];
  
      Object.keys(logs).forEach((key) => {
        const entry = logs[key];
        const row = headers.map((field) => entry[field]);
        rows.push(row.join(","));
      });
  
      const csvContent = "data:text/csv;charset=utf-8," + rows.join("\n");
      const encodedUri = encodeURI(csvContent);
  
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "sensor_data.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
  
  function toggleSleep() {
    sleepMode = !sleepMode;
    const btn = document.getElementById("sleep-btn");
  
    if (sleepMode) {
      btn.textContent = "🛌 Sleep Mode: ON";
      btn.classList.add("sleeping");
  
      // Show frozen snapshot if exists
      if (lastSnapshot) {
        const latestKey = Object.keys(lastSnapshot)[0];
        updateUI(lastSnapshot[latestKey]);
      }
    } else {
      btn.textContent = "🛌 Sleep Mode: OFF";
      btn.classList.remove("sleeping");
    }
  }

  function updateHistoryCharts(values) {
    const timestamp = new Date().toLocaleTimeString();
  
    historyLabels.push(timestamp);
    if (historyLabels.length > 20) historyLabels.shift();
  
    function pushAndTrim(arr, val) {
      arr.push(val);
      if (arr.length > 20) arr.shift();
    }
  
    pushAndTrim(latData, values.latitude);
    pushAndTrim(lngData, values.longitude);
    pushAndTrim(altData, values.altitude);
    pushAndTrim(speedData, values.speed);
  
    pushAndTrim(accX, values.acc_x);
    pushAndTrim(accY, values.acc_y);
    pushAndTrim(accZ, values.acc_z);
  
    pushAndTrim(gyroX, values.gyro_x);
    pushAndTrim(gyroY, values.gyro_y);
    pushAndTrim(gyroZ, values.gyro_z);
  
    pushAndTrim(satData, values.satellites);
    pushAndTrim(hdopData, values.hdop);
  
    latChart.update(); lngChart.update(); altChart.update(); speedChart.update();
    accChart.update(); gyroChart.update(); satChart.update(); hdopChart.update();
  }
  
  function sendIFTTTAlert(message, timestamp) {
    const url = "https://maker.ifttt.com/trigger/tree_alert/with/key/dBN6yv91AsTYVIUeGxSy9px52mFnvnD8ANcib9JB8M8";
  
    const lat = lastLat !== null ? lastLat.toFixed(5) : "N/A";
    const lng = lastLng !== null ? lastLng.toFixed(5) : "N/A";
    const alt = latestAltitude !== null ? latestAltitude.toFixed(2) : "N/A";
    const spd = latestSpeed !== null ? latestSpeed.toFixed(2) : "N/A";
  
    const alertType = message;
  
    const value1 = alertType;
    const value2 = timestamp;
    const value3 = `Location: ${lat}, ${lng}\nAltitude: ${alt} m\nSpeed: ${spd} km/h`;
  
    const payload = {
      value1: value1,
      value2: value2,
      value3: value3
    };
  
    console.log("📤 Sending to IFTTT:", payload);
  
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    .then(res => {
      console.log("✅ IFTTT webhook response:", res.status);
      if (res.ok) {
        console.log("📨 Email alert sent");
      } else {
        console.error("❌ IFTTT error:", res.statusText);
      }
    })
    .catch(err => {
      console.error("❌ Fetch failed:", err);
    });
  }
  
    
  fetchLatestSensorData();
  

