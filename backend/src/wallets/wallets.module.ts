import { Module } from "@nestjs/common";
import { WalletsService } from "./wallets.service";
import { WalletsController } from "./wallets.controller";
import { Wallet } from "./entity/wallet.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "src/users/users.module";

@Module({
    imports: [TypeOrmModule.forFeature([Wallet]), UsersModule],
    providers: [WalletsService],
    controllers: [WalletsController],
})
export class WalletsModule {}
