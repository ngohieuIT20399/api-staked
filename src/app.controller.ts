import { Controller, Get, Post, Param, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getListWallet() {
    return this.appService.getListWallet();
  }

  @Post()
  checkStaking(@Res() res: Response) {
    return this.appService.CheckStaked(res);
  }

  @Post('/:id')
  acceptAddress(@Param('id') id: string) {
    return this.appService.accepctAddress(id);
  }
}
