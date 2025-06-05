/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../http/api";
import { useMessage } from "../core/messages/MessageContext";

type Ad = {
    id: string;
    type: string;
    coin: { name: string };
    price: number;
    amount: number;
    transactionId: string;
    paymentProof?: string;
};

export default function MyAdsPage() {
    const { token, user } = useAuth();
    const { setMessage } = useMessage();
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentProofFiles, setPaymentProofFiles] = useState<{ [key: string]: File | null }>({});

    useEffect(() => {
        const fetchMyAds = async () => {
            try {
                const response = await apiFetch("/ads/my-ads", { token });
                setAds(response);
            } catch (e: any) {
                setError(e.message || "Error al cargar tus anuncios");
            } finally {
                setLoading(false);
            }
        };

        fetchMyAds();
    }, [token]);

    const fetchPaymentProof = async (transactionId: string) => {
        try {
            const response = await apiFetch(`/transactions/${transactionId}/payment-proof`, { token });
            return response.paymentProof;
        } catch (error: any) {
            setMessage({ text: error.message || "Error al obtener el comprobante de pago.", type: "error" });
            return null;
        }
    };

    const handleViewPaymentProof = async (transactionId: string) => {
        const proof = await fetchPaymentProof(transactionId);
        if (proof) {
            setMessage({ text: `Comprobante de pago: ${proof}`, type: "info" });
        }
    };

    const handleAcceptPaymentProof = async (transactionId: string) => {
        try {
            await apiFetch(`/transactions/${transactionId}/finalize`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMessage({ text: "Transacción finalizada exitosamente.", type: "success" });
        } catch (error: any) {
            setMessage({ text: error.message || "Error al finalizar la transacción.", type: "error" });
        }
    };

    const handleFileChange = (transactionId: string, file: File) => {
        setPaymentProofFiles(prev => ({ ...prev, [transactionId]: file }));
    };

    const handleSendPaymentProof = async (adId: string, file: File) => {
        try {
            const formData = new FormData();
            formData.append("paymentProof", file);

            const response = await fetch(`http://localhost:3000/transactions/${adId}/mark-as-paid`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
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
    if (loading) return <div>Cargando tus anuncios...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-8">
            <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Mis Anuncios</h2>
                {ads.length === 0 ? (
                    <div className="text-center text-gray-600 dark:text-gray-400">No has creado ningún anuncio.</div>
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
                                </div>
                                <div className="flex space-x-2">
                                    {ad.type === "sell" ? (
                                        ad.paymentProof ? (
                                            <>
                                                <button
                                                    onClick={() => handleViewPaymentProof(ad.transactionId)}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                                                >
                                                    Ver Comprobante
                                                </button>
                                                <button
                                                    onClick={() => handleAcceptPaymentProof(ad.transactionId)}
                                                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md"
                                                >
                                                    Aceptar
                                                </button>
                                            </>
                                        ) : (
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Esperando comprobante de pago...</p>
                                        )
                                    ) : (
                                        <>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleFileChange(ad.transactionId, file);
                                                }}
                                                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                            <button
                                                onClick={() =>
                                                    paymentProofFiles[ad.transactionId] && handleSendPaymentProof(ad.transactionId, paymentProofFiles[ad.transactionId]!)
                                                }
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md mt-2"
                                            >
                                                Enviar Comprobante
                                            </button>
                                        </>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
