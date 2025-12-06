const socket = io();
const vehicleId = window.location.pathname.split('/').pop();

const map = L.map('map').setView([23.8103, 90.4125], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let myLocationMarker = null;
let destinationMarker = null;
let routeLine = null;
let accuracyCircle = null;
let watchId = null;
let currentPosition = null;
let destinationPosition = null;
let previousPosition = null;

const myLocationIcon = L.divIcon({
    className: 'my-location-icon',
    html: `<div style="background-color: #2196F3; width: 20px; height: 20px; border-radius: 50%;
           border: 4px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

const destinationIcon = L.divIcon({
    className: 'destination-icon',
    html: `<div style="background-color: #F44336; width: 20px; height: 20px; border-radius: 50%;
           border: 4px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

async function loadVehicleInfo() {
    try {
        const response = await fetch(`/api/vehicles/${vehicleId}`);
        const vehicle = await response.json();

        document.getElementById('vehicleInfo').innerHTML = `
            <h3>${vehicle.name}</h3>
            <p><strong>Driver:</strong> ${vehicle.driverName || 'You'}</p>
        `;

        if (vehicle.destinationLatitude && vehicle.destinationLongitude) {
            destinationPosition = {
                lat: vehicle.destinationLatitude,
                lng: vehicle.destinationLongitude,
                name: vehicle.destinationName || 'Destination'
            };
            updateDestinationMarker();
        }

    } catch (error) {
        console.error('Error loading vehicle info:', error);
    }
}

function startLocationTracking() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        document.getElementById('trackingStatus').textContent = 'Not supported';
        return;
    }

    document.getElementById('trackingStatus').textContent = 'Tracking...';

    const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    watchId = navigator.geolocation.watchPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = position.coords.accuracy;
            const speed = position.coords.speed;

            previousPosition = currentPosition;
            currentPosition = { lat, lng };

            updateMyLocationMarker(lat, lng, accuracy);
            updateLocationDisplay(lat, lng, accuracy, speed);

            socket.emit('updateLocation', {
                vehicleId: vehicleId,
                latitude: lat,
                longitude: lng,
                speed: speed ? (speed * 3.6).toFixed(1) : 0,
                heading: position.coords.heading || 0
            });

            if (destinationPosition) {
                updateRoute();
                updateDistance();
            }

            document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
            document.getElementById('trackingStatus').textContent = 'Active';
        },
        (error) => {
            console.error('Location error:', error);
            document.getElementById('trackingStatus').textContent = 'Error: ' + error.message;
        },
        options
    );
}

function updateMyLocationMarker(lat, lng, accuracy) {
    if (myLocationMarker) {
        myLocationMarker.setLatLng([lat, lng]);
    } else {
        myLocationMarker = L.marker([lat, lng], { icon: myLocationIcon })
            .addTo(map)
            .bindPopup('My Location');

        map.setView([lat, lng], 15);
    }

    if (accuracyCircle) {
        accuracyCircle.setLatLng([lat, lng]);
        accuracyCircle.setRadius(accuracy);
    } else {
        accuracyCircle = L.circle([lat, lng], {
            radius: accuracy,
            color: '#2196F3',
            fillColor: '#2196F3',
            fillOpacity: 0.1,
            weight: 1
        }).addTo(map);
    }
}

function updateLocationDisplay(lat, lng, accuracy, speed) {
    document.getElementById('currentLocation').textContent =
        `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

    document.getElementById('accuracy').textContent = accuracy.toFixed(0);

    if (speed !== null && speed !== undefined) {
        const speedKmh = (speed * 3.6).toFixed(1);
        document.getElementById('speed').textContent = speedKmh;
    }
}

function updateDestinationMarker() {
    if (!destinationPosition) return;

    const { lat, lng, name } = destinationPosition;

    if (destinationMarker) {
        destinationMarker.setLatLng([lat, lng]);
        destinationMarker.setPopupContent(name);
    } else {
        destinationMarker = L.marker([lat, lng], { icon: destinationIcon })
            .addTo(map)
            .bindPopup(name)
            .openPopup();
    }

    document.getElementById('destinationInfo').style.display = 'block';
    document.getElementById('destName').textContent = name;
    document.getElementById('destCoords').textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

    if (document.getElementById('mapInstructions')) {
        document.getElementById('mapInstructions').style.display = 'none';
    }

    updateRoute();
    updateDistance();
}

function updateRoute() {
    if (!currentPosition || !destinationPosition) return;

    const showRoute = document.getElementById('showRoute').checked;

    if (routeLine) {
        map.removeLayer(routeLine);
        routeLine = null;
    }

    if (showRoute) {
        const isOSRM = document.getElementById('showRoute').checked;

        routeLine = L.polyline([
            [currentPosition.lat, currentPosition.lng],
            [destinationPosition.lat, destinationPosition.lng]
        ], {
            color: '#2196F3',
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 10'
        }).addTo(map);

        if (currentPosition && destinationPosition) {
            const bounds = L.latLngBounds(
                [currentPosition.lat, currentPosition.lng],
                [destinationPosition.lat, destinationPosition.lng]
            );
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }
}

function updateDistance() {
    if (!currentPosition || !destinationPosition) return;

    const distance = calculateDistance(
        currentPosition.lat,
        currentPosition.lng,
        destinationPosition.lat,
        destinationPosition.lng
    );

    let distanceText;
    if (distance < 1) {
        distanceText = `${(distance * 1000).toFixed(0)} m`;
    } else {
        distanceText = `${distance.toFixed(2)} km`;
    }

    document.getElementById('distance').textContent = distanceText;

    if (distance < 0.05) {
        document.getElementById('trackingStatus').textContent = 'Destination reached!';
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

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

map.on('click', async (e) => {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    destinationPosition = {
        lat: lat,
        lng: lng,
        name: 'Selected Destination'
    };

    updateDestinationMarker();

    try {
        await fetch(`/api/vehicles/${vehicleId}/destination`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'Selected Destination',
                latitude: lat,
                longitude: lng
            }),
        });
    } catch (error) {
        console.error('Error setting destination:', error);
    }
});

document.getElementById('clearDestination').addEventListener('click', () => {
    if (destinationMarker) {
        map.removeLayer(destinationMarker);
        destinationMarker = null;
    }

    if (routeLine) {
        map.removeLayer(routeLine);
        routeLine = null;
    }

    destinationPosition = null;
    document.getElementById('destinationInfo').style.display = 'none';

    if (document.getElementById('mapInstructions')) {
        document.getElementById('mapInstructions').style.display = 'block';
    }
});

document.getElementById('showRoute').addEventListener('change', () => {
    updateRoute();
});

document.getElementById('refreshLocation').addEventListener('click', () => {
    if (currentPosition) {
        map.setView([currentPosition.lat, currentPosition.lng], 15);
    }
});

socket.emit('subscribeToVehicle', { vehicleId });

socket.on('locationUpdated', (data) => {
    if (data.vehicleId === vehicleId) {
        console.log('Location broadcast received:', data);
    }
});

loadVehicleInfo();
startLocationTracking();
