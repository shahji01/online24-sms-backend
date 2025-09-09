import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  BeforeInsert
} from 'typeorm';
import { User } from './user.entity';
import { Permission } from './Permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, unique: true })
  role_name: string;

  @Column({
    type: 'int',
    comment: '1 = active, 2 = inactive',
    default: 1
  })
  status: number;

  @Column({ type: 'date' })
  created_date: string;

  @Column({ type: 'time' })
  created_time: string;

  @BeforeInsert()
  setDefaults() {
    const now = new Date();
    this.created_date = now.toISOString().split('T')[0];
    this.created_time = now.toTimeString().split(' ')[0];
  }

  @ManyToMany(() => User, user => user.roles)
  users: User[];

  @ManyToMany(() => Permission, permission => permission.roles, { eager: true })
  @JoinTable({
    name: 'role_permission_mappings',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id'
    }
  })
  permissions: Permission[];
}
