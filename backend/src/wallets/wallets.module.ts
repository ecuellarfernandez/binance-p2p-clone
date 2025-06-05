import { forwardRef, Module } from "@nestjs/common";
import { WalletsService } from "./wallets.service";
import { WalletsController } from "./wallets.controller";
import { Wallet } from "./entity/wallet.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "src/users/users.module";
import { TransactionsModule } from "src/transactions/transactions.module";

@Module({
    imports: [TypeOrmModule.forFeature([Wallet]), forwardRef(() => UsersModule), forwardRef(() => TransactionsModule)],
    providers: [WalletsService],
    controllers: [WalletsController],
    exports: [TypeOrmModule, WalletsService],
})
export class WalletsModule {}
