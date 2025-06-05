import { useNavigate } from "react-router-dom";
import { useWallets } from "./useWallets";

export default function WalletsPage() {
    const { wallets, loading, error } = useWallets();
    const navigate = useNavigate();

    if (loading)
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-yellow-500 text-lg font-semibold">Cargando billeteras...</div>
            </div>
        );

    if (error)
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-red-500 text-lg font-semibold">Error: {error}</div>
            </div>
        );

    if (wallets.length === 0) {
        navigate("/coins");
        return null;
    }

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-8">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Mis Billeteras</h2>
                <ul className="space-y-4">
                    {wallets.map(wallet => (
                        <li key={wallet.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                            <div>
                                <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                    {wallet.coin.name} ({wallet.coin.symbol})
                                </span>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Saldo: {wallet.balance}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Valor en USD: ${wallet.coin.valueInUsd.toFixed(2)}</p>
                            </div>
                            <button
                                onClick={() => navigate(`/trade/${wallet.coin.id}`, { state: { type: "buy" } })}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                            >
                                Comprar/Vender
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
