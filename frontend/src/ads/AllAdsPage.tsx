import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useAllAds } from "./useAllAds";

export default function AllAdsPage() {
    const { token } = useAuth();
    const { ads, loading, error } = useAllAds(token);
    const navigate = useNavigate();

    if (loading)
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-yellow-500 text-lg font-semibold">Cargando anuncios...</div>
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
            <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Todos los Anuncios</h2>
                {ads.length === 0 ? (
                    <div className="text-center text-gray-600 dark:text-gray-400">No hay anuncios disponibles.</div>
                ) : (
                    <ul className="space-y-4">
                        {ads.map(ad => (
                            <li key={ad.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                                <div>
                                    <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                        {ad.type === "buy" ? "Compra" : "Venta"} - {ad.coin.name}
                                    </span>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Precio: ${ad.price} - Cantidad: {ad.amount}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Usuario: {ad.user.fullName}</p>
                                </div>
                                <button
                                    onClick={() => navigate(`/trade/${ad.coin.id}`, { state: { type: ad.type } })}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                                >
                                    Ver Detalles
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
