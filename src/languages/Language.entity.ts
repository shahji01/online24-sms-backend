import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
} from 'typeorm';

@Entity('languages')
export class Language {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    type: 'varchar',
    length: 5,
  })
  lang_code: string;

  @Column({ type: 'varchar', length: 255, name: 'lang_name', nullable: true })
  lang_name?: string;

  @Column({
    type: 'int',
    default: 1,
    comment: '1 = Active, 2 = Inactive',
  })
  status: number;

  @Column({ type: 'date', nullable: true })
  created_date?: string;

  @Column({ type: 'time', nullable: true })
  created_time?: string;

  

  @BeforeInsert()
  setDefaults() {
    const now = new Date();
    this.created_date = now.toISOString().split('T')[0];
    this.created_time = now.toTimeString().split(' ')[0];
  }
}
