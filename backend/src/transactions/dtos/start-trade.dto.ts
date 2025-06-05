import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class StartTradeDto {
    @IsString()
    @IsNotEmpty()
    buyerWalletId: string;

    @IsString()
    @IsNotEmpty()
    sellerWalletId: string;

    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsString()
    description?: string;

    @IsString()
    @IsNotEmpty()
    buyerUserId: string;

    @IsString()
    @IsNotEmpty()
    coinId: string;
}
