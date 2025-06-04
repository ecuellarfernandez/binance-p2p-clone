import { Module } from "@nestjs/common";
import { AdsService } from "./ads.service";
import { AdsController } from "./ads.controller";
import { WalletsModule } from "src/wallets/wallets.module";

@Module({
    imports: [WalletsModule],
    providers: [AdsService],
    controllers: [AdsController],
})
export class AdsModule {}
