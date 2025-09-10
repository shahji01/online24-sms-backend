
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeInsert } from 'typeorm';
import { Campus } from '../../campus/entity/campus.entity';

@Entity('schools')
export class School {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  contactNo: string;

  @OneToMany(() => Campus, (campus) => Campus.school)
  campuses: Campus[];

  @Column({ default: 1 })
  status: number;

  @Column({ type: 'date' })
  created_at: string;

  @Column({ type: 'date' })
  updated_at: string;

   @BeforeInsert()
    setCreateDateParts() {
        const today = new Date();
        const dateOnly = today.toISOString().split('T')[0];
        this.created_at = dateOnly;
        this.updated_at = dateOnly;
    }
}
