import { Controller, Get, Param, UseGuards, Request, Post, Body } from "@nestjs/common";
import { WalletsService } from "./wallets.service";
import { AuthGuard } from "../auth/auth.guard";
import { TransactionsService } from "src/transactions/transactions.service";
import { CreateWalletDto } from "./dtos/create-wallet.dto";

@UseGuards(AuthGuard)
@Controller("wallets")
export class WalletsController {
    constructor(
        private walletsService: WalletsService,
        private transactionsService: TransactionsService,
    ) {}

    @Post()
    createWallet(@Request() req, @Body() dto: CreateWalletDto) {
        return this.walletsService.create(req.user, dto);
    }

    @Get()
    getMyWallets(@Request() req) {
        return this.walletsService.findByUser(String(req.user.id));
    }

    @Get(":id")
    getWallet(@Param("id") id: string) {
        return this.walletsService.findById(id);
    }

    @Get(":id/transactions")
    getWalletTransactions(@Param("id") id: string, @Request() req) {
        return this.transactionsService.getWalletTransactions(id, req.user);
    }
}
