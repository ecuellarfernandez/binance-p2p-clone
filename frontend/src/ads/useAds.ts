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
        console.log("Ads fetched:", ads);
    }, [coinId, type, token]);

    const selectAd = async (walletId: string, adId: string, amount: number) => {
        try {
            const response = await apiFetch(`/ads/${adId}/select`, {
                method: "POST",
                token,
                body: { walletId, amount },
            });
            return response;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            throw new Error(e.message || "Error al seleccionar el anuncio");
        }
    };

    const createAd = async (walletId: string, adType: "buy" | "sell", amount: number, price: number, description: string, coinId: string) => {
        try {
            const response = await apiFetch(`/ads`, {
                method: "POST",
                token,
                body: { walletId, type: adType, amount, price, description, coinId },
            });
            return response;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            throw new Error(e.message || "Error al crear el anuncio");
        }
    };

    return { ads, loading, error, selectAd, createAd };
}
