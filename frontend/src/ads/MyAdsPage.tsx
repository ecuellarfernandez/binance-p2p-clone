/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../http/api";
import { useMessage } from "../core/messages/MessageContext";
import Modal from "../core/layout/Modal";
import { Link, useNavigate } from "react-router-dom";

type Ad = {
    id: string;
    type: string;
    coin: { name: string; id: string };
    price: number;
    amount: number;
    transactionId: string;
    paymentProof?: string;
    status?: string; // PENDING, PAID, COMPLETED, CANCELLED
    description?: string;
    paymentInstructionsImage?: string;
    active: boolean;
};

export default function MyAdsPage() {
    const { token, user } = useAuth();
    const { setMessage } = useMessage();
    const navigate = useNavigate();
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentProofFiles, setPaymentProofFiles] = useState<{ [key: string]: File | null }>({});
    const [proofModal, setProofModal] = useState({
        isOpen: false,
        imageUrl: "",
        transactionId: "",
        description: "",
        isPaymentInstructions: false,
    });

    useEffect(() => {
        fetchMyAds();
    }, [token]);

    const fetchMyAds = async () => {
        try {
            setLoading(true);
            const response = await apiFetch("/ads/my-ads", { token });
            setAds(response);
        } catch (e: any) {
            setError(e.message || "Error al cargar tus anuncios");
        } finally {
            setLoading(false);
        }
    };

    const handleViewPaymentProof = async (transactionId: string) => {
        try {
            const response = await apiFetch(`/transactions/${transactionId}/payment-proof`, { token });
            setProofModal({
                isOpen: true,
                imageUrl: `http://localhost:3000${response.paymentProof}`,
                transactionId,
                description: "",
                isPaymentInstructions: false,
            });
        } catch (error: any) {
            setMessage({ text: error.message || "Error al obtener el comprobante de pago.", type: "error" });
        }
    };

    const handleViewPaymentInstructions = (ad: Ad) => {
        if (ad.paymentInstructionsImage) {
            setProofModal({
                isOpen: true,
                imageUrl: `http://localhost:3000${ad.paymentInstructionsImage}`,
                transactionId: "",
                description: ad.description || "",
                isPaymentInstructions: true,
            });
        } else if (ad.description) {
            setProofModal({
                isOpen: true,
                imageUrl: "",
                transactionId: "",
                description: ad.description,
                isPaymentInstructions: true,
            });
        }
    };

    const handleAcceptPaymentProof = async (transactionId: string) => {
        try {
            // Mostrar mensaje de "Procesando..."
            setMessage({ text: "Procesando la transacción...", type: "info" });

            await apiFetch(`/transactions/${transactionId}/complete`, {
                method: "PATCH",
                token,
            });

            setMessage({
                text: "¡Transacción completada exitosamente! Los fondos han sido transferidos.",
                type: "success",
            });
            setProofModal({ isOpen: false, imageUrl: "", transactionId: "", description: "", isPaymentInstructions: false });
            fetchMyAds();
        } catch (error: any) {
            setMessage({ text: error.message || "Error al finalizar la transacción.", type: "error" });
        }
    };

    const handleCancelPaymentProof = async (transactionId: string) => {
        try {
            // Mostrar mensaje de "Procesando..."
            setMessage({ text: "Procesando la cancelación...", type: "info" });

            await apiFetch(`/transactions/${transactionId}/cancel`, {
                method: "PATCH",
                token,
            });

            setMessage({ text: "Transacción cancelada correctamente.", type: "success" });
            setProofModal({ isOpen: false, imageUrl: "", transactionId: "", description: "", isPaymentInstructions: false });
            fetchMyAds();
        } catch (error: any) {
            setMessage({ text: error.message || "Error al cancelar la transacción.", type: "error" });
        }
    };

    const handleFileChange = (transactionId: string, file: File) => {
        setPaymentProofFiles(prev => ({ ...prev, [transactionId]: file }));
    };

    const handleSendPaymentProof = async (adId: string, file: File) => {
        try {
            const formData = new FormData();
            formData.append("paymentProof", file);

            // Mostrar mensaje de "Enviando..."
            setMessage({ text: "Enviando comprobante de pago...", type: "info" });

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

            // Limpiar el archivo seleccionado después de enviarlo
            setPaymentProofFiles(prev => ({ ...prev, [adId]: null }));

            fetchMyAds();
        } catch (error: any) {
            setMessage({ text: error.message || "Error al enviar el comprobante de pago.", type: "error" });
        }
    };

    const getStatusBadge = (ad: Ad) => {
        if (!ad.transactionId) {
            if (ad.active) {
                return <div className="mt-1 inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">Activo</div>;
            }
            return <div className="mt-1 inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800">Inactivo</div>;
        }

        let bgColor, textColor, statusText;

        switch (ad.status) {
            case "COMPLETED":
                bgColor = "bg-green-100";
                textColor = "text-green-800";
                statusText = "Completado";
                break;
            case "PAID":
                bgColor = "bg-yellow-100";
                textColor = "text-yellow-800";
                statusText = "Pago Recibido";
                break;
            case "CANCELLED":
                bgColor = "bg-red-100";
                textColor = "text-red-800";
                statusText = "Cancelado";
                break;
            default:
                bgColor = "bg-blue-100";
                textColor = "text-blue-800";
                statusText = "Pendiente";
        }

        return <div className={`mt-1 inline-block px-2 py-1 rounded text-xs font-semibold ${bgColor} ${textColor}`}>{statusText}</div>;
    };

    if (loading) return <div className="text-center p-8">Cargando tus anuncios...</div>;
    if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

    const activeAds = ads.filter(ad => !ad.transactionId && ad.active);
    const transactionAds = ads.filter(ad => ad.transactionId);

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-8">
            <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Mis Anuncios</h2>
                    <Link to="/coins" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md">
                        Crear nuevo anuncio
                    </Link>
                </div>

                {activeAds.length === 0 && transactionAds.length === 0 ? (
                    <div className="text-center text-gray-600 dark:text-gray-400">
                        <p>No has creado ningún anuncio.</p>
                        <button onClick={() => navigate("/coins")} className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md">
                            Crear tu primer anuncio
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Anuncios activos sin transacciones */}
                        {activeAds.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Anuncios Activos</h3>
                                <ul className="space-y-4">
                                    {activeAds.map(ad => (
                                        <li key={ad.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                                            <div>
                                                <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                                    {ad.type === "buy" ? "Compra" : "Venta"} - {ad.coin.name}
                                                </span>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Precio: ${ad.price} - Cantidad: {ad.amount}
                                                </p>
                                                {getStatusBadge(ad)}
                                            </div>
                                            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                                                <button
                                                    onClick={() => handleViewPaymentInstructions(ad)}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                                                >
                                                    Ver Instrucciones de Pago
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Anuncios con transacciones */}
                        {transactionAds.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Transacciones en Curso</h3>
                                <ul className="space-y-4">
                                    {transactionAds.map(ad => (
                                        <li key={ad.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                                            <div>
                                                <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                                    {ad.type === "buy" ? "Compra" : "Venta"} - {ad.coin.name}
                                                </span>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Precio: ${ad.price} - Cantidad: {ad.amount}
                                                </p>
                                                {getStatusBadge(ad)}
                                            </div>
                                            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                                                {ad.type === "sell" ? (
                                                    ad.status === "PAID" ? (
                                                        <div className="flex flex-col sm:flex-row gap-2">
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
                                                                Confirmar Pago
                                                            </button>
                                                            <button
                                                                onClick={() => handleCancelPaymentProof(ad.transactionId)}
                                                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md"
                                                            >
                                                                Rechazar
                                                            </button>
                                                        </div>
                                                    ) : ad.paymentProof ? (
                                                        <button
                                                            onClick={() => handleViewPaymentProof(ad.transactionId)}
                                                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                                                        >
                                                            Ver Comprobante
                                                        </button>
                                                    ) : ad.status === "COMPLETED" ? (
                                                        <span className="text-green-600 font-semibold">Transacción Completada</span>
                                                    ) : ad.status === "CANCELLED" ? (
                                                        <span className="text-red-600 font-semibold">Transacción Cancelada</span>
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">Esperando comprobante de pago...</p>
                                                            <button
                                                                onClick={() => handleViewPaymentInstructions(ad)}
                                                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                                                            >
                                                                Ver Instrucciones
                                                            </button>
                                                        </div>
                                                    )
                                                ) : // Para anuncios de COMPRA
                                                ad.status === "COMPLETED" ? (
                                                    <span className="text-green-600 font-semibold">Transacción Completada</span>
                                                ) : ad.status === "CANCELLED" ? (
                                                    <span className="text-red-600 font-semibold">Transacción Cancelada</span>
                                                ) : ad.status === "PAID" ? (
                                                    <span className="text-yellow-600 font-semibold">Comprobante Enviado - Esperando Confirmación</span>
                                                ) : (
                                                    <div className="flex flex-col space-y-2 w-full">
                                                        <button
                                                            onClick={() => handleViewPaymentInstructions(ad)}
                                                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                                                        >
                                                            Ver Instrucciones de Pago
                                                        </button>
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
                                                                paymentProofFiles[ad.transactionId] &&
                                                                handleSendPaymentProof(ad.transactionId, paymentProofFiles[ad.transactionId]!)
                                                            }
                                                            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md"
                                                            disabled={!paymentProofFiles[ad.transactionId]}
                                                        >
                                                            Enviar Comprobante
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal mejorado para mostrar comprobante o instrucciones */}
            <Modal
                isOpen={proofModal.isOpen}
                onClose={() => setProofModal({ isOpen: false, imageUrl: "", transactionId: "", description: "", isPaymentInstructions: false })}
                title={proofModal.isPaymentInstructions ? "Instrucciones de Pago" : "Comprobante de Pago"}
                footer={
                    proofModal.isPaymentInstructions ? (
                        <button
                            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md"
                            onClick={() => setProofModal({ isOpen: false, imageUrl: "", transactionId: "", description: "", isPaymentInstructions: false })}
                        >
                            Cerrar
                        </button>
                    ) : (
                        <>
                            <div className="w-full text-center mb-4 text-gray-700 dark:text-gray-300">
                                <p>Por favor verifique el comprobante de pago antes de confirmar.</p>
                                <p className="text-sm mt-1">Si el comprobante es válido, haga clic en "Aceptar y Finalizar" para completar la transacción.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-center gap-2">
                                <button
                                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md"
                                    onClick={() => handleAcceptPaymentProof(proofModal.transactionId)}
                                >
                                    Aceptar y Finalizar
                                </button>
                                <button
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md"
                                    onClick={() => handleCancelPaymentProof(proofModal.transactionId)}
                                >
                                    Rechazar y Cancelar
                                </button>
                                <button
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md"
                                    onClick={() => setProofModal({ isOpen: false, imageUrl: "", transactionId: "", description: "", isPaymentInstructions: false })}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </>
                    )
                }
            >
                <div className="flex flex-col items-center justify-center">
                    {proofModal.description && (
                        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg w-full">
                            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Descripción:</h4>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{proofModal.description}</p>
                        </div>
                    )}
                    {proofModal.imageUrl && (
                        <img
                            src={proofModal.imageUrl}
                            alt={proofModal.isPaymentInstructions ? "Instrucciones de pago" : "Comprobante de pago"}
                            className="max-h-96 object-contain"
                            onError={e => {
                                setMessage({
                                    text: "Error al cargar la imagen. La imagen podría no estar disponible.",
                                    type: "error",
                                });
                            }}
                        />
                    )}
                </div>
            </Modal>
        </div>
    );
}
