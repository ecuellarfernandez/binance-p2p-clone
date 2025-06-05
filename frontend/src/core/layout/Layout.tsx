import Navbar from "../navigation/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <Navbar />
            <main style={{ padding: "1rem" }}>{children}</main>
        </div>
    );
}
