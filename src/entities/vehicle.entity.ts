import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Location } from './location.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  driverName: string;

  @Column({ nullable: true })
  licensePlate: string;

  @Column({ default: true })
  isActive: boolean;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  currentLatitude: number;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  currentLongitude: number;

  @Column({ nullable: true })
  destinationName: string;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  destinationLatitude: number;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  destinationLongitude: number;

  @OneToMany(() => Location, location => location.vehicle)
  locations: Location[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
