import { useEffect, useState } from "react";
import { apiFetch } from "../http/api";

export type Coin = { id: string; name: string; symbol: string; valueInUsd: number };

export function useCoins(token: string) {
    const [coins, setCoins] = useState<Coin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        apiFetch("/coins", { token })
            .then(setCoins)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [token]);

    return { coins, loading, error };
}
