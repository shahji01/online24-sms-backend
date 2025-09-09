// src/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeInsert, ManyToMany, JoinTable } from 'typeorm';
import { Role } from './role.entity';
import { Permission } from './Permission.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type:'int', nullable: true, default: 2, comment: '1 = Admin, 2 User'})
  type: number;

  @Column({ length: 5, nullable: true })
  lang_code: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 255, nullable: true })
  reset_password_code: string;

  @Column({ type: 'datetime', nullable: true })
  reset_password_expiry: Date;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ length: 255, nullable: true })
  image: string;

  @Column({ length: 255, nullable: true })
  dob: string;

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

  @Column({
    type: 'int',
    default: 1,
    comment: '1 = Pending, 2 = Reject, 3 = Approved',
  })
  status: number;

  @Column({ nullable: true, default: null })
  two_fa_code: string;

  @Column({ type: 'timestamp', nullable: true, default: null })
  two_fa_expiry: Date;


  @ManyToMany(() => Role, role => role.users, { eager: true })
  @JoinTable({
    name: 'user_role_mappings',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];

  @ManyToMany(() => Permission, permission => permission.users, { eager: true })
  @JoinTable({
    name: 'user_permissions',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions: Permission[];
}