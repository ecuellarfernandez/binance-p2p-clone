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

export function useAllAds(token: string) {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllAds = async () => {
            try {
                const response = await apiFetch(`/ads/all`, { token });
                setAds(response);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (e: any) {
                setError(e.message || "Error al obtener todos los anuncios");
            } finally {
                setLoading(false);
            }
        };

        fetchAllAds();
    }, [token]);

    return { ads, loading, error };
}
