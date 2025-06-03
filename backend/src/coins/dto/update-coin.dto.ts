import { IsOptional, IsString, IsNumber, Min } from "class-validator";

export class UpdateCoinDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    valueInUsd?: number;
}
