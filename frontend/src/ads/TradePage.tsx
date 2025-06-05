/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLocation, useParams } from "react-router-dom";
import { useWallets } from "../wallets/useWallets";
import { useAuth } from "../auth/AuthContext";
import { useMessage } from "../core/messages/MessageContext";
import { useAds } from "./useAds";
import { useState } from "react";

export default function TradePage() {
    const { coinId } = useParams<{ coinId: string }>();
    const location = useLocation();
    const { token, user } = useAuth();
    const { setMessage } = useMessage();

    const type = location.state?.type || "sell";
    const { ads, loading, error, createAd } = useAds(coinId!, type === "buy" ? "sell" : "buy", token);
    const { wallets } = useWallets();

    const [amount, setAmount] = useState<number>(0);
    const [price, setPrice] = useState<number>(0);
    const [description, setDescription] = useState("");
    const [paymentProofFiles, setPaymentProofFiles] = useState<{ [key: string]: File | null }>({});

    const handleFileChange = (adId: string, file: File) => {
        setPaymentProofFiles(prev => ({ ...prev, [adId]: file }));
    };

    // Obtener la billetera asociada a la moneda seleccionada
    const wallet = wallets.find(w => w.coin.id === coinId);
    const coinName = wallet?.coin.name || "Moneda desconocida";
    const coinBalance = wallet?.balance || 0; // Saldo de la moneda

    const handleCreateAd = async () => {
        try {
            if (!user) {
                setMessage({ text: "Usuario no autenticado.", type: "error" });
                return;
            }

            if (amount <= 0 || price <= 0) {
                setMessage({ text: "La cantidad y el precio deben ser mayores a 0.", type: "error" });
                return;
            }

            if (!wallet) {
                setMessage({ text: "No tienes una billetera para esta moneda.", type: "error" });
                return;
            }

            if (type === "sell" && wallet.balance < amount) {
                setMessage({ text: "No tienes suficiente saldo para crear este anuncio de venta.", type: "error" });
                return;
            }

            await createAd(wallet.id, type, amount, price, description, coinId!);
            setMessage({ text: "Anuncio creado exitosamente.", type: "success" });
        } catch (error: any) {
            setMessage({ text: error.message || "Error al crear el anuncio.", type: "error" });
        }
    };

    const handleSendPaymentProof = async (adId: string, file: File) => {
        try {
            const formData = new FormData();
            formData.append("paymentProof", file);

            console.log("Enviando comprobante para adId:", adId);
            console.log("Archivo a enviar:", file);

            const response = await fetch(`http://localhost:3000/transactions/${adId}/mark-as-paid`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    // No incluir Content-Type aquí, FormData lo establece automáticamente con el boundary
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error desconocido");
            }

            setMessage({ text: "Comprobante de pago enviado exitosamente.", type: "success" });
        } catch (error: any) {
            setMessage({ text: error.message || "Error al enviar el comprobante de pago.", type: "error" });
        }
    };

    if (!coinId) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-red-500 text-lg font-semibold">Error: No se ha seleccionado una moneda.</div>
            </div>
        );
    }

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
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">{type === "buy" ? "Comprar Moneda" : "Vender Moneda"}</h2>
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Anuncios Disponibles</h3>
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
                                            Precio: ${ad.price} - Cantidad Disponible: {ad.amount}
                                        </p>
                                    </div>
                                    <div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    handleFileChange(ad.id, file);
                                                    setMessage({ text: "Archivo seleccionado correctamente.", type: "info" });
                                                } else {
                                                    setMessage({ text: "Por favor, selecciona un archivo válido.", type: "error" });
                                                }
                                            }}
                                            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <button
                                            onClick={() => {
                                                if (!paymentProofFiles[ad.id]) {
                                                    setMessage({ text: "Por favor, selecciona un archivo antes de enviar.", type: "error" });
                                                    return;
                                                }
                                                handleSendPaymentProof(ad.id, paymentProofFiles[ad.id]!);
                                            }}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md mt-2"
                                        >
                                            Enviar Comprobante
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Crear Anuncio de {type === "buy" ? "Compra" : "Venta"} para {coinName}
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Cantidad
                            </label>
                            <input
                                id="amount"
                                type="number"
                                placeholder="Cantidad"
                                value={amount}
                                onChange={e => {
                                    const value = type === "sell" ? Math.min(Number(e.target.value), coinBalance) : Number(e.target.value);
                                    setAmount(value >= 0 ? value : 0);
                                }}
                                max={type === "sell" ? coinBalance : undefined}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                            />
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {type === "sell" ? `Saldo disponible: ${coinBalance}` : "Sin límite de cantidad para compra"}
                            </p>
                        </div>
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Precio
                            </label>
                            <input
                                id="price"
                                type="number"
                                placeholder="Precio"
                                value={price}
                                onChange={e => setPrice(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Descripción
                            </label>
                            <textarea
                                id="description"
                                placeholder="Descripción"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                            />
                        </div>
                        <button onClick={handleCreateAd} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md">
                            Crear Anuncio
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
