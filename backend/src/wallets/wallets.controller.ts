import { Controller, Get, Param, UseGuards, Request } from "@nestjs/common";
import { WalletsService } from "./wallets.service";
import { AuthGuard } from "../auth/auth.guard";
import { TransactionsService } from "src/transactions/transactions.service";

@UseGuards(AuthGuard)
@Controller("wallets")
export class WalletsController {
    constructor(
        private walletsService: WalletsService,
        private transactionsService: TransactionsService,
    ) {}

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
