import { HttpException, HttpStatus, Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DataSource } from "typeorm";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";
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
dotenv.config();

@Module({
    imports: [
        ConfigModule.forRoot(),
        MulterModule.register({
            storage: diskStorage({
                destination: "./uploads", // Directorio donde se guardarán los archivos
                filename: (req, file, callback) => {
                    const idSuffix = req.params.id;
                    const extension = file.originalname.split(".").pop();
                    //aceptar solo jpg
                    if (extension !== "jpg") {
                        callback(new HttpException("Only jpg files allowed", HttpStatus.BAD_REQUEST), "");
                    }

                    const filename = idSuffix + "." + extension;
                    callback(null, filename);
                },
            }),
        }),
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
            entities: [User, Wallet, Coin],
            synchronize: true, //solo mientras estén en desarrollo
        }),
        AuthModule,
        UsersModule,
        CoinsModule,
        WalletsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
    constructor(private dataSource: DataSource) {}
}
