import { IsOptional, IsString } from "class-validator";

export class MarkAsPaidDto {
    @IsOptional()
    @IsString()
    paymentProof?: string;

    @IsOptional()
    @IsString()
    paymentProofText?: string;
}
