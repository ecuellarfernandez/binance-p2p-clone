import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdsService } from "./ads.service";
import { AdsController } from "./ads.controller";
import { Ad } from "./entity/ad.entity";
import { Coin } from "src/coins/entity/coin.entity";
import { Wallet } from "src/wallets/entity/wallet.entity";
import { TransactionsModule } from "src/transactions/transactions.module";
import { UsersModule } from "src/users/users.module";
import { WalletsModule } from "src/wallets/wallets.module";

@Module({
    imports: [TypeOrmModule.forFeature([Ad, Coin, Wallet]), forwardRef(() => TransactionsModule), UsersModule, forwardRef(() => WalletsModule)],
    providers: [AdsService],
    controllers: [AdsController],
    exports: [AdsService],
})
export class AdsModule {}
