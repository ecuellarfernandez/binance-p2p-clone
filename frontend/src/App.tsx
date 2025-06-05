import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./auth/LoginPage";
import WalletsPage from "./wallets/WalletsPage";
import { AuthProvider } from "./auth/AuthContext";
import Layout from "./core/layout/Layout";
import MessageDisplay from "./core/messages/MessageDisplay";
import { MessageProvider } from "./core/messages/MessageContext";

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
                                <Layout>
                                    <WalletsPage />
                                </Layout>
                            }
                        />
                        {/* Agrega más rutas aquí */}
                    </Routes>
                </Router>
            </AuthProvider>
        </MessageProvider>
    );
}
