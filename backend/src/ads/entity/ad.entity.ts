import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "src/users/user.model";
import { Coin } from "src/coins/entity/coin.entity";

export enum AdType {
    BUY = "buy",
    SELL = "sell",
}

@Entity()
export class Ad {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => User, { eager: true })
    user: User;

    @ManyToOne(() => Coin, { eager: true })
    coin: Coin;

    @Column({ type: "enum", enum: AdType })
    type: AdType;

    @Column("float")
    price: number;

    @Column("float")
    amount: number;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    paymentInstructionsImage: string;

    @Column({ nullable: true })
    paymentInstructionsText: string;

    @Column({ default: true })
    active: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
