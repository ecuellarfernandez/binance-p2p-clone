import { useNavigate } from "react-router-dom";
import { useCoins } from "./useCoins";

export default function CoinsPage() {
    const { coins, loading, error } = useCoins();
    const navigate = useNavigate();

    if (loading)
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-yellow-500 text-lg font-semibold">Cargando monedas...</div>
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
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Selecciona una Moneda</h2>
                {coins.length === 0 ? (
                    <div className="text-center text-gray-600 dark:text-gray-400">No hay monedas disponibles.</div>
                ) : (
                    <ul className="space-y-4">
                        {coins.map(coin => (
                            <li key={coin.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                                <div>
                                    <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                        {coin.name} ({coin.symbol})
                                    </span>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Valor en USD: ${coin.valueInUsd.toFixed(2)}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => navigate(`/trade/${coin.id}`, { state: { type: "buy" } })}
                                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md"
                                    >
                                        Comprar
                                    </button>
                                    <button
                                        onClick={() => navigate(`/trade/${coin.id}`, { state: { type: "sell" } })}
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                                    >
                                        Vender
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
