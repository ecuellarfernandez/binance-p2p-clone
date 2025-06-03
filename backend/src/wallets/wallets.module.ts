import { Module } from "@nestjs/common";
import { WalletsService } from "./wallets.service";
import { WalletsController } from "./wallets.controller";
import { Wallet } from "./entity/wallet.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [TypeOrmModule.forFeature([Wallet])],
    providers: [WalletsService],
    controllers: [WalletsController],
})
export class WalletsModule {}
