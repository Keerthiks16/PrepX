import { useState } from 'react';
import InterviewSession from './components/Interview/InterviewSession';
import InterviewSetup from './components/Interview/InterviewSetup';
import type { InterviewConfig } from './components/Interview/InterviewSetup';

const App = () => {
  const [config, setConfig] = useState<InterviewConfig | null>(null);

  const handleStartInterview = (newConfig: InterviewConfig) => {
    setConfig(newConfig);
  };

  const handleEndSession = () => {
    setConfig(null);
  };

  return (
    <>
      {!config ? (
        <InterviewSetup onStart={handleStartInterview} />
      ) : (
        <InterviewSession config={config} onEndSession={handleEndSession} />
      )}
    </>
  );
};

export default App;