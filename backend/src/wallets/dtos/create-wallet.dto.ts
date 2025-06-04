import { IsInt, IsString, Min } from "class-validator";

export class CreateWalletDto {
    @IsString()
    coinId: string;

    @IsInt()
    @Min(0)
    initialBalance: number;
}
