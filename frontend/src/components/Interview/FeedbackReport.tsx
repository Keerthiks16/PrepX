import { ArrowRight, CheckCircle, XCircle, BookOpen, Clock, Award } from 'lucide-react';

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
}

const FeedbackReport = ({ data, onRestart }: FeedbackReportProps) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 80) return 'text-green-400';
    if (rating >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 90) return 'Excellent';
    if (rating >= 80) return 'Very Good';
    if (rating >= 60) return 'Good';
    if (rating >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="w-screen min-h-screen bg-gray-900 text-gray-100 p-6 flex justify-center animate-fade-in">
      <div className="max-w-4xl w-full space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Interview Analysis
          </h1>
          <p className="text-gray-400">Here is how you performed in your session</p>
        </div>

        {/* Score Card */}
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>
             
             <div className="relative">
                <svg className="w-40 h-40 transform -rotate-90">
                    <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="transparent"
                        className="text-gray-700"
                    />
                    <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={440}
                        strokeDashoffset={440 - (440 * data.rating) / 100}
                        className={getRatingColor(data.rating)}
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className={`text-4xl font-bold ${getRatingColor(data.rating)}`}>{data.rating}</span>
                    <span className="text-gray-500 text-sm block">/ 100</span>
                </div>
             </div>
             
             <h2 className={`mt-4 text-2xl font-bold ${getRatingColor(data.rating)}`}>
                 {getRatingLabel(data.rating)}
             </h2>
             <p className="mt-4 text-center text-gray-300 max-w-2xl leading-relaxed">
                 "{data.summary}"
             </p>
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6">
            
            {/* Strengths */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700/50">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-green-400 mb-4">
                    <CheckCircle className="w-5 h-5" />
                    Key Strengths
                </h3>
                <ul className="space-y-3">
                    {data.strengths.map((point, i) => (
                        <li key={i} className="flex gap-3 text-gray-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"></span>
                            {point}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700/50">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-red-400 mb-4">
                    <XCircle className="w-5 h-5" />
                    Areas for Improvement
                </h3>
                <ul className="space-y-3">
                    {data.weaknesses.map((point, i) => (
                        <li key={i} className="flex gap-3 text-gray-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0"></span>
                            {point}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Recommended Learning (Full Width) */}
            <div className="md:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700/50">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-blue-400 mb-4">
                    <BookOpen className="w-5 h-5" />
                    Recommended Learning
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    {data.improvements.map((point, i) => (
                        <div key={i} className="bg-gray-700/50 p-3 rounded-lg border border-gray-600/50 text-gray-300">
                            {point}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="flex justify-center pt-8">
             <button 
                onClick={onRestart}
                className="flex items-center gap-2 px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full font-semibold transition-all hover:scale-105"
             >
                Start New Interview
                <ArrowRight className="w-4 h-4" />
             </button>
        </div>

      </div>
    </div>
  );
};

export default FeedbackReport;
