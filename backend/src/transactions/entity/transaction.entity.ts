import { Wallet } from "src/wallets/entity/wallet.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";

export enum TransactionType {
    BUY = "buy",
    SELL = "sell",
    TRANSFER = "transfer",
}

export enum TransactionStatus {
    PENDING = "pending",
    PAID = "paid",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
}

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Wallet, wallet => wallet.transactions, { eager: true })
    wallet: Wallet;

    @ManyToOne(() => Wallet, { nullable: true })
    counterpartyWallet: Wallet;

    @Column({ type: "enum", enum: TransactionType })
    type: TransactionType;

    @Column("float")
    amount: number;

    @Column({ nullable: true })
    description: string;

    @Column({ type: "enum", enum: TransactionStatus, default: TransactionStatus.PENDING })
    status: TransactionStatus;

    @Column({ nullable: true })
    paymentProof: string;

    @CreateDateColumn()
    createdAt: Date;
}
