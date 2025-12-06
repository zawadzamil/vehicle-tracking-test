# Vehicle Tracking System

A real-time vehicle tracking application built with NestJS, Socket.IO, Leaflet, and PostgreSQL.

## Features

- Real-time vehicle location tracking using Socket.IO
- Interactive map interface using Leaflet
- PostgreSQL database for data persistence
- Vehicle simulator for testing
- Set destinations and track routes
- EJS templates for server-side rendering

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure database in `.env`:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=vehicle_tracking
```

3. Create PostgreSQL database:
```sql
CREATE DATABASE vehicle_tracking;
```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

The application will be available at http://localhost:3000

## Usage

### 1. Home Page (/)
- Add new vehicles
- View all active vehicles
- Navigate to tracker or simulator

### 2. Tracker (/tracker/:id)
- View real-time location of a specific vehicle
- Set destinations
- See route between current location and destination
- Monitor speed and updates

### 3. Simulator (/simulator)
- Select a vehicle
- Click on map to set starting position
- Click again to set destination
- Adjust speed and update interval
- Start simulation to see vehicle movement

## API Endpoints

- `POST /api/vehicles` - Create a new vehicle
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/:id` - Get vehicle by ID
- `PUT /api/vehicles/:id/destination` - Set vehicle destination
- `GET /api/vehicles/:id/locations` - Get vehicle location history
- `DELETE /api/vehicles/:id` - Delete vehicle

## WebSocket Events

- `updateLocation` - Send location update
- `locationUpdated` - Receive location update broadcast
- `subscribeToVehicle` - Subscribe to vehicle updates
- `unsubscribeFromVehicle` - Unsubscribe from vehicle updates

## Project Structure

```
.
├── src/
│   ├── entities/           # TypeORM entities
│   ├── modules/
│   │   ├── vehicle/       # Vehicle module
│   │   └── tracking/      # WebSocket gateway
│   ├── app.module.ts      # Main app module
│   ├── app.controller.ts  # View controllers
│   └── main.ts            # Entry point
├── views/                 # EJS templates
├── public/
│   ├── css/              # Stylesheets
│   └── js/               # Frontend JavaScript
└── .env                  # Environment variables
```

## Technologies Used

- NestJS - Backend framework
- Socket.IO - Real-time communication
- TypeORM - ORM for PostgreSQL
- Leaflet - Interactive maps
- EJS - Template engine
- PostgreSQL - Database
