// src/class/class.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { Section } from '../../section/entity/section.entity';

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  className: string;

  @Column()
  noOfStudents: number;

  @Column()
  sectionId: number;

  @ManyToOne(() => Section, (section) => section.classes, { eager: true })
  @JoinColumn({ name: 'sectionId' })
  section: Section;

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
