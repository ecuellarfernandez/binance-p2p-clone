import { IsEnum, IsString, IsNumber, IsOptional } from "class-validator";
import { Type } from "class-transformer";
import { AdType } from "../entity/ad.entity";

export class CreateAdDto {
    @IsEnum(AdType)
    type: AdType;

    @IsString()
    coinId: string;

    @Type(() => Number) // Convierte el valor a número
    @IsNumber()
    price: number;

    @Type(() => Number) // Convierte el valor a número
    @IsNumber()
    amount: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    paymentInstructionsText?: string;
}
