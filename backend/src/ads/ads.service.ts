import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Transaction } from "typeorm";
import { Ad, AdType } from "./entity/ad.entity";
import { CreateAdDto } from "./dtos/create-ad.dto";
import { User } from "src/users/user.model";
import { Coin } from "src/coins/entity/coin.entity";
import { SelectAdDto } from "./dtos/select-ad.dto";
import { Wallet } from "src/wallets/entity/wallet.entity";

@Injectable()
export class AdsService {
    constructor(
        @InjectRepository(Ad)
        private adsRepository: Repository<Ad>,
        @InjectRepository(Coin)
        private coinsRepository: Repository<Coin>,
        @InjectRepository(Wallet)
        private walletsRepository: Repository<Wallet>,
        @InjectRepository(Transaction)
        private transactionsRepository: Repository<Transaction>,
    ) {}

    async create(user: User, dto: CreateAdDto, paymentInstructionsImage?: string) {
        const coin = await this.coinsRepository.findOne({ where: { id: dto.coinId } });
        if (!coin) throw new Error("Coin not found");
        const ad = this.adsRepository.create({
            ...dto,
            user,
            coin,
            paymentInstructionsImage,
        });
        return this.adsRepository.save(ad);
    }

    async list(coinId: string, type: AdType) {
        return this.adsRepository.find({
            where: { coin: { id: coinId }, type, active: true },
            order: { createdAt: "DESC" },
        });
    }

    async selectAd(user: User, dto: SelectAdDto) {
        const ad = await this.adsRepository.findOne({ where: { id: dto.adId, active: true }, relations: ["user", "coin"] });
        if (!ad) throw new Error("Ad not found or inactive");
        if (dto.amount > ad.amount) throw new Error("Amount exceeds ad availability");
        if (ad.user.id === user.id) throw new Error("Cannot trade with your own ad");

        // Wallet del usuario que inicia la operación
        const userWallet = await this.walletsRepository.findOne({ where: { id: dto.walletId, user: { id: user.id }, coin: { id: ad.coin.id } } });
        if (!userWallet) throw new Error("You must have a wallet for this coin");

        // Determinar roles según tipo de anuncio
        let buyerWalletId: string, sellerWalletId: string;
        if (ad.type === AdType.SELL) {
            buyerWalletId = userWallet.id;
            const sellerWallet = ad.user.wallets.find(w => w.coin.id === ad.coin.id);
            if (!sellerWallet) throw new Error("Ad owner does not have a wallet for this coin");
            sellerWalletId = sellerWallet.id;
        } else {
            const buyerWallet = ad.user.wallets.find(w => w.coin.id === ad.coin.id);
            if (!buyerWallet) throw new Error("Ad owner does not have a wallet for this coin");
            buyerWalletId = buyerWallet.id;
            sellerWalletId = userWallet.id;
        }
        if (!buyerWalletId || !sellerWalletId) throw new Error("Ad owner does not have a wallet for this coin");

        // Iniciar la transacción P2P
        const transaction = await this.transactionsRepository.startTrade({
            buyerWalletId,
            sellerWalletId,
            amount: dto.amount,
            description: ad.description,
        });

        // Actualizar el monto disponible en el anuncio
        ad.amount -= dto.amount;
        if (ad.amount <= 0) ad.active = false;
        await this.adsRepository.save(ad);

        return transaction;
    }
}
