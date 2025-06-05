import { useWallets } from "./useWallets";

export default function WalletsPage() {
    const { wallets, loading, error } = useWallets();

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

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-8">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Mis Billeteras</h2>
                {wallets.length === 0 ? (
                    <div className="text-center text-gray-600 dark:text-gray-400">No tienes billeteras.</div>
                ) : (
                    <ul className="space-y-4">
                        {wallets.map(wallet => (
                            <li key={wallet.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                                <div>
                                    <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                        {wallet.coin.name} ({wallet.coin.symbol})
                                    </span>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Saldo: {wallet.balance}</p>
                                </div>
                                <div className="text-yellow-500 font-bold">${wallet.coin.valueInUsd.toFixed(2)}</div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
