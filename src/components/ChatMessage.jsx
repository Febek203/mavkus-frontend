import { motion } from "framer-motion";

export default function ChatMessage({ role, content }) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 50 : -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`max-w-[80%] p-3 rounded-xl mb-2 ${
        isUser ? "bg-blue-500 text-white ml-auto" : "bg-gray-200 text-gray-900 mr-auto"
      }`}
    >
      {content}
    </motion.div>
  );
}
