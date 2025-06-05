import { useMessage } from "./MessageContext";

export default function MessageDisplay() {
    const { message } = useMessage();

    if (!message) return null;

    const messageStyles = {
        success: "bg-green-500 text-white",
        error: "bg-red-500 text-white",
        info: "bg-blue-500 text-white",
    };

    return <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow-lg ${messageStyles[message.type]}`}>{message.text}</div>;
}
