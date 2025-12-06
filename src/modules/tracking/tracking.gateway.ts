import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { VehicleService } from '../vehicle/vehicle.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly vehicleService: VehicleService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('updateLocation')
  async handleLocationUpdate(
    @MessageBody() data: {
      vehicleId: string;
      latitude: number;
      longitude: number;
      speed?: number;
      heading?: number;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const vehicle = await this.vehicleService.updateVehicleLocation(
      data.vehicleId,
      data.latitude,
      data.longitude,
      data.speed,
      data.heading,
    );

    this.server.emit('locationUpdated', {
      vehicleId: vehicle.id,
      name: vehicle.name,
      latitude: vehicle.currentLatitude,
      longitude: vehicle.currentLongitude,
      speed: data.speed,
      heading: data.heading,
      destination: vehicle.destinationName ? {
        name: vehicle.destinationName,
        latitude: vehicle.destinationLatitude,
        longitude: vehicle.destinationLongitude,
      } : null,
    });

    return { success: true, vehicle };
  }

  @SubscribeMessage('subscribeToVehicle')
  async handleSubscribe(
    @MessageBody() data: { vehicleId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`vehicle:${data.vehicleId}`);
    const vehicle = await this.vehicleService.getVehicleById(data.vehicleId);
    return { success: true, vehicle };
  }

  @SubscribeMessage('unsubscribeFromVehicle')
  handleUnsubscribe(
    @MessageBody() data: { vehicleId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`vehicle:${data.vehicleId}`);
    return { success: true };
  }
}
