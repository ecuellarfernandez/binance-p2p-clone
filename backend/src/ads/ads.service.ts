import { BadRequestException, forwardRef, Inject, Injectable } from "@nestjs/common";
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
            if (!coin) throw new BadRequestException("La moneda especificada no existe.");

            // Verificar si es un anuncio de venta
            if (dto.type === AdType.SELL) {
                const wallet = await this.walletsRepository.findOne({
                    where: { user: { id: user.id }, coin: { id: dto.coinId } },
                });

                if (!wallet) throw new BadRequestException("No tienes una billetera para esta moneda.");
                if (wallet.balance < dto.amount) {
                    throw new BadRequestException("Saldo insuficiente para crear un anuncio de venta.");
                }
            }

            const ad = this.adsRepository.create({
                ...dto,
                user,
                coin,
                paymentInstructionsImage,
            });
            return await this.adsRepository.save(ad);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error; // Re-lanzar errores de tipo BadRequestException
            }
            throw new Error(`Error creando el anuncio: ${error.message}`);
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
        // Usar transacción para garantizar la integridad de los datos
        return await this.adsRepository.manager.transaction(async transactionalEntityManager => {
            // Bloquear el anuncio para evitar selecciones simultáneas
            const ad = await transactionalEntityManager.findOne(Ad, {
                where: { id: dto.adId, active: true },
                relations: ["user", "coin"],
                lock: { mode: "pessimistic_write" },
            });

            if (!ad) throw new BadRequestException("Anuncio no encontrado o inactivo");
            if (dto.amount > ad.amount) throw new BadRequestException("La cantidad excede la disponibilidad del anuncio");
            if (ad.user.id === user.id) throw new BadRequestException("No puedes operar con tu propio anuncio");

            // Verificar o crear la billetera del usuario que inicia la transacción
            let userWallet = await transactionalEntityManager.findOne(Wallet, {
                where: { user: { id: user.id }, coin: { id: ad.coin.id } },
                relations: ["user", "coin"],
            });

            if (!userWallet) {
                // Crear billetera automáticamente si no existe
                userWallet = transactionalEntityManager.create(Wallet, {
                    user,
                    coin: ad.coin,
                    balance: 0, // Inicializar con saldo 0
                });
                userWallet = await transactionalEntityManager.save(userWallet);
            }

            // Determinar roles según tipo de anuncio
            let buyerWalletId: string, sellerWalletId: string, buyerUserId: string;
            if (ad.type === AdType.SELL) {
                buyerWalletId = userWallet.id;
                buyerUserId = user.id;
                const sellerWallet = await transactionalEntityManager.findOne(Wallet, {
                    where: { user: { id: ad.user.id }, coin: { id: ad.coin.id } },
                    relations: ["user", "coin"],
                });
                if (!sellerWallet) throw new BadRequestException("El propietario del anuncio no tiene una billetera para esta moneda");
                sellerWalletId = sellerWallet.id;
            } else {
                const buyerWallet = await transactionalEntityManager.findOne(Wallet, {
                    where: { user: { id: ad.user.id }, coin: { id: ad.coin.id } },
                    relations: ["user", "coin"],
                });
                if (!buyerWallet) throw new BadRequestException("El propietario del anuncio no tiene una billetera para esta moneda");
                buyerWalletId = buyerWallet.id;
                buyerUserId = ad.user.id;
                sellerWalletId = userWallet.id;
            }

            // Iniciar la transacción P2P
            const transaction = await this.transactionsService.startTrade({
                buyerWalletId,
                sellerWalletId,
                amount: dto.amount,
                description: ad.description,
                buyerUserId: buyerUserId,
                coinId: ad.coin.id,
            });

            // Actualizar el monto disponible en el anuncio
            ad.amount -= dto.amount;
            if (ad.amount <= 0) ad.active = false;
            await transactionalEntityManager.save(ad);

            return transaction;
        });
    }

    async getMyAds(userId: string) {
        return this.adsRepository.find({
            where: { user: { id: userId } },
            relations: ["coin"],
            order: { createdAt: "DESC" },
        });
    }
}
