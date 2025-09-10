// src/section/section.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, BeforeInsert } from 'typeorm';
import { Campus } from '../../campus/entity/campus.entity';
import { Class } from '../../class/entity/class.entity';

@Entity('sections')
export class Section {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  campusId: number;

  @ManyToOne(() => Campus, (campus) => campus.sections, { eager: true })
  @JoinColumn({ name: 'campusId' })
  campus: Campus;

  @OneToMany(() => Class, (cls) => cls.section)
  classes: Class[];

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
