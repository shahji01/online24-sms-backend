
import { Entity, PrimaryGeneratedColumn, Column, } from 'typeorm';

@Entity()
export class UserToken {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    token: string;

    @Column()
    deviceId: string;

    @Column({ type: 'timestamp' })
    createdAt: Date;
}