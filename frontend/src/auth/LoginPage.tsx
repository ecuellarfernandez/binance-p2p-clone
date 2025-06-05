import { useState } from "react";
import { useAuthActions } from "./useAuthActions";
import { useNavigate } from "react-router-dom";
import { useMessage } from "../core/messages/MessageContext";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [showRegister, setShowRegister] = useState(false);
    const { login, register, loading } = useAuthActions();
    const navigate = useNavigate();
    const { setMessage } = useMessage();

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const success = await login(email, password);
            if (success) {
                setMessage({ text: "Inicio de sesión exitoso.", type: "success" });
                navigate("/wallets");
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            setMessage({ text: error.message, type: "error" }); // Muestra el mensaje de error del backend
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const success = await register(email, password, fullName);
            if (success) {
                setMessage({ text: "Usuario registrado exitosamente. Ahora puedes iniciar sesión.", type: "success" });
                setShowRegister(false);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            setMessage({ text: error.message, type: "error" }); // Muestra el mensaje de error del backend
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-center text-yellow-500 mb-6">Binancecito</h1>
                {showRegister ? (
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Nombre Completo
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                placeholder="Tu nombre completo"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-2 px-4 text-white font-bold rounded-md ${loading ? "bg-yellow-400 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-600"}`}
                        >
                            {loading ? "Registrando..." : "Registrarse"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-2 px-4 text-white font-bold rounded-md ${loading ? "bg-yellow-400 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-600"}`}
                        >
                            {loading ? "Ingresando..." : "Iniciar Sesión"}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    {showRegister ? (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            ¿Ya tienes una cuenta?{" "}
                            <button onClick={() => setShowRegister(false)} className="text-yellow-500 hover:underline text-sm font-medium">
                                Iniciar Sesión
                            </button>
                        </p>
                    ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            ¿No tienes una cuenta?{" "}
                            <button onClick={() => setShowRegister(true)} className="text-yellow-500 hover:underline text-sm font-medium">
                                Registrarse
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
