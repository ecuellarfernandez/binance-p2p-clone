import { IsString, IsNumber, Min } from "class-validator";

export class CreateCoinDto {
    @IsString()
    name: string;

    @IsNumber()
    @Min(0)
    valueInUsd: number;
}
