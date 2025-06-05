/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useMessage } from "../core/messages/MessageContext";
import { apiFetch } from "../http/api";

type User = {
    id: string;
    email: string;
    fullName: string;
    role: string;
};

export default function AdminPage() {
    const { token, user } = useAuth() as { token: string; user: User | null };
    const { setMessage } = useMessage();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar si el usuario tiene permisos de administrador
        if (!user?.role || user.role !== "admin") {
            setMessage({ text: "No tienes permisos de administrador", type: "error" });
            navigate("/wallets");
            return;
        }

        fetchUsers();
    }, [token, user, navigate]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await apiFetch("/users", { token });
            setUsers(response);
        } catch (error: any) {
            setMessage({ text: error.message || "Error al cargar usuarios", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const toggleAdminStatus = async (userId: string, currentRole: string) => {
        try {
            const newRole = currentRole === "admin" ? "user" : "admin";
            await apiFetch(`/users/${userId}/role`, {
                method: "PATCH",
                token,
                body: { role: newRole }
            });

            // Actualizar la lista de usuarios localmente
            setUsers(prevUsers => prevUsers.map(u => (u.id === userId ? { ...u, role: newRole } : u)));

            setMessage({
                text: `Usuario actualizado correctamente`,
                type: "success",
            });
        } catch (error: any) {
            setMessage({ text: error.message || "Error al actualizar usuario", type: "error" });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-yellow-500 text-lg">Cargando usuarios...</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-8">
            <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Panel de Administración</h2>
                    <button onClick={() => navigate("/admin/coins")} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md">
                        Gestionar Monedas
                    </button>
                </div>

                <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Gestión de Usuarios</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white dark:bg-gray-800 border dark:border-gray-700">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-gray-700">
                                    <th className="py-2 px-4 border-b text-left">Nombre</th>
                                    <th className="py-2 px-4 border-b text-left">Email</th>
                                    <th className="py-2 px-4 border-b text-left">Rol</th>
                                    <th className="py-2 px-4 border-b text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className="border-b dark:border-gray-700">
                                        <td className="py-2 px-4">{user.fullName}</td>
                                        <td className="py-2 px-4">{user.email}</td>
                                        <td className="py-2 px-4">
                                            {user.role === "admin" ? (
                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">Administrador</span>
                                            ) : (
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">Usuario</span>
                                            )}
                                        </td>
                                        <td className="py-2 px-4 text-center">
                                            <button
                                                onClick={() => toggleAdminStatus(user.id, user.role)}
                                                className={`px-3 py-1 rounded-md text-white text-sm ${
                                                    user.role === "admin" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                                                }`}
                                            >
                                                {user.role === "admin" ? "Quitar Admin" : "Hacer Admin"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
