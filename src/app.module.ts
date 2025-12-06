import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { Vehicle } from './entities/vehicle.entity';
import { Location } from './entities/location.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'vehicle_tracking',
      entities: [Vehicle, Location],
      synchronize: true,
    }),
    VehicleModule,
    TrackingModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
