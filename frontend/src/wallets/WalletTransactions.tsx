import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../http/api";
import { useAuth } from "../auth/AuthContext";

type Transaction = {
    id: string;
    type: string;
    amount: number;
    description: string;
    createdAt: string;
};

export default function WalletTransactions() {
    const { id } = useParams<{ id: string }>();
    const { token } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id || !token) return;

        setLoading(true);
        apiFetch(`/wallets/${id}/transactions`, { token })
            .then(setTransactions)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [id, token]);

    if (loading)
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-yellow-500 text-lg font-semibold">Cargando movimientos...</div>
            </div>
        );

    if (error)
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-red-500 text-lg font-semibold">Error: {error}</div>
            </div>
        );

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-8">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Movimientos de la Billetera</h2>
                {transactions.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">No hay movimientos registrados.</p>
                ) : (
                    <ul className="space-y-4">
                        {transactions.map(tx => (
                            <li key={tx.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">Tipo: {tx.type}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Monto: {tx.amount}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Descripción: {tx.description}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Fecha: {new Date(tx.createdAt).toLocaleString()}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
