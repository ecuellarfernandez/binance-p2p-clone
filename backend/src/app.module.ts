import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DataSource, Transaction } from "typeorm";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { MulterModule } from "@nestjs/platform-express";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { User } from "./users/user.model";
import * as dotenv from "dotenv";
import { CoinsModule } from "./coins/coins.module";
import { WalletsModule } from "./wallets/wallets.module";
import { Coin } from "./coins/entity/coin.entity";
import { Wallet } from "./wallets/entity/wallet.entity";
import { TransactionsModule } from "./transactions/transactions.module";
import { AdsModule } from "./ads/ads.module";
import { Ad } from "./ads/entity/ad.entity";
dotenv.config();

@Module({
    imports: [
        ConfigModule.forRoot(),
        MulterModule.register(),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, "..", "uploads"), // La ruta desde la que se servirán los archivos
            serveRoot: "/uploads", // La ruta desde la que se accederá a los archivos
        }),
        TypeOrmModule.forRoot({
            type: "postgres",
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT ?? "", 10),
            username: process.env.DB_USER,
            password: String(process.env.DB_PASSWORD),
            database: process.env.DB_NAME,
            entities: [__dirname + "/**/*.entity{.ts,.js}", User, Wallet, Coin, Transaction, Ad],
            synchronize: true, //solo mientras estén en desarrollo
        }),
        AuthModule,
        UsersModule,
        CoinsModule,
        WalletsModule,
        TransactionsModule,
        AdsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
    constructor(private dataSource: DataSource) {}
}
