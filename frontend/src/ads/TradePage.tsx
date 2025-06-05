/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useWallets } from "../wallets/useWallets";
import { useAuth } from "../auth/AuthContext";
import { useMessage } from "../core/messages/MessageContext";
import { useAds } from "./useAds";
import Modal from "../core/components/Modal";
import Button from "../core/components/Button";
import { FaMoneyBillWave, FaExchangeAlt, FaFileUpload, FaInfoCircle } from "react-icons/fa";

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
    const [paymentInstructionsText, setPaymentInstructionsText] = useState("");
    const [paymentInstructionsImage, setPaymentInstructionsImage] = useState<File | null>(null);
    const [paymentProofFiles, setPaymentProofFiles] = useState<{ [key: string]: File | null }>({});
    const [selectedAd, setSelectedAd] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<"instructions" | "proof" | "select" | null>("instructions");
    const [selectedAmount, setSelectedAmount] = useState<number>(0);

    const handleFileChange = (adId: string, file: File) => {
        setPaymentProofFiles(prev => ({ ...prev, [adId]: file }));
    };

    const handlePaymentInstructionsImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPaymentInstructionsImage(file);
        }
    };

    const handleViewInstructions = (ad: any) => {
        setSelectedAd(ad);
        setModalType("instructions");
        setShowModal(true);
    };

    const handleSelectAd = (ad: any) => {
        setSelectedAd(ad);
        setSelectedAmount(ad.amount > 0 ? ad.amount : 0);
        setModalType("select");
        setShowModal(true);
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

            // Validar instrucciones de pago para anuncios de venta
            if (type === "sell" && !paymentInstructionsText.trim()) {
                setMessage({ text: "Debes proporcionar instrucciones de pago para anuncios de venta.", type: "error" });
                return;
            }

            const formData = new FormData();
            formData.append("type", type);
            formData.append("coinId", coinId!);
            formData.append("price", price.toString());
            formData.append("amount", amount.toString());

            if (description) {
                formData.append("description", description);
            }

            if (paymentInstructionsText) {
                formData.append("paymentInstructionsText", paymentInstructionsText);
            }

            if (paymentInstructionsImage) {
                formData.append("paymentInstructionsImage", paymentInstructionsImage);
            }

            const response = await fetch(`http://localhost:3000/ads`, {
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

            setMessage({ text: "Anuncio creado exitosamente.", type: "success" });

            // Limpiar el formulario
            setAmount(0);
            setPrice(0);
            setDescription("");
            setPaymentInstructionsText("");
            setPaymentInstructionsImage(null);

            // Recargar los anuncios
            window.location.reload();
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
            setPaymentProofFiles(prev => ({ ...prev, [adId]: null }));
            closeModal();
            // Recargar la página después de un breve retraso
            setTimeout(() => window.location.reload(), 1500);
        } catch (error: any) {
            setMessage({ text: error.message || "Error al enviar el comprobante de pago.", type: "error" });
        }
    };

    const handleSelectAdSubmit = async () => {
        try {
            if (!selectedAd || !wallet) {
                setMessage({ text: "Información incompleta para seleccionar el anuncio.", type: "error" });
                return;
            }

            if (selectedAmount <= 0 || selectedAmount > selectedAd.amount) {
                setMessage({ text: `La cantidad debe ser mayor a 0 y no exceder ${selectedAd.amount}.`, type: "error" });
                return;
            }

            const response = await fetch(`http://localhost:3000/ads/${selectedAd.id}/select`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    walletId: wallet.id,
                    amount: selectedAmount,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error desconocido");
            }

            setMessage({ text: "Anuncio seleccionado exitosamente. Se ha creado una transacción.", type: "success" });
            closeModal();
            // Recargar la página después de un breve retraso
            setTimeout(() => window.location.reload(), 1500);
        } catch (error: any) {
            setMessage({ text: error.message || "Error al seleccionar el anuncio.", type: "error" });
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

    const closeModal = () => {
        setShowModal(false);
        setModalType(null);
        setSelectedAd(null);
        setSelectedAmount(0);
    };

    const handlePaymentProofModal = (ad: any) => {
        setSelectedAd(ad);
        setModalType("proof");
        setShowModal(true);
    };

    // Nota: Las funciones handleViewInstructions, handleSelectAd y handlePaymentInstructionsImageChange
    // ya están definidas anteriormente en el archivo

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
                                    <div className="flex flex-col space-y-2">
                                        <button
                                            onClick={() => handleViewInstructions(ad)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center"
                                        >
                                            <FaInfoCircle className="mr-2" /> Ver instrucciones
                                        </button>
                                        <button
                                            onClick={() => handleSelectAd(ad)}
                                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center"
                                        >
                                            <FaExchangeAlt className="mr-2" /> Seleccionar
                                        </button>
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
                                            onClick={() => handlePaymentProofModal(ad)}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center"
                                        >
                                            <FaFileUpload className="mr-2" /> Enviar Comprobante
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
                        {type === "sell" && (
                            <>
                                <div>
                                    <label htmlFor="paymentInstructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Instrucciones de pago
                                    </label>
                                    <textarea
                                        id="paymentInstructions"
                                        placeholder="Instrucciones de pago"
                                        value={paymentInstructionsText}
                                        onChange={e => setPaymentInstructionsText(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="paymentInstructionsImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Imagen de instrucciones de pago (opcional)
                                    </label>
                                    <input
                                        id="paymentInstructionsImage"
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePaymentInstructionsImageChange}
                                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                            </>
                        )}
                        <button onClick={handleCreateAd} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md flex items-center">
                            <FaMoneyBillWave className="mr-2" /> Crear Anuncio
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal para ver instrucciones de pago */}
            {showModal && modalType === "instructions" && selectedAd && (
                <Modal onClose={closeModal}>
                    <div className="p-4">
                        <h2 className="text-xl font-bold mb-4">Instrucciones de pago</h2>
                        {selectedAd.paymentInstructionsText && (
                            <div className="mb-4">
                                <h3 className="font-semibold mb-2">Instrucciones:</h3>
                                <p className="p-3 bg-gray-100 rounded">{selectedAd.paymentInstructionsText}</p>
                            </div>
                        )}
                        {selectedAd.paymentInstructionsImage && (
                            <div className="mb-4">
                                <h3 className="font-semibold mb-2">Imagen de instrucciones:</h3>
                                <img
                                    src={`http://localhost:3000/ads/${selectedAd.id}/payment-instructions-image`}
                                    alt="Instrucciones de pago"
                                    className="max-w-full h-auto border rounded"
                                />
                            </div>
                        )}
                        <div className="flex justify-end mt-4">
                            <Button onClick={closeModal}>Cerrar</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Modal para seleccionar cantidad */}
            {showModal && modalType === "select" && selectedAd && (
                <Modal onClose={closeModal}>
                    <div className="p-4">
                        <h2 className="text-xl font-bold mb-4">Seleccionar cantidad</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cantidad a {selectedAd.type === "buy" ? "vender" : "comprar"}</label>
                            <input
                                type="number"
                                value={selectedAmount}
                                onChange={e => setSelectedAmount(Number(e.target.value))}
                                max={selectedAd.amount}
                                min={0.000001}
                                step="0.000001"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                            />
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Máximo disponible: {selectedAd.amount} {coinName}
                            </p>
                        </div>
                        <div className="mb-4">
                            <p>
                                <strong>Precio por unidad:</strong> ${selectedAd.price} USD
                            </p>
                            <p>
                                <strong>Total a pagar:</strong> ${(selectedAmount * selectedAd.price).toFixed(2)} USD
                            </p>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="secondary" onClick={closeModal}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSelectAdSubmit}>Confirmar</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Modal para enviar comprobante */}
            {showModal && modalType === "proof" && selectedAd && (
                <Modal onClose={closeModal}>
                    <div className="p-4">
                        <h2 className="text-xl font-bold mb-4">Enviar comprobante de pago</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selecciona una imagen del comprobante</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        handleFileChange(selectedAd.id, file);
                                    }
                                }}
                                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="secondary" onClick={closeModal}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={() => {
                                    if (!paymentProofFiles[selectedAd.id]) {
                                        setMessage({ text: "Por favor, selecciona un archivo antes de enviar.", type: "error" });
                                        return;
                                    }
                                    handleSendPaymentProof(selectedAd.id, paymentProofFiles[selectedAd.id]!);
                                }}
                            >
                                Enviar comprobante
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
