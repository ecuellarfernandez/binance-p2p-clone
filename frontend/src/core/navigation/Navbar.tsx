import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export default function Navbar() {
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold text-yellow-500">Binancecito</h1>
                        <ul className="ml-10 flex items-center space-x-4">
                            <li>
                                <Link to="/wallets" className="text-gray-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-500 font-medium">
                                    Billeteras
                                </Link>
                            </li>
                            <li>
                                <Link to="/ads" className="text-gray-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-500 font-medium">
                                    Anuncios
                                </Link>
                            </li>
                        </ul>
                    </div>
                    {token && (
                        <div>
                            <button onClick={handleLogout} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md">
                                Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
