import { useMessage } from "./MessageContext";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheckCircle, FiXCircle, FiInfo } from "react-icons/fi";

export default function MessageDisplay() {
    const { message } = useMessage();

    if (!message) return null;

    const messageStyles = {
        success: "bg-green-500 text-white border-green-600",
        error: "bg-red-500 text-white border-red-600",
        info: "bg-blue-500 text-white border-blue-600",
    };

    const icons = {
        success: <FiCheckCircle className="text-2xl mr-2" />,
        error: <FiXCircle className="text-2xl mr-2" />,
        info: <FiInfo className="text-2xl mr-2" />,
    };

    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-2xl border-2 flex items-center gap-2 min-w-[280px] max-w-[90vw] text-base font-medium ${messageStyles[message.type]}`}
                >
                    {icons[message.type]}
                    <span>{message.text}</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
