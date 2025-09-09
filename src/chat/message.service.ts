import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
  ) {}

  save(data: { from: string; to: string; text: string }) {
    const message = this.messageRepo.create(data);
    return this.messageRepo.save(message);
  }

   findBetweenUsers(userId)  {
   const result = this.messageRepo.find({
      where: [
        { from: userId },
        { to: userId },
      ],
      order: { createdAt: 'ASC' },
    });

    console.log('result' + result)
    return result;
  }

  async findUserContacts(userId: string): Promise<string[]> {
    console.log("ssddsdsds" + userId)
    const messages = await this.messageRepo
      .createQueryBuilder('message')
      .where('message.from = :userId OR message.to = :userId', { userId })
      .getMany();

    const contacts = new Set<string>();
    for (const msg of messages) {
      if (msg.from !== userId) contacts.add(msg.from);
      if (msg.to !== userId) contacts.add(msg.to);
    }
    return Array.from(contacts);
  }
}


