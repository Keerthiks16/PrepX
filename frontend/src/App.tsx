import { useState } from 'react';
import InterviewSession from './components/Interview/InterviewSession';
import InterviewSetup from './components/Interview/InterviewSetup';
import FeedbackReport from './components/Interview/FeedbackReport';
import type { InterviewConfig } from './components/Interview/InterviewSetup';

const App = () => {
  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [feedbackData, setFeedbackData] = useState<any>(null); // New State for Feedback

  const handleStartInterview = (newConfig: InterviewConfig) => {
    setConfig(newConfig);
    setFeedbackData(null);
  };

  const handleEndSession = (data: any) => {
    setFeedbackData(data);
    setConfig(null);
  };

  const handleRestart = () => {
    setFeedbackData(null);
    setConfig(null);
  }

  return (
    <>
      {!config && !feedbackData ? (
        <InterviewSetup onStart={handleStartInterview} />
      ) : feedbackData ? (
        <FeedbackReport data={feedbackData} onRestart={handleRestart} /> // Show Report
      ) : (
        <InterviewSession config={config!} onEndSession={handleEndSession} />
      )}
    </>
  );
};

export default App;