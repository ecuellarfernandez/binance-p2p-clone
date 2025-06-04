import { Body, Controller, Post, Patch, Param, Request, UseGuards } from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { AuthGuard } from "../auth/auth.guard";
import { StartTradeDto } from "./dtos/start-trade.dto";
import { MarkAsPaidDto } from "./dtos/mark-as-paid.dto";
import { TransferDto } from "./dtos/transfer.dto";

@UseGuards(AuthGuard)
@Controller("transactions")
export class TransactionsController {
    constructor(private transactionsService: TransactionsService) {}

    @Post("trade")
    startTrade(@Body() dto: StartTradeDto) {
        return this.transactionsService.startTrade(dto);
    }

    @Patch(":id/paid")
    markAsPaid(@Param("id") id: string, @Request() req, @Body() dto: MarkAsPaidDto) {
        return this.transactionsService.markAsPaid(id, req.user, dto);
    }

    @Patch(":id/complete")
    completeTrade(@Param("id") id: string, @Request() req) {
        return this.transactionsService.completeTrade(id, req.user);
    }

    @Patch(":id/cancel")
    cancelTrade(@Param("id") id: string, @Request() req) {
        return this.transactionsService.cancelTrade(id, req.user);
    }

    @Post("transfer")
    transfer(@Request() req, @Body() dto: TransferDto) {
        return this.transactionsService.transfer(req.user, dto);
    }
}
