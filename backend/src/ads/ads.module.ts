import { Module, forwardRef } from "@nestjs/common";
import { AdsService } from "./ads.service";
import { AdsController } from "./ads.controller";
import { WalletsModule } from "src/wallets/wallets.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Ad } from "./entity/ad.entity";
import { Coin } from "src/coins/entity/coin.entity";
import { Wallet } from "src/wallets/entity/wallet.entity";
import { TransactionsModule } from "src/transactions/transactions.module";

@Module({
    imports: [TypeOrmModule.forFeature([Ad, Coin, Wallet]), WalletsModule, forwardRef(() => TransactionsModule)],
    providers: [AdsService],
    controllers: [AdsController],
})
export class AdsModule {}
