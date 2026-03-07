import { useEffect, useRef, useState, type ReactNode } from 'react';
import Lottie from 'lottie-react';
import interviewAnim from '../../assets/lottie/Interview..json';
import resumeAnim from '../../assets/lottie/Document.json';
import networkingAnim from '../../assets/lottie/Networking For All.json';
import emailAnim from '../../assets/lottie/email.json';
import gdAnim from '../../assets/lottie/GROUP DISCUSION.json';
import { Sparkles, Brain, FileText, Send, Users } from 'lucide-react';

interface HomeProps {
    onNavigate: (view: 'interview' | 'resume' | 'networking' | 'cover-letter') => void;
}

const ScrollReveal = ({ children, direction = 'up', delay = 0 }: { children: ReactNode, direction?: 'up' | 'left' | 'right', delay?: number }) => {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        const current = domRef.current;
        if (current) observer.observe(current);
        
        return () => {
            if (current) observer.unobserve(current);
        };
    }, []);

    const getDirectionClass = () => {
        switch (direction) {
            case 'left': return 'translate-x-[-100px]';
            case 'right': return 'translate-x-[100px]';
            default: return 'translate-y-[40px]';
        }
    };

    return (
        <div
            ref={domRef}
            className={`transition-all duration-1000 ease-out will-change-[transform,opacity] ${
                isVisible 
                    ? 'opacity-100 translate-x-0 translate-y-0' 
                    : `opacity-0 ${getDirectionClass()}`
            }`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

const Home = ({ onNavigate }: HomeProps) => {
    const features = [
        {
            id: 'interview',
            title: 'AI Interview Coach',
            tagline: 'Master your interview skills with real-time AI guidance.',
            description: 'Practice with our state-of-the-art AI interviewer. Get instant feedback on your tone, body language, and answer quality. Prepare for specific roles and scenarios with personalized coaching sessions.',
            animation: interviewAnim,
            icon: Brain,
            color: 'from-blue-500/10 to-accent/5',
            borderColor: 'border-accent/20',
            buttonColor: 'bg-accent text-base-900',
            features: ['Real-time Feedback', 'Role-Specific Prep', 'Unlimited Sessions']
        },
        {
            id: 'resume',
            title: 'Resume Architect',
            tagline: 'Build ATS-optimized resumes that stand out.',
            description: 'Generate professional LaTeX resumes tailored specifically to your target job descriptions. Our AI ensures your skills and experience are highlighted to pass through automated screening systems.',
            animation: resumeAnim,
            icon: FileText,
            color: 'from-cyan-500/10 to-accent/5',
            borderColor: 'border-purple-500/20',
            buttonColor: 'bg-cyan-500 text-white',
            features: ['ATS Optimization', 'LaTeX Export', 'Job Tailoring']
        },
        {
            id: 'networking',
            title: 'Networking AI',
            tagline: 'Make every connection count with tailored outreach.',
            description: 'Craft perfect professional outreach messages in seconds. Whether it\'s LinkedIn or email, our AI helps you connect with recruiters and industry professionals using proven communication strategies.',
            animation: networkingAnim,
            icon: Users,
            color: 'from-emerald-500/10 to-accent/5',
            borderColor: 'border-emerald-500/20',
            buttonColor: 'bg-emerald-600 text-white',
            features: ['Proven Templates', 'Smart Personalization', 'Multi-platform support']
        },
        {
            id: 'gd',
            title: 'GD Preparation',
            tagline: 'Dominate group discussions with AI personas.',
            description: 'Practice multi-bot Group Discussions with diverse AI personas. Learn how to handle aggressive speakers, silent partners, and lead the conversation effectively with real-time feedback and evaluation.',
            animation: gdAnim,
            icon: Users,
            color: 'from-cyan-500/10 to-accent/5',
            borderColor: 'border-cyan-500/20',
            buttonColor: 'bg-cyan-400 text-white',
            features: ['Multi-Persona Bots', 'Custom Topics', 'Red Flag Detection']
        },
        {
            id: 'cover-letter',
            title: 'Cover Letter Pro',
            tagline: 'Compelling letters that open doors to opportunities.',
            description: 'Generate high-impact cover letters and professional emails effortlessly. Scale your application process without sacrificing quality or personalization in your communications.',
            animation: emailAnim,
            icon: Send,
            color: 'from-green-500/10 to-accent/5',
            borderColor: 'border-green-500/20',
            buttonColor: 'bg-green-500 text-white',
            features: ['Fast Generation', 'Persuasive Writing', 'Professional Formatting']
        }
    ];

    return (
        <div className="w-full min-h-screen pb-20 px-6 md:px-12 overflow-x-hidden">
            {/* Hero Section */}
            <div className="pt-24 pb-24 text-center max-w-4xl mx-auto">
                <ScrollReveal>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent-200 text-sm font-bold mb-6">
                        <Sparkles className="w-4 h-4" />
                        Powered by Advanced AI
                    </div>
                    <h1 className="text-6xl md:text-8xl font-extrabold mb-8 tracking-tight leading-none bg-gradient-to-b from-text-primary to-text-secondary bg-clip-text text-transparent">
                        Elevate Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-200 via-accent to-accent-600">Career Journey</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed mb-10">
                        Personalized AI-driven tools to help you land your dream job. <br className="hidden md:block"/> From initial outreach to the final interview.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button 
                            onClick={() => onNavigate('interview')}
                            className="px-8 py-4 bg-accent text-base-900 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,184,148,0.4)]"
                        >
                            Start Your First Interview
                        </button>
                    </div>
                </ScrollReveal>
            </div>

            {/* Alternating Feature Rows */}
            <div className="space-y-48 max-w-7xl mx-auto mb-40">
                {features.map((feature, index) => {
                    const isEven = index % 2 === 0;
                    return (
                        <div 
                            key={feature.id}
                            className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 md:gap-24`}
                        >
                            {/* Text Content */}
                            <div className="flex-1">
                                <ScrollReveal direction={isEven ? 'left' : 'right'}>
                                    <div className="space-y-8 text-left">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-accent-200 font-bold uppercase tracking-widest text-sm">
                                                <feature.icon className="w-5 h-5" />
                                                {feature.title}
                                            </div>
                                            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
                                                {feature.tagline}
                                            </h2>
                                            <p className="text-lg text-text-secondary leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {feature.features.map((f, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm text-text-primary font-medium">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                                    {f}
                                                </div>
                                            ))}
                                        </div>

                                        <button 
                                            onClick={() => onNavigate(feature.id as any)}
                                            className={`px-8 py-4 rounded-xl font-extrabold flex items-center gap-2 ${feature.buttonColor} hover:opacity-90 transition-all hover:scale-105`}
                                        >
                                            Try {feature.title}
                                            <Sparkles className="w-4 h-4" />
                                        </button>
                                    </div>
                                </ScrollReveal>
                            </div>

                            {/* Animation Section */}
                            <div className="flex-1 w-full max-w-[500px]">
                                <ScrollReveal direction={isEven ? 'right' : 'left'}>
                                    <div className={`relative p-8 rounded-[40px] border ${feature.borderColor} bg-gradient-to-br ${feature.color} backdrop-blur-xl shadow-2xl`}>
                                        <Lottie 
                                            animationData={feature.animation} 
                                            loop={true} 
                                            className="w-full h-auto"
                                        />
                                        <div className="absolute inset-0 bg-accent/5 blur-3xl rounded-full -z-10 animate-pulse"></div>
                                    </div>
                                </ScrollReveal>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* Social Proof / Stats */}
            <div className="mt-40 text-center border-t border-base-600/30 pt-32">
                <ScrollReveal>
                    <h2 className="text-4xl font-bold mb-16 tracking-tight">Why candidates trust PrepX</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-5xl mx-auto">
                        <div className="space-y-2">
                            <div className="text-6xl font-black text-accent-200">10x</div>
                            <p className="text-lg font-medium text-text-primary uppercase tracking-tighter">Faster Preparation</p>
                            <p className="text-text-secondary text-sm">Cut down weeks of manual practice into days of focused AI sessions.</p>
                        </div>
                        <div className="space-y-2 border-x border-base-600/30 px-8">
                            <div className="text-6xl font-black text-accent-200">75%</div>
                            <p className="text-lg font-medium text-text-primary uppercase tracking-tighter">ATS Compatibility</p>
                            <p className="text-text-secondary text-sm">Resumes designed to pass through the toughest recruiter screening tools.</p>
                        </div>
                        <div className="space-y-2">
                            <div className="text-6xl font-black text-accent-200">24/7</div>
                            <p className="text-lg font-medium text-text-primary uppercase tracking-tighter">AI Availability</p>
                            <p className="text-text-secondary text-sm">Your personal career coach is always ready, whenever you are.</p>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </div>
    );
};

export default Home;
