import { forwardRef, Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.model";
import { UsersController } from "./users.controller";
import { WalletsModule } from "src/wallets/wallets.module";
import { CoinsModule } from "src/coins/coins.module";
import { TransactionsModule } from "src/transactions/transactions.module";
import { AdsModule } from "src/ads/ads.module";

@Module({
    imports: [TypeOrmModule.forFeature([User]), forwardRef(() => WalletsModule), forwardRef(() => CoinsModule), forwardRef(() => TransactionsModule), forwardRef(() => AdsModule)],
    providers: [UsersService],
    exports: [UsersService],
    controllers: [UsersController],
})
export class UsersModule {}
