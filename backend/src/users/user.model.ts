import { Wallet } from "src/wallets/entity/wallet.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;
    @Column()
    email: string;
    @Column()
    password: string;
    @Column()
    fullName: string;
    @Column({ default: "user" })
    role: string; // 'user' | 'admin'
    @OneToMany(() => Wallet, wallet => wallet.user)
    wallets: Wallet[];
}
