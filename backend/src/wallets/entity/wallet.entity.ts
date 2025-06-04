import { Coin } from "src/coins/entity/coin.entity";
import { Transaction } from "src/transactions/entity/transaction.entity";
import { User } from "src/users/user.model";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";

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

    @OneToMany(() => Transaction, transaction => transaction.wallet)
    transactions: Transaction[];
}
