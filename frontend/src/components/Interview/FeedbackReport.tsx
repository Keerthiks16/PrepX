import { ArrowRight, CheckCircle, XCircle, BookOpen, Award } from 'lucide-react';

interface FeedbackData {
  rating: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
}

interface FeedbackReportProps {
  data: FeedbackData;
  onRestart: () => void;
  onCoaching?: () => void;
}

const FeedbackReport = ({ data, onRestart, onCoaching }: FeedbackReportProps) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 80) return 'text-success';
    if (rating >= 60) return 'text-warning';
    return 'text-error';
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 90) return 'Excellent';
    if (rating >= 80) return 'Very Good';
    if (rating >= 60) return 'Good';
    if (rating >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="w-full min-h-screen bg-base-900 text-text-primary p-6 flex justify-center animate-fade-in">
      <div className="w-full max-w-6xl space-y-8">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-300 to-accent-200 text-transparent bg-clip-text">
            Interview Analysis
          </h1>
          <p className="text-text-secondary">Here is how you performed in your session</p>
        </div>

        {/* Score Card */}
        <div className="bg-base-800 rounded-2xl p-8 border border-base-600 shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent-600 to-accent-200"></div>
             
             <div className="relative">
                <svg className="w-40 h-40 transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-base-700" />
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent"
                        strokeDasharray={440} strokeDashoffset={440 - (440 * data.rating) / 100}
                        className={getRatingColor(data.rating)}
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className={`text-4xl font-bold ${getRatingColor(data.rating)}`}>{data.rating}</span>
                    <span className="text-text-secondary text-sm block">/ 100</span>
                </div>
             </div>
             
             <h2 className={`mt-4 text-2xl font-bold ${getRatingColor(data.rating)}`}>{getRatingLabel(data.rating)}</h2>
             <p className="mt-4 text-center text-text-secondary max-w-2xl leading-relaxed">"{data.summary}"</p>
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-base-800 rounded-xl p-6 border border-accent-700/30">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-accent-200 mb-4">
                    <CheckCircle className="w-5 h-5" /> Key Strengths
                </h3>
                <ul className="space-y-3">
                    {data.strengths.map((point, i) => (
                        <li key={i} className="flex gap-3 text-text-primary">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0"></span>
                            {point}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="bg-base-800 rounded-xl p-6 border border-error/20">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-error mb-4">
                    <XCircle className="w-5 h-5" /> Areas for Improvement
                </h3>
                <ul className="space-y-3">
                    {data.weaknesses.map((point, i) => (
                        <li key={i} className="flex gap-3 text-text-primary">
                            <span className="w-1.5 h-1.5 rounded-full bg-error mt-2 shrink-0"></span>
                            {point}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="md:col-span-2 bg-base-800 rounded-xl p-6 border border-accent-500/20">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-accent-300 mb-4">
                    <BookOpen className="w-5 h-5" /> Recommended Learning
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    {data.improvements.map((point, i) => (
                        <div key={i} className="bg-base-900 p-3 rounded-lg border border-base-600/30 text-text-primary">{point}</div>
                    ))}
                </div>
            </div>
        </div>

        <div className="flex justify-center pt-8">
             <button onClick={onRestart}
                className="flex items-center gap-2 px-8 py-3 bg-accent hover:bg-accent-300 text-base-900 rounded-full font-semibold transition-all hover:scale-105 shadow-lg"
             >
                Start New Interview <ArrowRight className="w-4 h-4" />
             </button>
             {onCoaching && (
                <button onClick={onCoaching}
                    className="flex items-center gap-2 px-8 py-3 bg-accent-600 hover:bg-accent text-white rounded-full font-bold transition-all hover:scale-105 ml-4 shadow-lg"
                >
                    <Award className="w-5 h-5" /> Practice Project Pitch
                </button>
             )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackReport;
