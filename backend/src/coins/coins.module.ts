import { forwardRef, Module } from "@nestjs/common";
import { CoinsService } from "./coins.service";
import { CoinsController } from "./coins.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Coin } from "./entity/coin.entity";
import { UsersModule } from "src/users/users.module";

@Module({
    imports: [TypeOrmModule.forFeature([Coin]), forwardRef(() => UsersModule)],
    providers: [CoinsService],
    controllers: [CoinsController],
    exports: [TypeOrmModule, CoinsService],
})
export class CoinsModule {}
