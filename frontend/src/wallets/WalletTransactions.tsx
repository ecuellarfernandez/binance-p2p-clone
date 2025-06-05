import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
    const navigate = useNavigate();
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
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Movimientos de la Billetera</h2>
                    <button onClick={() => navigate("/wallets")} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md">
                        Regresar
                    </button>
                </div>
                {transactions.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">No hay movimientos registrados.</p>
                ) : (
                    <ul className="space-y-4">
                        {transactions.map(tx => (
                            <li key={tx.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                                <div className="flex justify-between items-center">
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                            tx.type === "buy" ? "bg-green-100 text-green-800" : tx.type === "sell" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"
                                        }`}
                                    >
                                        {tx.type === "buy" ? "Compra" : tx.type === "sell" ? "Venta" : "Transferencia"}
                                    </span>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(tx.createdAt).toLocaleString()}</p>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    Monto: <span className="font-medium">${tx.amount.toLocaleString("es-ES", { minimumFractionDigits: 2 })}</span>
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Descripción: <span className="font-medium">{tx.description}</span>
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
