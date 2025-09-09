// src/logging/activity-log.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: string;

  @Column({type:'int', nullable: true, comment: '1 = Ravi, 2 = Name of References, 3 = Title of the Books, 4 = Title of the Chapters, 5 = The Subsidiary Topics, 6 = Title of the Hadith, 7 = Hadith'})
  entity: number;

  @Column({ nullable: true, type:'int' })
  entityId: number | null;

  @Column({ type: 'json', nullable: true })
  oldValue: any;

  @Column({ type: 'json', nullable: true })
  newValue: any;

  @Column({ nullable: true })
  userId: string; // optional if you integrate with auth

  @Column({ nullable: true })
  lang_code: string;

  @CreateDateColumn()
  timestamp: Date;
}
