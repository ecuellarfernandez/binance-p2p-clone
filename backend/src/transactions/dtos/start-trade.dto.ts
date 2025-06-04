import { IsString, IsNumber, IsOptional } from "class-validator";

export class StartTradeDto {
    @IsString()
    buyerWalletId: string;

    @IsString()
    sellerWalletId: string;

    @IsNumber()
    amount: number;

    @IsOptional()
    @IsString()
    description?: string;
}
