import { createContext, useContext, useState, type ReactNode } from "react";

type Message = {
    text: string;
    type: "success" | "error" | "info";
};

type MessageContextType = {
    message: Message | null;
    setMessage: (message: Message) => void;
    clearMessage: () => void;
};

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: ReactNode }) {
    const [message, setMessageState] = useState<Message | null>(null);

    const setMessage = (message: Message) => {
        setMessageState(message);
        // Limpia el mensaje automáticamente después de 5 segundos
        setTimeout(() => setMessageState(null), 5000);
    };

    const clearMessage = () => setMessageState(null);

    return <MessageContext.Provider value={{ message, setMessage, clearMessage }}>{children}</MessageContext.Provider>;
}

export function useMessage() {
    const context = useContext(MessageContext);
    if (!context) {
        throw new Error("useMessage debe usarse dentro de un MessageProvider");
    }
    return context;
}
