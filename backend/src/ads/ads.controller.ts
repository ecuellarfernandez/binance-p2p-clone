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
        return this.adsService.create(req.user, dto, file ? `/uploads/${file.filename}` : undefined);
    }

    @Get()
    list(@Query("coinId") coinId: string, @Query("type") type: AdType) {
        return this.adsService.list(coinId, type);
    }

    @Post("select")
    async selectAd(@Request() req, @Body() dto: SelectAdDto) {
        return this.adsService.selectAd(req.user, dto);
    }
}
