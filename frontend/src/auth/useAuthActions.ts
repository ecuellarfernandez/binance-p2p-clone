import { useState } from "react";
import { useAuth } from "./AuthContext";
import { apiFetch } from "../http/api";

export function useAuthActions() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setAuth } = useAuth();

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiFetch("/auth/login", {
                method: "POST",
                body: { email, password },
            });
            setAuth(data.access_token, data.user);
            return true;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            const errorMessage = e.message || "Error al iniciar sesión";
            setError(errorMessage);
            throw new Error(errorMessage); // Lanza el error para manejarlo en el componente
        } finally {
            setLoading(false);
        }
    };

    const register = async (email: string, password: string, fullName: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiFetch("/auth/register", {
                method: "POST",
                body: { email, password, fullName },
            });
            if (data.result === "User created successfully") {
                return true;
            } else {
                throw new Error("Error inesperado al registrarse");
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            const errorMessage = e.message || "Error al registrarse";
            setError(errorMessage);
            throw new Error(errorMessage); // Lanza el error para manejarlo en el componente
        } finally {
            setLoading(false);
        }
    };

    return { login, register, loading, error };
}
