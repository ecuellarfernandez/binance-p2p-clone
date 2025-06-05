import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.model";
import { Repository } from "typeorm";
import { RegisterDto } from "../auth/dtos/register.dto";
import { Wallet } from "src/wallets/entity/wallet.entity";
import { Coin } from "src/coins/entity/coin.entity";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Wallet)
        private walletRepository: Repository<Wallet>,
    ) {}

    findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOneBy({ email });
    }
    async create(user: RegisterDto): Promise<User> {
        const newUser = this.usersRepository.create(user);
        // Save user first
        const savedUser = await this.usersRepository.save(newUser);

        // Buscar la moneda USDT
        const usdtCoin = await this.walletRepository.manager.findOne(Coin, { where: { symbol: "USDT" } });
        if (!usdtCoin) throw new Error("USDT coin not found");

        // Crear la billetera para USDT
        const wallet = this.walletRepository.create({
            user: savedUser,
            coin: usdtCoin,
            balance: 0,
        });
        await this.walletRepository.save(wallet);

        return savedUser;
    }
    getUserById(id: string): Promise<User | null> {
        return this.usersRepository.findOneBy({ id });
    }

    findAll() {
        return this.usersRepository.find();
    }

    async updateRole(id: string, role: string) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) throw new NotFoundException("User not found");
        user.role = role;
        return this.usersRepository.save(user);
    }
}
