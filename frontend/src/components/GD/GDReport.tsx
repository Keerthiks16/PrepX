import { Star, AlertTriangle, MessageCircle, BarChart, User, RefreshCcw } from 'lucide-react';

interface GDReportProps {
    data: {
        rating: number;
        summary: string;
        speakerType: 'excellent' | 'neutral' | 'aggressive' | 'silent';
        speakerTypeDescription?: string;
        suggestions: string[];
        redFlags: string[];
    };
    onRestart: () => void;
}

const GDReport = ({ data, onRestart }: GDReportProps) => {
    const getSpeakerTypeColor = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'excellent': return 'text-accent border-accent/20 bg-accent/5';
            case 'neutral': return 'text-blue-400 border-blue-400/20 bg-blue-400/5';
            case 'aggressive': return 'text-error border-error/20 bg-error/5';
            case 'silent': return 'text-text-secondary border-base-600/20 bg-base-900/50';
            default: return 'text-text-primary border-base-600/20';
        }
    };

    return (
        <div className="w-full flex flex-col items-center justify-center min-h-screen bg-base-900 text-text-primary p-4">
            <div className="max-w-4xl w-full bg-base-800 rounded-2xl shadow-xl p-8 border border-base-600 my-8">
                <div className="flex flex-col items-center text-center mb-10">
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-accent-300 to-accent text-transparent bg-clip-text mb-2">
                        GD Performance Report
                    </h1>
                    <p className="text-text-secondary text-sm font-medium tracking-widest uppercase">Analysis completed by AI Evaluator</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                    {/* Score */}
                    <div className="flex flex-col items-center p-6 bg-base-900 rounded-2xl border border-base-600/50 shadow-inner">
                        <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="64" cy="64" r="60" fill="none" stroke="currentColor" strokeWidth="8" className="text-base-700" />
                                <circle cx="64" cy="64" r="60" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray={377} strokeDashoffset={377 - (377 * data.rating) / 100} className="text-accent transition-all duration-1000" />
                            </svg>
                            <span className="absolute text-3xl font-black text-white">{data.rating}%</span>
                        </div>
                        <span className="text-sm font-bold text-text-secondary uppercase">Overall Score</span>
                    </div>

                    {/* Speaker Type */}
                    <div className={`col-span-1 md:col-span-2 p-6 rounded-2xl border ${getSpeakerTypeColor(data.speakerType)} flex flex-col justify-center`}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-xl bg-base-800/50">
                                <User className="w-8 h-8" />
                            </div>
                            <div>
                                <span className="text-xs font-black uppercase opacity-60">Speaker Persona</span>
                                <h2 className="text-2xl font-black uppercase tracking-tight">{data.speakerType}</h2>
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed opacity-90">
                            {data.speakerTypeDescription || `You performed as a ${data.speakerType} participant during the discussion.`}
                        </p>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Summary */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <BarChart className="w-5 h-5 text-accent" />
                            <h3 className="text-lg font-bold">Executive Summary</h3>
                        </div>
                        <p className="text-text-secondary leading-relaxed bg-base-900/50 p-4 rounded-xl border border-base-600/30">
                            {data.summary}
                        </p>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Suggestions */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <MessageCircle className="w-5 h-5 text-accent" />
                                <h3 className="text-lg font-bold">Key Suggestions</h3>
                            </div>
                            <div className="space-y-3">
                                {data.suggestions?.map((s, i) => (
                                    <div key={i} className="flex gap-3 p-3 bg-base-900/30 rounded-xl border border-base-600/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0"></div>
                                        <span className="text-sm text-text-secondary">{s}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Red Flags */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <AlertTriangle className="w-5 h-5 text-error" />
                                <h3 className="text-lg font-bold">Red Flags</h3>
                            </div>
                            <div className="space-y-3">
                                {data.redFlags && data.redFlags.length > 0 ? (
                                    data.redFlags.map((f, i) => (
                                        <div key={i} className="flex gap-3 p-3 bg-error/5 rounded-xl border border-error/20">
                                            <AlertTriangle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                                            <span className="text-sm text-error/90 font-medium">{f}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-8 bg-accent/5 rounded-xl border border-accent/20 border-dashed">
                                        <Star className="w-8 h-8 text-accent mb-2 opacity-50" />
                                        <span className="text-xs text-accent font-bold uppercase tracking-widest">No Red Flags Found</span>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>

                <button 
                    onClick={onRestart}
                    className="w-full mt-12 py-4 bg-accent text-base-900 font-black text-lg rounded-2xl hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(0,184,148,0.3)] flex items-center justify-center gap-3"
                >
                    <RefreshCcw className="w-5 h-5" />
                    Try Another Session
                </button>
            </div>
        </div>
    );
};

export default GDReport;
