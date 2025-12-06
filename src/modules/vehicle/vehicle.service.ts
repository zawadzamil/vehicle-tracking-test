import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../../entities/vehicle.entity';
import { Location } from '../../entities/location.entity';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  async createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
    const vehicle = this.vehicleRepository.create(data);
    return this.vehicleRepository.save(vehicle);
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return this.vehicleRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getVehicleById(id: string): Promise<Vehicle> {
    return this.vehicleRepository.findOne({ where: { id } });
  }

  async updateVehicleLocation(
    vehicleId: string,
    latitude: number,
    longitude: number,
    speed?: number,
    heading?: number,
  ): Promise<Vehicle> {
    await this.vehicleRepository.update(vehicleId, {
      currentLatitude: latitude,
      currentLongitude: longitude,
    });

    const location = this.locationRepository.create({
      vehicleId,
      latitude,
      longitude,
      speed,
      heading,
    });
    await this.locationRepository.save(location);

    return this.getVehicleById(vehicleId);
  }

  async setDestination(
    vehicleId: string,
    destinationName: string,
    latitude: number,
    longitude: number,
  ): Promise<Vehicle> {
    await this.vehicleRepository.update(vehicleId, {
      destinationName,
      destinationLatitude: latitude,
      destinationLongitude: longitude,
    });
    return this.getVehicleById(vehicleId);
  }

  async getVehicleLocations(vehicleId: string, limit: number = 100): Promise<Location[]> {
    return this.locationRepository.find({
      where: { vehicleId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async deleteVehicle(id: string): Promise<void> {
    await this.vehicleRepository.update(id, { isActive: false });
  }
}
