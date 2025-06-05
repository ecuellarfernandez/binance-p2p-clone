/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useMessage } from "../core/messages/MessageContext";
import { apiFetch } from "../http/api";
import { useWallets } from "../wallets/useWallets";

export default function TransferPage() {
    const { token } = useAuth();
    const { wallets, loading: walletsLoading } = useWallets();
    const { setMessage } = useMessage();
    const navigate = useNavigate();

    const [fromWalletId, setFromWalletId] = useState("");
    const [toWalletId, setToWalletId] = useState("");
    const [amount, setAmount] = useState<number>(0);
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [estimatedAmount, setEstimatedAmount] = useState<number | null>(null);

    // Set the first wallet as default when wallets load
    useEffect(() => {
        if (wallets.length > 0 && !fromWalletId) {
            setFromWalletId(wallets[0].id);
        }
    }, [wallets]);

    const fromWallet = wallets.find(w => w.id === fromWalletId);
    const toWallet = wallets.find(w => w.id === toWalletId);

    const handleFromWalletChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFromWalletId(e.target.value);
        // Reset estimated amount when source wallet changes
        setEstimatedAmount(null);
    };

    const handleToWalletChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setToWalletId(e.target.value);
        // Reset estimated amount when destination wallet changes
        setEstimatedAmount(null);
    };

    const calculateEstimatedAmount = () => {
        if (!fromWallet || !toWallet || amount <= 0) {
            setEstimatedAmount(null);
            return;
        }

        // Mismo tipo de moneda
        if (fromWallet.coin.id === toWallet.coin.id) {
            setEstimatedAmount(amount);
            return;
        }

        // Conversión entre monedas diferentes
        const fromValueInUsd = fromWallet.coin.valueInUsd;
        const toValueInUsd = toWallet.coin.valueInUsd;
        const converted = amount * (fromValueInUsd / toValueInUsd);
        setEstimatedAmount(converted);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newAmount = Number(e.target.value);
        setAmount(newAmount >= 0 ? newAmount : 0);
        // Reset estimated amount calculation
        setEstimatedAmount(null);
    };

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (!fromWalletId || !toWalletId) {
                setMessage({ text: "Por favor, selecciona las billeteras de origen y destino", type: "error" });
                return;
            }

            if (amount <= 0) {
                setMessage({ text: "El monto debe ser mayor a 0", type: "error" });
                return;
            }

            if (fromWallet && amount > fromWallet.balance) {
                setMessage({ text: "No tienes suficiente saldo para realizar esta transferencia", type: "error" });
                return;
            }

            setLoading(true);
            await apiFetch("/transactions/transfer", {
                method: "POST",
                token,
                body: {
                    fromWalletId,
                    toWalletId,
                    amount,
                    description: description || "Transferencia entre billeteras",
                },
            });

            setMessage({ text: "Transferencia realizada exitosamente", type: "success" });
            navigate("/wallets");
        } catch (error: any) {
            setMessage({ text: error.message || "Error al realizar la transferencia", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    if (walletsLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-yellow-500 text-lg">Cargando billeteras...</p>
            </div>
        );
    }

    if (wallets.length === 0) {
        return (
            <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-8">
                <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">No tienes billeteras disponibles</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Necesitas tener al menos una billetera para realizar transferencias.</p>
                        <button onClick={() => navigate("/coins")} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md">
                            Crear Billetera
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-8">
            <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Transferir Fondos</h2>

                <form onSubmit={handleTransfer} className="space-y-4">
                    <div>
                        <label htmlFor="fromWallet" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Desde Billetera
                        </label>
                        <select
                            id="fromWallet"
                            value={fromWalletId}
                            onChange={handleFromWalletChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">Seleccionar billetera de origen</option>
                            {wallets.map(wallet => (
                                <option key={wallet.id} value={wallet.id}>
                                    {wallet.coin.name} - Balance: {wallet.balance} {wallet.coin.symbol}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="toWallet" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            A Billetera
                        </label>
                        <select
                            id="toWallet"
                            value={toWalletId}
                            onChange={handleToWalletChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">Seleccionar billetera de destino</option>
                            {wallets.map(wallet => (
                                <option key={wallet.id} value={wallet.id} disabled={wallet.id === fromWalletId}>
                                    {wallet.coin.name} - Balance: {wallet.balance} {wallet.coin.symbol}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Cantidad
                        </label>
                        <input
                            id="amount"
                            type="number"
                            min="0"
                            step="0.00000001"
                            value={amount}
                            onChange={handleAmountChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        {fromWallet && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Disponible: {fromWallet.balance} {fromWallet.coin.symbol}
                            </p>
                        )}
                    </div>

                    {fromWalletId && toWalletId && amount > 0 && (
                        <div>
                            <button type="button" onClick={calculateEstimatedAmount} className="text-yellow-500 underline text-sm font-medium">
                                Calcular monto estimado
                            </button>

                            {estimatedAmount !== null && toWallet && (
                                <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Recibirá aproximadamente: {estimatedAmount.toFixed(8)} {toWallet.coin.symbol}
                                </p>
                            )}
                        </div>
                    )}

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Descripción (opcional)
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-between pt-4">
                        <button type="button" onClick={() => navigate("/wallets")} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                        >
                            {loading ? "Procesando..." : "Transferir"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
