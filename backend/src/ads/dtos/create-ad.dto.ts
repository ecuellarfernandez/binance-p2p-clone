import { IsEnum, IsString, IsNumber, IsOptional } from "class-validator";
import { AdType } from "../entity/ad.entity";

export class CreateAdDto {
    @IsEnum(AdType)
    type: AdType;

    @IsString()
    coinId: string;

    @IsNumber()
    price: number;

    @IsNumber()
    amount: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    paymentInstructionsText?: string;
}
