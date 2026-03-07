import { Github, Linkedin, Twitter, Globe, Sparkles } from 'lucide-react';

interface FooterProps {
    onNavigate: (view: any) => void;
}

const Footer = ({ onNavigate }: FooterProps) => {
    const currentYear = new Date().getFullYear();

    const sections = [
        {
            title: 'Platform',
            links: [
                { label: 'AI Interview', id: 'interview' },
                { label: 'Job Board', id: 'jobs' },
                { label: 'Resume Architect', id: 'resume' },
                { label: 'Cover Letter Pro', id: 'cover-letter' },
                { label: 'Networking AI', id: 'networking' },
            ]
        },
        {
            title: 'Company',
            links: [
                { label: 'About PrepX', id: 'home' },
                { label: 'Privacy Policy', id: '#' },
                { label: 'Terms of Service', id: '#' },
                { label: 'Contact Us', id: 'mailto:support@prepx.ai' },
            ]
        },
        {
            title: 'Resources',
            links: [
                { label: 'Success Stories', id: '#' },
                { label: 'Interview Tips', id: '#' },
                { label: 'ATS Guide', id: '#' },
                { label: 'Help Center', id: '#' },
            ]
        }
    ];

    return (
        <footer className="w-full bg-base-900/50 border-t border-base-600/30 pt-20 pb-10 px-6 md:px-12 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <div 
                            className="flex items-center gap-2 cursor-pointer group"
                            onClick={() => onNavigate('home')}
                        >
                            <img src="/logo5.png" alt="PrepX Logo" className="h-12 w-auto group-hover:scale-110 transition-transform" />
                            <span className="text-2xl font-black bg-gradient-to-r from-accent-200 to-accent-600 bg-clip-text text-transparent">
                                PrepX
                            </span>
                        </div>
                        <p className="text-text-secondary text-base leading-relaxed max-w-xs">
                            Empowering candidates with cutting-edge AI to navigate their career journey with confidence.
                        </p>
                        <div className="flex gap-4">
                            {[
                                { icon: Linkedin, href: '#' },
                                { icon: Twitter, href: '#' },
                                { icon: Github, href: '#' },
                                { icon: Globe, href: '#' }
                            ].map((social, i) => (
                                <a 
                                    key={i} 
                                    href={social.href} 
                                    className="p-2 rounded-lg bg-base-700/50 hover:bg-accent/20 hover:text-accent-200 transition-all border border-base-600/50"
                                >
                                    <social.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Sections */}
                    {sections.map((section) => (
                        <div key={section.title} className="space-y-6">
                            <h4 className="text-text-primary font-bold text-lg">{section.title}</h4>
                            <ul className="space-y-4">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <button
                                            onClick={() => {
                                                if (link.id.startsWith('mailto:')) {
                                                    window.location.href = link.id;
                                                } else if (link.id !== '#') {
                                                    onNavigate(link.id);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }
                                            }}
                                            className="text-text-secondary hover:text-accent-200 transition-colors text-sm font-medium flex items-center gap-2 group"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-base-600 group-hover:bg-accent transition-colors" />
                                            {link.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-base-600/20 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-text-secondary text-sm flex items-center gap-2">
                        © {currentYear} PrepX AI. All rights reserved. 
                        <span className="hidden md:inline">•</span>
                        <div className="flex items-center gap-1 text-accent/80">
                            <Sparkles className="w-3 h-3" />
                            Built for Success
                        </div>
                    </div>
                    <div className="flex gap-8 text-sm text-text-secondary">
                        <a href="#" className="hover:text-text-primary transition-colors">Privacy</a>
                        <a href="#" className="hover:text-text-primary transition-colors">Terms</a>
                        <a href="#" className="hover:text-text-primary transition-colors">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
