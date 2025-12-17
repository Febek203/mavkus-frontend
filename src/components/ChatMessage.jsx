//ChatMessage
import React from 'react';
import { motion } from 'framer-motion';

const ChatMessage = ({ message, isUser }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[80%] rounded-2xl p-4 ${
          isUser
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none'
            : message.role === 'error'
            ? 'bg-red-100 text-red-800 border border-red-200'
            : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 rounded-bl-none shadow-sm'
        }`}
      >
        <div className="whitespace-pre-wrap leading-relaxed">
          {message.content}
        </div>
        
        {message.metadata && message.metadata.gemini_used && (
          <div className="mt-2 text-xs opacity-70 flex items-center gap-1">
            <span className="text-yellow-500">🔬</span>
            Con supporto Gemini
          </div>
        )}
        
        {message.timestamp && (
          <div className="mt-2 text-xs opacity-50">
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;