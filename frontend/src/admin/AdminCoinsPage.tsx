/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useMessage } from "../core/messages/MessageContext";
import { apiFetch } from "../http/api";

type Coin = {
    id: string;
    name: string;
    symbol: string;
    valueInUsd: number;
};

export default function AdminCoinsPage() {
    const { token, user } = useAuth() as { token: string; user: any };
    const { setMessage } = useMessage();
    const navigate = useNavigate();
    const [coins, setCoins] = useState<Coin[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        symbol: "",
        valueInUsd: 0,
    });

    useEffect(() => {
        // Verificar si el usuario tiene permisos de administrador
        if (!user?.role || user.role !== "admin") {
            setMessage({ text: "No tienes permisos de administrador", type: "error" });
            navigate("/wallets");
            return;
        }

        fetchCoins();
    }, [token, user, navigate]);

    const fetchCoins = async () => {
        try {
            setLoading(true);
            const response = await apiFetch("/coins", { token });
            setCoins(response);
        } catch (error: any) {
            setMessage({ text: error.message || "Error al cargar monedas", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await apiFetch(`/coins/${formData.id}`, {
                    method: "PUT",
                    body: formData,
                    token,
                });
                setMessage({ text: "Moneda actualizada correctamente", type: "success" });
            } else {
                await apiFetch("/coins", {
                    method: "POST",
                    body: formData,
                    token,
                });
                setMessage({ text: "Moneda creada correctamente", type: "success" });
            }

            // Actualizar la lista de monedas
            fetchCoins();
            // Resetear el formulario
            resetForm();
        } catch (error: any) {
            setMessage({ text: error.message || "Error al guardar la moneda", type: "error" });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar esta moneda?")) return;

        try {
            await apiFetch(`/coins/${id}`, {
                method: "DELETE",
                token,
            });
            setMessage({ text: "Moneda eliminada correctamente", type: "success" });
            // Actualizar la lista de monedas
            fetchCoins();
        } catch (error: any) {
            setMessage({ text: error.message || "Error al eliminar la moneda", type: "error" });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === "valueInUsd" ? parseFloat(value) : value,
        });
    };

    const resetForm = () => {
        setFormData({
            id: "",
            name: "",
            symbol: "",
            valueInUsd: 0,
        });
        setIsEditing(false);
        setShowForm(false);
    };

    const handleAddNew = () => {
        resetForm();
        setShowForm(true);
    };

    const handleEditCoin = (coin: Coin) => {
        setFormData({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            valueInUsd: coin.valueInUsd,
        });
        setIsEditing(true);
        setShowForm(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-yellow-500 text-lg">Cargando monedas...</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-8">
            <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Gestión de Monedas</h2>
                    <div className="flex space-x-2">
                        <button onClick={() => navigate("/admin")} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md">
                            Volver
                        </button>
                        <button onClick={handleAddNew} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md">
                            Agregar Moneda
                        </button>
                    </div>
                </div>

                {showForm && (
                    <div className="mb-8 bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">{isEditing ? "Editar" : "Agregar"} Moneda</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Símbolo
                                    </label>
                                    <input
                                        type="text"
                                        id="symbol"
                                        name="symbol"
                                        value={formData.symbol}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="valueInUsd" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Valor en USD
                                    </label>
                                    <input
                                        type="number"
                                        id="valueInUsd"
                                        name="valueInUsd"
                                        value={formData.valueInUsd}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
                                    {isEditing ? "Actualizar" : "Crear"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-gray-800 border dark:border-gray-700">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700">
                                <th className="py-2 px-4 border-b text-left">Nombre</th>
                                <th className="py-2 px-4 border-b text-left">Símbolo</th>
                                <th className="py-2 px-4 border-b text-left">Valor en USD</th>
                                <th className="py-2 px-4 border-b text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coins.map(coin => (
                                <tr key={coin.id} className="border-b dark:border-gray-700">
                                    <td className="py-2 px-4">{coin.name}</td>
                                    <td className="py-2 px-4">{coin.symbol}</td>
                                    <td className="py-2 px-4">${coin.valueInUsd.toFixed(2)}</td>
                                    <td className="py-2 px-4 text-center">
                                        <div className="flex justify-center space-x-2">
                                            <button
                                                onClick={() => handleEditCoin(coin)}
                                                className="px-3 py-1 rounded-md text-white text-sm bg-blue-500 hover:bg-blue-600"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(coin.id)}
                                                className="px-3 py-1 rounded-md text-white text-sm bg-red-500 hover:bg-red-600"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}