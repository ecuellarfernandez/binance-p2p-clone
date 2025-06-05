import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./auth/LoginPage";
import WalletsPage from "./wallets/WalletsPage";
import TradePage from "./ads/TradePage";
import { AuthProvider } from "./auth/AuthContext";
import Layout from "./core/layout/Layout";
import MessageDisplay from "./core/messages/MessageDisplay";
import { MessageProvider } from "./core/messages/MessageContext";
import CoinsPage from "./coins/CoinsPage";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import WalletTransactions from "./wallets/WalletTransactions";
import MyAdsPage from "./ads/MyAdsPage";
import AdminPage from "./admin/AdminPage";
import AdminCoinsPage from "./admin/AdminCoinsPage";
import TransferPage from "./transfer/TransferPage";
import { useAuth } from "./auth/AuthContext";

// Componente para manejar la redirección en la ruta raíz
function RootRedirect() {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Navigate to="/wallets" replace /> : <Navigate to="/login" replace />;
}

export default function App() {
    return (
        <MessageProvider>
            <AuthProvider>
                <Router>
                    <MessageDisplay />
                    <Routes>
                        {/* Ruta raíz que redirige según el estado de autenticación */}
                        <Route path="/" element={<RootRedirect />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route
                            path="/wallets"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <WalletsPage />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/coins"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <CoinsPage />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/trade/:coinId"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <TradePage />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/wallets/:id/transactions"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <WalletTransactions />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/my-ads"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <MyAdsPage />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/transfer"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <TransferPage />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <AdminPage />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/coins"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <AdminCoinsPage />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />
                        {/* Ruta para manejar URLs no encontradas */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </MessageProvider>
    );
}
