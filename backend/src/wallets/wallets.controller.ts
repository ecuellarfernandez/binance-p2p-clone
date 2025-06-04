import { Controller, Get, Param, UseGuards, Request } from "@nestjs/common";
import { WalletsService } from "./wallets.service";
import { AuthGuard } from "../auth/auth.guard";

@UseGuards(AuthGuard)
@Controller("wallets")
export class WalletsController {
    constructor(private walletsService: WalletsService) {}

    @Get()
    getMyWallets(@Request() req) {
        return this.walletsService.findByUser(String(req.user.id));
    }

    @Get(":id")
    getWallet(@Param("id") id: string) {
        return this.walletsService.findById(id);
    }
}
