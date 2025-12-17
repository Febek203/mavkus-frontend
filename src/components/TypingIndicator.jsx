// components/TypingIndicator.jsx
import React from 'react';
import { motion } from 'framer-motion';

const TypingIndicator = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100">
          <span className="text-blue-600">🤖</span>
        </div>
        
        <div className="max-w-[70%] ml-2">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 text-gray-800 rounded-2xl p-4">
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-2 h-2 bg-gray-400 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                className="w-2 h-2 bg-gray-400 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                className="w-2 h-2 bg-gray-400 rounded-full"
              />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1 px-2">
            MAVKUS sta scrivendo...
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;