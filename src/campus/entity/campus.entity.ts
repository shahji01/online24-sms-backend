// src/campus/campus.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, BeforeInsert } from 'typeorm';
import { School } from '../../school/entity/school.entity';
import { Section } from '../../section/entity/section.entity';

@Entity('campuses')
export class Campus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  contact_no: string;

  @Column()
  school_id: number;

  @ManyToOne(() => School, (school) => school.campuses, { eager: true })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @OneToMany(() => Section, (section) => section.campus)
  sections: Section[];

  @Column({ default: 1, comment:'1 = Active, 2 = Inactive' })
  status: number;
   static school: any;

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
