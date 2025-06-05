import { useEffect, useState } from "react";
import { apiFetch } from "../http/api";

export type Ad = {
    id: string;
    user: { id: string; fullName: string };
    coin: { id: string; name: string; symbol: string };
    type: "buy" | "sell";
    price: number;
    amount: number;
    description?: string;
    paymentInstructionsImage?: string;
    paymentInstructionsText?: string;
    active: boolean;
    createdAt: string;
};

export function useAds(coinId: string, type: "buy" | "sell", token: string) {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!coinId) return;
        setLoading(true);
        apiFetch(`/ads?coinId=${coinId}&type=${type}`, { token })
            .then(setAds)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [coinId, type, token]);

    return { ads, loading, error };
}
