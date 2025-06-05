import { useEffect, useState } from "react";
import { apiFetch } from "../http/api";
import { useAuth } from "../auth/AuthContext";

export type Coin = { id: string; name: string; symbol: string; valueInUsd: number };

export function useCoins() {
    const { token } = useAuth(); // Obtener el token desde el contexto de autenticación
    const [coins, setCoins] = useState<Coin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setError("No se encontró un token de autenticación.");
            setLoading(false);
            return;
        }

        setLoading(true);
        apiFetch("/coins", { token })
            .then(setCoins)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [token]);

    return { coins, loading, error };
}
