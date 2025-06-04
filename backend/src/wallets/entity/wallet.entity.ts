import { Coin } from "src/coins/entity/coin.entity";
import { User } from "src/users/user.model";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";

@Entity()
export class Wallet {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => User, user => user.wallets, { eager: false, onDelete: "CASCADE" })
    user: User;

    @ManyToOne(() => Coin, { eager: true, onDelete: "CASCADE" })
    coin: Coin;

    @Column("float", { default: 0 })
    balance: number;
}
