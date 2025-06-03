import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Coin } from "./entity/coin.entity";

@Injectable()
export class CoinsService {
    constructor(
        @InjectRepository(Coin)
        private coinsRepository: Repository<Coin>,
    ) {}

    findAll(): Promise<Coin[]> {
        return this.coinsRepository.find();
    }

    findOne(id: string): Promise<Coin | null> {
        return this.coinsRepository.findOneBy({ id });
    }

    create(data: Partial<Coin>): Promise<Coin> {
        const coin = this.coinsRepository.create(data);
        return this.coinsRepository.save(coin);
    }

    update(id: string, data: Partial<Coin>): Promise<any> {
        return this.coinsRepository.update(id, data);
    }

    remove(id: string): Promise<any> {
        return this.coinsRepository.delete(id);
    }
}
