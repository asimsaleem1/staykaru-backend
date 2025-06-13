import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHomePage(@Res() res: Response): void {
    return this.appService.getHomePage(res);
  }

  @Get('status')
  getStatus(): object {
    return this.appService.getStatus();
  }
}
