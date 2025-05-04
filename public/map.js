let map = L.map("map").setView([29.8650, 77.8860], 14);

// OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// Add marker
let marker = L.marker([29.8650, 77.8860]).addTo(map)
  .bindPopup("Waiting for GPS...")
  .openPopup();

// Function to update GPS
function updateMap(lat, lng) {
  marker.setLatLng([lat, lng]);
  map.setView([lat, lng], 14);
  marker.setPopupContent(`📍 Device Location<br>Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
}
