import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TransactionsService } from "./transactions.service";
import { TransactionsController } from "./transactions.controller";
import { Transaction } from "./entity/transaction.entity";
import { Wallet } from "src/wallets/entity/wallet.entity";
import { AdsModule } from "src/ads/ads.module";
import { UsersModule } from "src/users/users.module";

@Module({
    imports: [TypeOrmModule.forFeature([Transaction, Wallet]), forwardRef(() => AdsModule), forwardRef(() => UsersModule), forwardRef(() => AdsModule)],
    providers: [TransactionsService],
    controllers: [TransactionsController],
    exports: [TransactionsService],
})
export class TransactionsModule {}
