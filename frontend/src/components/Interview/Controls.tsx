type Props = {
  isActive: boolean;
  isListening: boolean;
  onStart: () => void;
  onEnd: () => void;
  onToggleMic: () => void;
};

const Controls = ({ isActive, isListening, onStart, onEnd, onToggleMic }: Props) => {
  return (
    <div className="flex items-center gap-4 bg-base-800 p-4 rounded-2xl shadow-lg border border-base-600">
      {!isActive ? (
        <button
          onClick={onStart}
          className="px-6 py-3 bg-gradient-to-r from-accent-600 to-accent text-white rounded-xl font-bold transition-all shadow-md active:scale-95 hover:opacity-90"
        >
          Start Interview
        </button>
      ) : (
        <>
          <button
            onClick={onToggleMic}
            className={`p-4 rounded-full transition-all shadow-lg ${
              isListening
                ? 'bg-error animate-pulse ring-4 ring-error/30'
                : 'bg-base-900 hover:bg-base-700 border border-text-secondary/20'
            }`}
          >
           {isListening ? (
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
               <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
             </svg>
           ) : (
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
             </svg>
           )}
          </button>

          <button
            onClick={onEnd}
            className="px-4 py-2 bg-error/10 hover:bg-error/20 text-error border border-error/50 rounded-lg font-medium transition-colors"
          >
            End Session
          </button>
        </>
      )}
    </div>
  );
};

export default Controls;
