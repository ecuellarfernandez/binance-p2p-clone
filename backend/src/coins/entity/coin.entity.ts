import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Coin {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    name: string;

    @Column()
    symbol: string;

    @Column("float")
    valueInUsd: number;
}
