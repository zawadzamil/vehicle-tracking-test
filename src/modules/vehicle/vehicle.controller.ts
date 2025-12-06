import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { Vehicle } from '../../entities/vehicle.entity';

@Controller('api/vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  async createVehicle(@Body() body: Partial<Vehicle>): Promise<Vehicle> {
    return this.vehicleService.createVehicle(body);
  }

  @Get()
  async getAllVehicles(): Promise<Vehicle[]> {
    return this.vehicleService.getAllVehicles();
  }

  @Get(':id')
  async getVehicle(@Param('id') id: string): Promise<Vehicle> {
    return this.vehicleService.getVehicleById(id);
  }

  @Put(':id/destination')
  async setDestination(
    @Param('id') id: string,
    @Body() body: { name: string; latitude: number; longitude: number },
  ): Promise<Vehicle> {
    return this.vehicleService.setDestination(id, body.name, body.latitude, body.longitude);
  }

  @Get(':id/locations')
  async getVehicleLocations(@Param('id') id: string) {
    return this.vehicleService.getVehicleLocations(id);
  }

  @Delete(':id')
  async deleteVehicle(@Param('id') id: string): Promise<{ message: string }> {
    await this.vehicleService.deleteVehicle(id);
    return { message: 'Vehicle deleted successfully' };
  }
}
