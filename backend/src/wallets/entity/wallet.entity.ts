import { Coin } from "src/coins/entity/coin.entity";
import { User } from "src/users/user.model";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";

@Entity()
export class Wallet {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.wallets)
    user: User;

    @ManyToOne(() => Coin)
    coin: Coin;

    @Column("float", { default: 0 })
    balance: number;
}
