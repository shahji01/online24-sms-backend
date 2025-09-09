
import { Controller, Get, Param, Query } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('messages')
export class ChatController {
  constructor(private readonly messageService: MessageService) {}

  @Get('user-details/:id')
  async getMessages(@Param('id') id:any) {
    console.log(id);
    return this.messageService.findBetweenUsers(id);
  }
}