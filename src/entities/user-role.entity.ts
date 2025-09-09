// src/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeInsert } from 'typeorm';

import { User } from './user.entity';

@Entity()
export class user_roles {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({length: 5, nullable: true})
  lang_code: string;

  @Column({ length: 255 })
  role_name: string;

 @Column({
    type: 'int',
    comment: '1 = active, 2 = inactive',
    default: 1
  })
  status: 1 | 2 ;

  @Column({ type: 'date' })
  created_date: String;

  @Column({ type: 'time' })
  created_time: String;

  @BeforeInsert()
  setDefaults() {
    const now = new Date();
    this.created_date = now.toDateString();
    this.created_time = now.toTimeString().split(' ')[0]; // 'HH:MM:SS'
  }
}