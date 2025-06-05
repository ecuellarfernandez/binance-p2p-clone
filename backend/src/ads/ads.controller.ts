import { Body, Controller, Get, Post, Query, Request, UploadedFile, UseGuards, UseInterceptors, Param } from "@nestjs/common";
import { AdsService } from "./ads.service";
import { AuthGuard } from "../auth/auth.guard";
import { CreateAdDto } from "./dtos/create-ad.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { AdType } from "./entity/ad.entity";
import { SelectAdDto } from "./dtos/select-ad.dto";

@UseGuards(AuthGuard)
@Controller("ads")
export class AdsController {
    constructor(private adsService: AdsService) {}

    @Post()
    @UseInterceptors(
        FileInterceptor("paymentInstructionsImage", {
            storage: diskStorage({
                destination: "./uploads",
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now();
                    const ext = extname(file.originalname);
                    const filename = `payment-instructions-${uniqueSuffix}${ext}`;
                    callback(null, filename);
                },
            }),
            fileFilter: (req, file, callback) => {
                if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                    return callback(new Error("Solo se permiten archivos de imagen."), false);
                }
                callback(null, true);
            },
        }),
    )
    create(@Request() req, @Body() dto: CreateAdDto, @UploadedFile() file?: Express.Multer.File) {
        console.log("DTO recibido:", dto);
        console.log("Archivo recibido:", file);
        return this.adsService.create(req.user, dto, file ? `/uploads/${file.filename}` : undefined);
    }
    @Get()
    list(@Query("coinId") coinId: string, @Query("type") type: AdType, @Request() req) {
        return this.adsService.list(coinId, type, req.user.id);
    }

    @Post(":id/select")
    async selectAd(@Param("id") adId: string, @Request() req, @Body() dto: SelectAdDto) {
        dto.adId = adId; // Asignar el ID del anuncio desde los parámetros de la ruta
        return this.adsService.selectAd(req.user, dto);
    }

    @Get("my-ads")
    getMyAds(@Request() req) {
        return this.adsService.getMyAds(req.user.id);
    }
}
