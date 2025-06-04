import { IsOptional, IsNumber } from "class-validator";

export class UpdateWalletDto {
    @IsOptional()
    @IsNumber()
    balance?: number;
}
