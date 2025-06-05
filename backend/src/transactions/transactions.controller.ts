import { Body, Controller, Post, Patch, Param, Request, UseGuards, Get, UseInterceptors, BadRequestException, UploadedFile } from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { AuthGuard } from "../auth/auth.guard";
import { StartTradeDto } from "./dtos/start-trade.dto";
import { TransferDto } from "./dtos/transfer.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
@UseGuards(AuthGuard)
@Controller("transactions")
export class TransactionsController {
    constructor(private transactionsService: TransactionsService) {}

    @Post("trade")
    startTrade(@Body() dto: StartTradeDto) {
        return this.transactionsService.startTrade(dto);
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
    @Get(":id/payment-proof")
    async getPaymentProof(@Param("id") transactionId: string, @Request() req) {
        const transaction = await this.transactionsService.getPaymentProof(transactionId, req.user);
        return { paymentProof: `/uploads/${transaction.paymentProof}` };
    }

    @Post(":adId/mark-as-paid")
    @UseInterceptors(
        FileInterceptor("paymentProof", {
            storage: diskStorage({
                destination: "./uploads",
                filename: (req, file, callback) => {
                    // Obtiene el adId de los parámetros de la ruta
                    const adId = req.params.adId;
                    // Crea un nombre de archivo único usando el adId y timestamp
                    const uniqueSuffix = Date.now();
                    const ext = extname(file.originalname);
                    const filename = `${adId}-${uniqueSuffix}${ext}`;
                    callback(null, filename);
                },
            }),
            fileFilter: (req, file, callback) => {
                // Acepta solo imágenes
                if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                    return callback(new BadRequestException("Solo se permiten archivos de imagen."), false);
                }
                callback(null, true);
            },
        }),
    )
    async markAsPaid(@Param("adId") adId: string, @UploadedFile() file: Express.Multer.File, @Request() req) {
        if (!file) throw new BadRequestException("El comprobante de pago es obligatorio.");

        console.log("Archivo recibido:", file);
        console.log("Nombre del archivo:", file.filename);
        console.log("Parámetro adId:", adId);

        const transaction = await this.transactionsService.createTransactionWithProof(adId, req.user, file.filename);
        return transaction;
    }
}
