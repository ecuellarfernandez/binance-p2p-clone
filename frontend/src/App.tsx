import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

export default function App() {
    return (
        <MessageProvider>
            <AuthProvider>
                <Router>
                    <MessageDisplay />
                    <Routes>
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
                        ></Route>
                    </Routes>
                </Router>
            </AuthProvider>
        </MessageProvider>
    );
}
