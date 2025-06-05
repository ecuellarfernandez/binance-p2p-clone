import { Body, Controller, Get, Post, Query, Request, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { AdsService } from "./ads.service";
import { AuthGuard } from "../auth/auth.guard";
import { CreateAdDto } from "./dtos/create-ad.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { AdType } from "./entity/ad.entity";
import { SelectAdDto } from "./dtos/select-ad.dto";

@UseGuards(AuthGuard)
@Controller("ads")
export class AdsController {
    constructor(private adsService: AdsService) {}

    @Post()
    @UseInterceptors(FileInterceptor("paymentInstructionsImage"))
    create(@Request() req, @Body() dto: CreateAdDto, @UploadedFile() file?: Express.Multer.File) {
        console.log("DTO recibido:", dto); // Verifica si price y amount son números
        return this.adsService.create(req.user, dto, file ? `/uploads/${file.filename}` : undefined);
    }
    @Get()
    list(@Query("coinId") coinId: string, @Query("type") type: AdType, @Request() req) {
        return this.adsService.list(coinId, type, req.user.id);
    }

    @Post("select")
    async selectAd(@Request() req, @Body() dto: SelectAdDto) {
        return this.adsService.selectAd(req.user, dto);
    }

    @Get("my-ads")
    getMyAds(@Request() req) {
        return this.adsService.getMyAds(req.user.id);
    }
}
