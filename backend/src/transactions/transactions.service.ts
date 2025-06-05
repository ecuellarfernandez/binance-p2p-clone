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
        return await this.walletsRepository.manager.transaction(async transactionalEntityManager => {
            // Buscar o crear billetera del comprador
            let buyerWallet = await transactionalEntityManager.findOne(Wallet, {
                where: { id: dto.buyerWalletId },
                relations: ["user", "coin"],
                lock: { mode: "pessimistic_write" },
            });

            // Buscar billetera del vendedor
            const sellerWallet = await transactionalEntityManager.findOne(Wallet, {
                where: { id: dto.sellerWalletId },
                relations: ["user", "coin"],
                lock: { mode: "pessimistic_write" },
            });

            if (!buyerWallet) {
                // Crear billetera automáticamente para el comprador si no existe
                const coin = await transactionalEntityManager.findOne(Wallet, { where: { id: dto.coinId } });
                if (!coin) throw new NotFoundException("Moneda no encontrada");

                buyerWallet = transactionalEntityManager.create(Wallet, {
                    user: { id: dto.buyerUserId } as User,
                    coin,
                    balance: 0,
                });
                buyerWallet = await transactionalEntityManager.save(Wallet, buyerWallet);
            }

            if (!sellerWallet) throw new NotFoundException("Billetera del vendedor no encontrada");
            if (sellerWallet.balance < dto.amount) throw new BadRequestException("El vendedor no tiene fondos suficientes");

            // Crear la transacción
            const transaction = transactionalEntityManager.create(Transaction, {
                wallet: buyerWallet,
                counterpartyWallet: sellerWallet,
                type: TransactionType.BUY,
                amount: dto.amount,
                description: dto.description || `Compra de ${dto.amount} ${buyerWallet.coin.symbol}`,
                status: TransactionStatus.PENDING,
            });

            return await transactionalEntityManager.save(Transaction, transaction);
        });
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
        // Primero verificamos si el anuncio existe sin bloqueo ni transacción
        const adCheck = await this.adsRepository.findOne({
            where: { id: adId, active: true },
            relations: ["user", "coin"],
        });

        if (!adCheck) throw new NotFoundException("Anuncio no encontrado o inactivo");

        return await this.transactionsRepository.manager.transaction(async transactionalEntityManager => {
            // Ahora que sabemos que el anuncio existe, podemos bloquearlo dentro de la transacción
            const lockedAd = await transactionalEntityManager.findOne(Ad, {
                where: { id: adId, active: true },
                relations: ["user", "coin"],
                lock: { mode: "pessimistic_write" },
            });

            if (!lockedAd) throw new NotFoundException("El anuncio ya no está disponible");

            // Cargar las billeteras del vendedor por separado
            const sellerWallets = await transactionalEntityManager.find(Wallet, {
                where: { user: { id: lockedAd.user.id } },
                relations: ["coin"],
            });

            // Verificar si ya existe una transacción pendiente para este anuncio
            const existingTransaction = await transactionalEntityManager.findOne(Transaction, {
                where: {
                    description: lockedAd.description,
                    status: TransactionStatus.PENDING,
                },
            });

            if (existingTransaction) {
                // Si ya existe una transacción pendiente, actualizar con el comprobante
                existingTransaction.paymentProof = paymentProofFilename;
                existingTransaction.status = TransactionStatus.PAID;
                return await transactionalEntityManager.save(Transaction, existingTransaction);
            }

            // Buscar o crear billetera del comprador
            let buyerWallet = await transactionalEntityManager.findOne(Wallet, {
                where: { user: { id: user.id }, coin: { id: lockedAd.coin.id } },
                relations: ["user", "coin"],
            });

            if (!buyerWallet) {
                // Crear billetera automáticamente para el comprador
                buyerWallet = transactionalEntityManager.create(Wallet, {
                    user: user,
                    coin: lockedAd.coin,
                    balance: 0,
                });
                buyerWallet = await transactionalEntityManager.save(Wallet, buyerWallet);
            }

            // Verificar billetera del vendedor
            const sellerWallet = sellerWallets.find(wallet => wallet.coin.id === lockedAd.coin.id);
            if (!sellerWallet) throw new NotFoundException("El vendedor no tiene una billetera para esta moneda");

            if (!paymentProofFilename) {
                throw new BadRequestException("El comprobante de pago es obligatorio");
            }

            // Crear la transacción con estado PAID directamente
            const transaction = transactionalEntityManager.create(Transaction, {
                wallet: buyerWallet,
                counterpartyWallet: sellerWallet,
                type: TransactionType.BUY,
                amount: lockedAd.amount,
                description: lockedAd.description || `Compra de ${lockedAd.amount} ${lockedAd.coin.symbol}`,
                status: TransactionStatus.PAID, // Directamente como PAID ya que se adjunta el comprobante
                paymentProof: paymentProofFilename,
            });

            // Actualizar el anuncio si es necesario
            lockedAd.amount -= transaction.amount;
            if (lockedAd.amount <= 0) {
                lockedAd.active = false;
            }
            await transactionalEntityManager.save(Ad, lockedAd);

            return await transactionalEntityManager.save(Transaction, transaction);
        });
    }

    // El vendedor finaliza la transacción (mueve fondos)
    async completeTrade(transactionId: string, user: User) {
        return await this.transactionsRepository.manager.transaction(async transactionalEntityManager => {
            // Buscar la transacción con bloqueo para evitar condiciones de carrera
            const transaction = await transactionalEntityManager.findOne(Transaction, {
                where: { id: transactionId },
                relations: ["wallet", "wallet.user", "counterpartyWallet", "counterpartyWallet.user", "wallet.coin"],
                lock: { mode: "pessimistic_write" },
            });

            if (!transaction) throw new NotFoundException("Transacción no encontrada");
            if (transaction.counterpartyWallet.user.id !== user.id) throw new ForbiddenException("Solo el vendedor puede completar la transacción");
            if (transaction.status !== TransactionStatus.PAID) throw new BadRequestException("La transacción aún no ha sido pagada");

            const buyerWallet = transaction.wallet;
            const sellerWallet = transaction.counterpartyWallet;

            if (!buyerWallet || !sellerWallet) throw new NotFoundException("Billeteras no encontradas");
            if (sellerWallet.balance < transaction.amount) throw new BadRequestException("El vendedor no tiene fondos suficientes");

            // Actualizar saldos
            sellerWallet.balance -= transaction.amount;
            buyerWallet.balance += transaction.amount;

            // Actualizar estado de la transacción
            transaction.status = TransactionStatus.COMPLETED;

            // Guardar cambios en una sola transacción
            await transactionalEntityManager.save([sellerWallet, buyerWallet]);
            return await transactionalEntityManager.save(transaction);
        });
    }

    // El vendedor cancela la transacción (no mueve fondos)
    async cancelTrade(transactionId: string, user: User) {
        return await this.transactionsRepository.manager.transaction(async transactionalEntityManager => {
            // Buscar la transacción con bloqueo para evitar condiciones de carrera
            const transaction = await transactionalEntityManager.findOne(Transaction, {
                where: { id: transactionId },
                relations: ["wallet", "wallet.user", "counterpartyWallet", "counterpartyWallet.user"],
                lock: { mode: "pessimistic_write" },
            });

            if (!transaction) throw new NotFoundException("Transacción no encontrada");

            // Verificar permisos: solo el vendedor puede cancelar
            if (transaction.counterpartyWallet.user.id !== user.id) {
                throw new ForbiddenException("Solo el vendedor puede cancelar la transacción");
            }

            // Verificar estado: no se puede cancelar una transacción ya finalizada
            if (transaction.status === TransactionStatus.COMPLETED || transaction.status === TransactionStatus.CANCELLED) {
                throw new BadRequestException("La transacción ya ha sido finalizada");
            }

            // Actualizar estado
            transaction.status = TransactionStatus.CANCELLED;

            // Guardar cambios
            return await transactionalEntityManager.save(Transaction, transaction);
        });
    }

    // Transferencia directa entre billeteras (con conversión)
    async transfer(user: User, dto: TransferDto) {
        return await this.transactionsRepository.manager.transaction(async transactionalEntityManager => {
            if (dto.fromWalletId === dto.toWalletId) {
                throw new BadRequestException("No puedes transferir a la misma billetera");
            }

            // Buscar billeteras con bloqueo para evitar condiciones de carrera
            const fromWallet = await transactionalEntityManager.findOne(Wallet, {
                where: { id: dto.fromWalletId },
                relations: ["user", "coin"],
                lock: { mode: "pessimistic_write" },
            });

            const toWallet = await transactionalEntityManager.findOne(Wallet, {
                where: { id: dto.toWalletId },
                relations: ["user", "coin"],
                lock: { mode: "pessimistic_write" },
            });

            // Validaciones
            if (!fromWallet || !toWallet) {
                throw new NotFoundException("Billetera no encontrada");
            }

            if (fromWallet.user.id !== user.id) {
                throw new ForbiddenException("Solo puedes transferir desde tu propia billetera");
            }

            if (fromWallet.balance < dto.amount) {
                throw new BadRequestException("Fondos insuficientes");
            }

            // Calcular conversión si las monedas son diferentes
            let convertedAmount = dto.amount;
            if (fromWallet.coin.id !== toWallet.coin.id) {
                if (!fromWallet.coin.valueInUsd || !toWallet.coin.valueInUsd || fromWallet.coin.valueInUsd <= 0 || toWallet.coin.valueInUsd <= 0) {
                    throw new BadRequestException("No se puede realizar la conversión entre estas monedas");
                }
                convertedAmount = dto.amount * (fromWallet.coin.valueInUsd / toWallet.coin.valueInUsd);
            }

            // Actualizar saldos
            fromWallet.balance -= dto.amount;
            toWallet.balance += convertedAmount;

            // Crear registros de transacción para ambas partes
            const fromTx = transactionalEntityManager.create(Transaction, {
                wallet: fromWallet,
                counterpartyWallet: toWallet,
                type: TransactionType.TRANSFER,
                amount: -dto.amount,
                description: dto.description ?? `Transferencia a billetera ${toWallet.id} (${toWallet.coin.symbol})`,
                status: TransactionStatus.COMPLETED,
            });

            const toTx = transactionalEntityManager.create(Transaction, {
                wallet: toWallet,
                counterpartyWallet: fromWallet,
                type: TransactionType.TRANSFER,
                amount: convertedAmount,
                description: dto.description ?? `Transferencia desde billetera ${fromWallet.id} (${fromWallet.coin.symbol})`,
                status: TransactionStatus.COMPLETED,
            });

            // Guardar todo en una sola transacción
            await transactionalEntityManager.save([fromWallet, toWallet]);
            await transactionalEntityManager.save([fromTx, toTx]);

            return { fromTx, toTx };
        });
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
