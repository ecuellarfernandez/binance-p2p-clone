import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Transaction, TransactionType, TransactionStatus } from "./entity/transaction.entity";
import { Repository } from "typeorm";
import { Wallet } from "src/wallets/entity/wallet.entity";
import { User } from "src/users/user.model";
import { StartTradeDto } from "./dtos/start-trade.dto";
import { TransferDto } from "./dtos/transfer.dto";
import { Ad } from "src/ads/entity/ad.entity";

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transaction)
        private transactionsRepository: Repository<Transaction>,
        @InjectRepository(Wallet)
        private walletsRepository: Repository<Wallet>,
        @InjectRepository(Ad)
        private adsRepository: Repository<Ad>,
    ) {}

    // Iniciar compra/venta entre dos usuarios (P2P)
    async startTrade(dto: StartTradeDto) {
        let buyerWallet = await this.walletsRepository.findOne({ where: { id: dto.buyerWalletId }, relations: ["user", "coin"] });
        const sellerWallet = await this.walletsRepository.findOne({ where: { id: dto.sellerWalletId }, relations: ["user", "coin"] });

        if (!buyerWallet) {
            // Crear billetera automáticamente para el comprador si no existe
            const coin = await this.walletsRepository.findOne({ where: { id: dto.coinId } });
            if (!coin) throw new NotFoundException("Coin not found");
            buyerWallet = this.walletsRepository.create({
                user: { id: dto.buyerUserId } as User,
                coin,
                balance: 0,
            });
            buyerWallet = await this.walletsRepository.save(buyerWallet);
        }

        if (!sellerWallet) throw new NotFoundException("Seller wallet not found");
        if (sellerWallet.balance < dto.amount) throw new BadRequestException("Seller has insufficient funds");

        const transaction = this.transactionsRepository.create({
            wallet: buyerWallet,
            counterpartyWallet: sellerWallet,
            type: TransactionType.BUY,
            amount: dto.amount,
            description: dto.description,
            status: TransactionStatus.PENDING,
        });
        return this.transactionsRepository.save(transaction);
    }

    async markAsPaid(transactionId: string, user: User, paymentProofFilename: string) {
        const transaction = await this.transactionsRepository.findOne({
            where: { id: transactionId },
            relations: ["wallet", "counterpartyWallet"],
        });
        if (!transaction) throw new NotFoundException("Transaction not found");
        if (transaction.wallet.user.id !== user.id) throw new BadRequestException("Only the buyer can mark as paid");
        if (transaction.status !== TransactionStatus.PENDING) throw new BadRequestException("Transaction is not pending");

        transaction.status = TransactionStatus.PAID;
        transaction.paymentProof = paymentProofFilename;

        return this.transactionsRepository.save(transaction);
    }

    async createTransactionWithProof(adId: string, user: User, paymentProofFilename: string) {
        const ad = await this.adsRepository.findOne({
            where: { id: adId, active: true },
            relations: ["user", "user.wallets", "coin"],
        });
        if (!ad) throw new NotFoundException("Anuncio no encontrado o inactivo");

        const buyerWallet = await this.walletsRepository.findOne({
            where: { user: { id: user.id }, coin: { id: ad.coin.id } },
        });
        if (!buyerWallet) throw new BadRequestException("No tienes una billetera para esta moneda");

        const sellerWallet = ad.user.wallets.find(wallet => wallet.coin.id === ad.coin.id);
        if (!sellerWallet) throw new NotFoundException("El vendedor no tiene una billetera para esta moneda");
        if (!paymentProofFilename) {
            throw new BadRequestException("El nombre del archivo de comprobante de pago es obligatorio.");
        }

        const transaction = this.transactionsRepository.create({
            wallet: buyerWallet,
            counterpartyWallet: sellerWallet,
            type: TransactionType.BUY,
            amount: ad.amount,
            description: ad.description,
            status: TransactionStatus.PENDING,
            paymentProof: paymentProofFilename, // Asigna el nombre del archivo
        });

        console.log("Transacción creada con comprobante:", transaction); // Depuración adicional

        return await this.transactionsRepository.save(transaction);
    }

    // El vendedor finaliza la transacción (mueve fondos)
    async completeTrade(transactionId: string, user: User) {
        const transaction = await this.transactionsRepository.findOne({ where: { id: transactionId }, relations: ["wallet", "counterpartyWallet"] });
        if (!transaction) throw new NotFoundException("Transaction not found");
        if (transaction.counterpartyWallet.user.id !== user.id) throw new BadRequestException("Only the seller can complete");
        if (transaction.status !== TransactionStatus.PAID) throw new BadRequestException("Transaction not paid yet");

        const buyerWallet = transaction.wallet;
        const sellerWallet = transaction.counterpartyWallet;
        if (!buyerWallet || !sellerWallet) throw new NotFoundException("Wallets not found");
        if (sellerWallet.balance < transaction.amount) throw new BadRequestException("Seller has insufficient funds");

        sellerWallet.balance -= transaction.amount;
        buyerWallet.balance += transaction.amount;

        transaction.status = TransactionStatus.COMPLETED;
        await this.walletsRepository.save([sellerWallet, buyerWallet]);
        return this.transactionsRepository.save(transaction);
    }

    // El vendedor cancela la transacción (no mueve fondos)
    async cancelTrade(transactionId: string, user: User) {
        const transaction = await this.transactionsRepository.findOne({ where: { id: transactionId }, relations: ["counterpartyWallet"] });
        if (!transaction) throw new NotFoundException("Transaction not found");
        if (transaction.counterpartyWallet.user.id !== user.id) throw new BadRequestException("Only the seller can cancel");
        if (transaction.status === TransactionStatus.COMPLETED || transaction.status === TransactionStatus.CANCELLED)
            throw new BadRequestException("Transaction already finalized");
        transaction.status = TransactionStatus.CANCELLED;
        return this.transactionsRepository.save(transaction);
    }

    // Transferencia directa entre billeteras (con conversión)
    async transfer(user: User, dto: TransferDto) {
        if (dto.fromWalletId === dto.toWalletId) throw new BadRequestException("Cannot transfer to the same wallet");

        const fromWallet = await this.walletsRepository.findOne({ where: { id: dto.fromWalletId }, relations: ["user", "coin"] });
        const toWallet = await this.walletsRepository.findOne({ where: { id: dto.toWalletId }, relations: ["user", "coin"] });

        if (!fromWallet || !toWallet) throw new NotFoundException("Wallet not found");
        if (fromWallet.user.id !== user.id) throw new BadRequestException("You can only transfer from your own wallet");
        if (fromWallet.balance < dto.amount) throw new BadRequestException("Insufficient funds");

        let convertedAmount = dto.amount;
        if (fromWallet.coin.id !== toWallet.coin.id) {
            convertedAmount = dto.amount * (fromWallet.coin.valueInUsd / toWallet.coin.valueInUsd);
        }

        fromWallet.balance -= dto.amount;
        toWallet.balance += convertedAmount;

        const fromTx = this.transactionsRepository.create({
            wallet: fromWallet,
            counterpartyWallet: toWallet,
            type: TransactionType.TRANSFER,
            amount: -dto.amount,
            description: dto.description ?? `Transfer to wallet ${dto.toWalletId}`,
            status: TransactionStatus.COMPLETED,
        });
        const toTx = this.transactionsRepository.create({
            wallet: toWallet,
            counterpartyWallet: fromWallet,
            type: TransactionType.TRANSFER,
            amount: convertedAmount,
            description: dto.description ?? `Transfer from wallet ${dto.fromWalletId}`,
            status: TransactionStatus.COMPLETED,
        });

        await this.walletsRepository.save([fromWallet, toWallet]);
        await this.transactionsRepository.save([fromTx, toTx]);
        return { fromTx, toTx };
    }

    async getWalletTransactions(walletId: string, user: User) {
        const wallet = await this.walletsRepository.findOne({ where: { id: walletId }, relations: ["user"] });
        if (!wallet || wallet.user.id !== user.id) throw new Error("Unauthorized");
        return this.transactionsRepository.find({
            where: { wallet: { id: walletId } },
            order: { createdAt: "DESC" },
        });
    }

    async getTransactionById(transactionId: string) {
        const transaction = await this.transactionsRepository.findOne({
            where: { id: transactionId },
            relations: ["wallet", "counterpartyWallet"],
        });
        if (!transaction) throw new NotFoundException("Transaction not found");
        return transaction;
    }

    async getPaymentProof(transactionId: string, user: User) {
        const transaction = await this.transactionsRepository.findOne({
            where: { id: transactionId },
            relations: ["counterpartyWallet"],
        });
        if (!transaction) throw new NotFoundException("Transaction not found");
        if (transaction.counterpartyWallet.user.id !== user.id) {
            throw new ForbiddenException("You are not authorized to view this payment proof");
        }
        return { paymentProof: transaction.paymentProof };
    }

    async finalizeTransaction(transactionId: string, user: User) {
        const transaction = await this.transactionsRepository.findOne({
            where: { id: transactionId },
            relations: ["wallet", "counterpartyWallet"],
        });
        if (!transaction) throw new NotFoundException("Transaction not found");
        if (transaction.counterpartyWallet.user.id !== user.id) {
            throw new ForbiddenException("Only the seller can finalize this transaction");
        }
        if (transaction.status !== TransactionStatus.PAID) {
            throw new BadRequestException("Transaction must be in PAID status to finalize");
        }

        transaction.status = TransactionStatus.COMPLETED;
        return this.transactionsRepository.save(transaction);
    }
}
