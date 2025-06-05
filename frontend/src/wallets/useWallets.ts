import { useEffect, useState } from "react";
import { apiFetch } from "../http/api";
import { useAuth } from "../auth/AuthContext"; // Importa el contexto de autenticación

type Coin = {
    id: string;
    name: string;
    symbol: string;
    valueInUsd: number;
};

type Wallet = {
    id: string;
    balance: number;
    coin: Coin;
};

export function useWallets() {
    const { token } = useAuth();
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setError("No se encontró un token de autenticación.");
            setLoading(false);
            return;
        }

        setLoading(true);
        apiFetch("/wallets", { token })
            .then(setWallets)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [token]);

    return { wallets, loading, error };
}
