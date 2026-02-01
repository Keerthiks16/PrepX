import { Mic, MicOff, Play, Square } from 'lucide-react';

type Props = {
  isActive: boolean;
  isListening: boolean;
  onStart: () => void;
  onEnd: () => void;
  onToggleMic: () => void;
};

const Controls = ({ isActive, isListening, onStart, onEnd, onToggleMic }: Props) => {
  return (
    <div className="flex gap-4 mt-8">
      {!isActive ? (
        <button
          onClick={onStart}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold shadow-lg transition-all"
        >
          <Play size={20} />
          Start Interview
        </button>
      ) : (
        <>
          <button
            onClick={onToggleMic}
            className={`p-4 rounded-full shadow-md transition-all ${
              isListening ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isListening ? <Mic size={24} /> : <MicOff size={24} />}
          </button>
          <button
            onClick={onEnd}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold shadow-lg transition-all"
          >
            <Square size={20} />
            End Session
          </button>
        </>
      )}
    </div>
  );
};

export default Controls;
