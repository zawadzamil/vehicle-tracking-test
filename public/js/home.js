const socket = io();

document.getElementById('addVehicleForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const vehicleName = document.getElementById('vehicleName').value;
    const driverName = document.getElementById('driverName').value;
    const licensePlate = document.getElementById('licensePlate').value;

    try {
        const response = await fetch('/api/vehicles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: vehicleName,
                driverName: driverName,
                licensePlate: licensePlate,
            }),
        });

        if (response.ok) {
            alert('Vehicle added successfully!');
            window.location.reload();
        } else {
            alert('Failed to add vehicle');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error adding vehicle');
    }
});

async function deleteVehicle(id) {
    if (!confirm('Are you sure you want to delete this vehicle?')) {
        return;
    }

    try {
        const response = await fetch(`/api/vehicles/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            alert('Vehicle deleted successfully!');
            window.location.reload();
        } else {
            alert('Failed to delete vehicle');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting vehicle');
    }
}

socket.on('locationUpdated', (data) => {
    console.log('Location updated:', data);
});
