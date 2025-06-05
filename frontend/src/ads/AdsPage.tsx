import { useState } from "react";
import { useCoins } from "../coins/useCoins";
import { useAds } from "./useAds";

export default function AdsPage({ token }: { token: string }) {
    const { coins, loading: loadingCoins } = useCoins(token);
    const [selectedCoin, setSelectedCoin] = useState<string>("");
    const [type, setType] = useState<"buy" | "sell">("sell");
    const { ads, loading: loadingAds } = useAds(selectedCoin, type, token);

    return (
        <div>
            <h2>Selecciona una moneda</h2>
            {loadingCoins ? (
                <div>Cargando monedas...</div>
            ) : (
                <select value={selectedCoin} onChange={e => setSelectedCoin(e.target.value)}>
                    <option value="">-- Selecciona --</option>
                    {coins.map(coin => (
                        <option key={coin.id} value={coin.id}>
                            {coin.name} ({coin.symbol})
                        </option>
                    ))}
                </select>
            )}
            <div>
                <button onClick={() => setType("sell")} disabled={type === "sell"}>
                    Ver anuncios de venta
                </button>
                <button onClick={() => setType("buy")} disabled={type === "buy"}>
                    Ver anuncios de compra
                </button>
            </div>
            <h3>Anuncios</h3>
            {loadingAds ? (
                <div>Cargando anuncios...</div>
            ) : (
                <ul>
                    {ads.map(ad => (
                        <li key={ad.id}>
                            {ad.type === "sell" ? "Vende" : "Compra"} {ad.amount} {ad.coin.symbol} a {ad.price} USD - {ad.description}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
