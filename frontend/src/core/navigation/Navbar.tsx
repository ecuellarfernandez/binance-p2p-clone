import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export default function Navbar() {
    const { token, user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="text-2xl font-bold text-yellow-500">
                                Binancecito
                            </Link>
                        </div>
                        {token && (
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link to="/wallets" className="text-gray-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-500 font-medium">
                                    Billeteras
                                </Link>
                                <Link to="/coins" className="text-gray-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-500 font-medium">
                                    Coins
                                </Link>
                                <Link to="/my-ads" className="text-gray-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-500 font-medium">
                                    Mis anuncios
                                </Link>
                                <Link to="/transfer" className="text-gray-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-500 font-medium">
                                    Transferir
                                </Link>
                                {user?.role === "admin" && (
                                    <Link to="/admin" className="text-gray-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-500 font-medium">
                                        Administración
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center">
                        {token && (
                            <div>
                                <button onClick={handleLogout} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md">
                                    Cerrar Sesión
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
