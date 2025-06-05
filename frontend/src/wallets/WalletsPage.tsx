import { useWallets } from "./useWallets";

export default function WalletsPage() {
    const { wallets, loading, error } = useWallets();

    if (loading) return <div>Cargando billeteras...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Mis Billeteras</h2>
            <ul>
                {wallets.map(wallet => (
                    <li key={wallet.id}>
                        {wallet.coin.name} ({wallet.coin.symbol}) - Saldo: {wallet.balance}
                    </li>
                ))}
            </ul>
        </div>
    );
}
