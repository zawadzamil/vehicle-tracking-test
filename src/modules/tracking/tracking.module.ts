import { Module } from '@nestjs/common';
import { TrackingGateway } from './tracking.gateway';
import { VehicleModule } from '../vehicle/vehicle.module';

@Module({
  imports: [VehicleModule],
  providers: [TrackingGateway],
})
export class TrackingModule {}
