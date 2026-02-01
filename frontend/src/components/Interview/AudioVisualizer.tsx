import { motion } from 'framer-motion';

type Props = {
  isListening: boolean;
  isSpeaking: boolean;
};

const AudioVisualizer = ({ isListening, isSpeaking }: Props) => {
  return (
    <div className="flex items-center justify-center gap-1 h-16">
      {isListening && (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 bg-blue-500 rounded-full"
              animate={{
                height: [10, 30, 10],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      )}
      {isSpeaking && (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 bg-green-500 rounded-full"
              animate={{
                height: [10, 40, 10],
              }}
              transition={{
                duration: 0.4,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      )}
      {!isListening && !isSpeaking && (
        <div className="text-gray-400 font-medium">Waiting to start...</div>
      )}
    </div>
  );
};

export default AudioVisualizer;
