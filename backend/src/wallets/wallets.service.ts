import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Wallet } from "./entity/wallet.entity";
import { Repository } from "typeorm";
import { CreateWalletDto } from "./dtos/create-wallet.dto";
import { User } from "src/users/user.model";
import { Coin } from "src/coins/entity/coin.entity";

@Injectable()
export class WalletsService {
    constructor(
        @InjectRepository(Wallet)
        private walletsRepository: Repository<Wallet>,
    ) {}

    async create(user: User, dto: CreateWalletDto) {
        const exists = await this.walletsRepository.findOne({
            where: { user: { id: user.id }, coin: { id: dto.coinId } },
            relations: ["coin", "user"],
        });

        if (exists) {
            return new BadRequestException("Wallet already exists for this coin");
        }

        const wallet = this.walletsRepository.create({
            user,
            coin: { id: dto.coinId } as Coin,
            balance: dto.initialBalance,
        });

        return this.walletsRepository.save(wallet);
    }

    findByUser(userId: string) {
        return this.walletsRepository.find({
            where: { user: { id: userId } },
            relations: ["coin"],
        });
    }

    findById(id: string) {
        return this.walletsRepository.findOne({
            where: { id },
            relations: ["coin", "user"],
        });
    }
}
