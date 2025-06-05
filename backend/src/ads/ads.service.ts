import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import { Ad, AdType } from "./entity/ad.entity";
import { CreateAdDto } from "./dtos/create-ad.dto";
import { User } from "src/users/user.model";
import { Coin } from "src/coins/entity/coin.entity";
import { SelectAdDto } from "./dtos/select-ad.dto";
import { Wallet } from "src/wallets/entity/wallet.entity";
import { TransactionsService } from "src/transactions/transactions.service";

@Injectable()
export class AdsService {
    constructor(
        @InjectRepository(Ad)
        private adsRepository: Repository<Ad>,
        @InjectRepository(Coin)
        private coinsRepository: Repository<Coin>,
        @InjectRepository(Wallet)
        private walletsRepository: Repository<Wallet>,
        @Inject(forwardRef(() => TransactionsService))
        private transactionsService: TransactionsService,
    ) {}

    async create(user: User, dto: CreateAdDto, paymentInstructionsImage?: string) {
        try {
            const coin = await this.coinsRepository.findOne({ where: { id: dto.coinId } });
            if (!coin) throw new Error("Coin not found");
            const ad = this.adsRepository.create({
                ...dto,
                user,
                coin,
                paymentInstructionsImage,
            });
            return await this.adsRepository.save(ad);
        } catch (error) {
            throw new Error(`Error creating ad: ${error.message}`);
        }
    }

    async list(coinId: string, type: AdType, userId: string) {
        return this.adsRepository.find({
            where: {
                coin: { id: coinId },
                type: type,
                active: true,
                user: { id: Not(userId) },
            },
            order: { createdAt: "DESC" },
        });
    }

    async selectAd(user: User, dto: SelectAdDto) {
        const ad = await this.adsRepository.findOne({ where: { id: dto.adId, active: true }, relations: ["user", "coin"] });
        if (!ad) throw new Error("Ad not found or inactive");
        if (dto.amount > ad.amount) throw new Error("Amount exceeds ad availability");
        if (ad.user.id === user.id) throw new Error("Cannot trade with your own ad");

        // Verificar o crear la billetera del usuario que inicia la transacción
        let userWallet = await this.walletsRepository.findOne({ where: { user: { id: user.id }, coin: { id: ad.coin.id } } });
        if (!userWallet) {
            // Crear billetera automáticamente si no existe
            userWallet = this.walletsRepository.create({
                user,
                coin: ad.coin,
                balance: 0, // Inicializar con saldo 0
            });
            userWallet = await this.walletsRepository.save(userWallet);
        }

        // Determinar roles según tipo de anuncio
        let buyerWalletId: string, sellerWalletId: string;
        if (ad.type === AdType.SELL) {
            buyerWalletId = userWallet.id;
            const sellerWallet = await this.walletsRepository.findOne({ where: { user: { id: ad.user.id }, coin: { id: ad.coin.id } } });
            if (!sellerWallet) throw new Error("Ad owner does not have a wallet for this coin");
            sellerWalletId = sellerWallet.id;
        } else {
            const buyerWallet = await this.walletsRepository.findOne({ where: { user: { id: ad.user.id }, coin: { id: ad.coin.id } } });
            if (!buyerWallet) throw new Error("Ad owner does not have a wallet for this coin");
            buyerWalletId = buyerWallet.id;
            sellerWalletId = userWallet.id;
        }

        // Iniciar la transacción P2P
        const transaction = await this.transactionsService.startTrade({
            buyerWalletId,
            sellerWalletId,
            amount: dto.amount,
            description: ad.description,
            buyerUserId: user.id,
            coinId: ad.coin.id,
        });

        // Actualizar el monto disponible en el anuncio
        ad.amount -= dto.amount;
        if (ad.amount <= 0) ad.active = false;
        await this.adsRepository.save(ad);

        return transaction;
    }
}
