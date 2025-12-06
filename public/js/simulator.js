const socket = io();

const map = L.map('map').setView([23.8103, 90.4125], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let selectedVehicleId = null;
let currentPosition = null;
let destinationPosition = null;
let simulationInterval = null;
let currentMarker = null;
let destinationMarker = null;
let routeLine = null;

const vehicleSelect = document.getElementById('vehicleSelect');
const startBtn = document.getElementById('startSimulation');
const stopBtn = document.getElementById('stopSimulation');

vehicleSelect.addEventListener('change', (e) => {
    selectedVehicleId = e.target.value;
    document.getElementById('selectedVehicleName').textContent =
        e.target.options[e.target.selectedIndex].text || 'None';

    if (selectedVehicleId) {
        document.getElementById('simStatus').textContent = 'Ready - Click on map to set positions';
    } else {
        document.getElementById('simStatus').textContent = 'Idle';
    }
});

map.on('click', (e) => {
    if (!selectedVehicleId) {
        alert('Please select a vehicle first');
        return;
    }

    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    if (!currentPosition) {
        currentPosition = { lat, lng };

        if (currentMarker) {
            map.removeLayer(currentMarker);
        }

        const currentIcon = L.divIcon({
            className: 'current-icon',
            html: '<div style="background-color: #3498db; width: 24px; height: 24px; border-radius: 50%; border: 4px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        currentMarker = L.marker([lat, lng], { icon: currentIcon })
            .addTo(map)
            .bindPopup('Current Position')
            .openPopup();

        document.getElementById('currentPos').textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        document.getElementById('simStatus').textContent = 'Click on map to set destination';
    } else if (!destinationPosition) {
        destinationPosition = { lat, lng };

        if (destinationMarker) {
            map.removeLayer(destinationMarker);
        }

        const destIcon = L.divIcon({
            className: 'dest-icon',
            html: '<div style="background-color: #e74c3c; width: 24px; height: 24px; border-radius: 50%; border: 4px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        destinationMarker = L.marker([lat, lng], { icon: destIcon })
            .addTo(map)
            .bindPopup('Destination')
            .openPopup();

        document.getElementById('destinationPos').textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

        if (routeLine) {
            map.removeLayer(routeLine);
        }

        routeLine = L.polyline([
            [currentPosition.lat, currentPosition.lng],
            [lat, lng]
        ], {
            color: '#3498db',
            weight: 3,
            opacity: 0.7,
            dashArray: '10, 10'
        }).addTo(map);

        map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });

        startBtn.disabled = false;
        document.getElementById('simStatus').textContent = 'Ready to start simulation';
    }
});

startBtn.addEventListener('click', () => {
    if (!currentPosition || !destinationPosition) {
        alert('Please set both current position and destination');
        return;
    }

    startBtn.disabled = true;
    stopBtn.disabled = false;
    vehicleSelect.disabled = true;

    document.getElementById('simStatus').textContent = 'Simulation running...';

    const speed = parseFloat(document.getElementById('simSpeed').value);
    const updateInterval = parseInt(document.getElementById('updateInterval').value);

    const totalDistance = calculateDistance(
        currentPosition.lat,
        currentPosition.lng,
        destinationPosition.lat,
        destinationPosition.lng
    );

    const speedMetersPerSecond = (speed * 1000) / 3600;
    const distancePerUpdate = (speedMetersPerSecond * updateInterval) / 1000;

    let traveled = 0;

    simulationInterval = setInterval(() => {
        traveled += distancePerUpdate;

        if (traveled >= totalDistance) {
            currentPosition = { ...destinationPosition };
            updateMarkerPosition(currentPosition.lat, currentPosition.lng);

            socket.emit('updateLocation', {
                vehicleId: selectedVehicleId,
                latitude: currentPosition.lat,
                longitude: currentPosition.lng,
                speed: 0,
                heading: 0
            });

            stopSimulation();
            document.getElementById('simStatus').textContent = 'Destination reached!';
            return;
        }

        const fraction = traveled / totalDistance;
        const newLat = currentPosition.lat + (destinationPosition.lat - currentPosition.lat) * fraction;
        const newLng = currentPosition.lng + (destinationPosition.lng - currentPosition.lng) * fraction;

        const heading = calculateBearing(
            currentPosition.lat,
            currentPosition.lng,
            destinationPosition.lat,
            destinationPosition.lng
        );

        socket.emit('updateLocation', {
            vehicleId: selectedVehicleId,
            latitude: newLat,
            longitude: newLng,
            speed: speed,
            heading: heading
        });

        updateMarkerPosition(newLat, newLng);

        currentPosition = { lat: newLat, lng: newLng };
        document.getElementById('currentPos').textContent = `${newLat.toFixed(4)}, ${newLng.toFixed(4)}`;

    }, updateInterval);
});

stopBtn.addEventListener('click', () => {
    stopSimulation();
    document.getElementById('simStatus').textContent = 'Simulation stopped';
});

function stopSimulation() {
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }
    startBtn.disabled = false;
    stopBtn.disabled = true;
    vehicleSelect.disabled = false;
}

function updateMarkerPosition(lat, lng) {
    if (currentMarker) {
        currentMarker.setLatLng([lat, lng]);
    }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function calculateBearing(lat1, lon1, lat2, lon2) {
    const dLon = toRadians(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRadians(lat2));
    const x = Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
        Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLon);
    const bearing = toDegrees(Math.atan2(y, x));
    return (bearing + 360) % 360;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function toDegrees(radians) {
    return radians * (180 / Math.PI);
}

document.getElementById('vehicleSelect').querySelector('option').textContent = 'Select a vehicle';
