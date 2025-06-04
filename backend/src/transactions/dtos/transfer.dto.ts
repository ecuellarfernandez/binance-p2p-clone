import { IsString, IsNumber, IsOptional } from "class-validator";

export class TransferDto {
    @IsString()
    fromWalletId: string;

    @IsString()
    toWalletId: string;

    @IsNumber()
    amount: number;

    @IsOptional()
    @IsString()
    description?: string;
}
