import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as path from "path";
import * as fs from "fs";

async function bootstrap() {
    // Asegúrate de que el directorio uploads exista
    const uploadsDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: "*",
    });
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
        }),
    );
    app.useGlobalInterceptors();
    await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
