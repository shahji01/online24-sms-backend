import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  BeforeInsert,
} from 'typeorm';
import { Role } from './role.entity';
import { User } from './user.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  permission_name: string;

  @Column({
    type: 'int',
    default: 1,
    comment: '1 = Active, 2 = Inactive',
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

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @ManyToMany(() => User, (user) => user.permissions)
  users: User[];
}
