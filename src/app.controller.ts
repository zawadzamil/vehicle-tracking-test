import { Controller, Get, Render } from '@nestjs/common';
import { VehicleService } from './modules/vehicle/vehicle.service';

@Controller()
export class AppController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get()
  @Render('index')
  async root() {
    const vehicles = await this.vehicleService.getAllVehicles();
    return { vehicles };
  }

  @Get('tracker/:id')
  @Render('tracker')
  async tracker() {
    return {};
  }

  @Get('simulator')
  @Render('simulator')
  async simulator() {
    const vehicles = await this.vehicleService.getAllVehicles();
    return { vehicles };
  }
}
