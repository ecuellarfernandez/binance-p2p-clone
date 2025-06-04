import { IsString, IsNumber } from "class-validator";

export class SelectAdDto {
    @IsString()
    adId: string;

    @IsString()
    walletId: string; // Wallet del usuario que inicia la operación

    @IsNumber()
    amount: number; // Monto a comprar/vender (debe ser <= ad.amount)
}
