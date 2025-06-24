import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BrainCircuit } from 'lucide-react';
import companyLogo from '../../assets/images/logo.jpg'; 

const GoodbyePage = () => {
    const { logout, currentUser } = useAuth();

    useEffect(() => {
        // We set a timer to allow the user to see the animation before logging out.
        const timer = setTimeout(() => {
            logout();
        }, 5000); // 3.5 seconds delay

        // Cleanup function to clear the timer if the component unmounts
        return () => clearTimeout(timer);
    }, [logout]); // Dependency on logout function

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-95 backdrop-blur-md z-[9999] flex flex-col items-center justify-center text-white overflow-hidden animate-fade-in">
            
            <div className="text-center flex flex-col items-center">
                {/* Your Company Logo */}
                <img 
                    src={companyLogo} 
                    alt="Company Logo" 
                    className="w-40 h-auto mx-auto mb-10 opacity-0 animate-fade-in"
                    style={{ animationDelay: '0.2s' }}
                />

                {/* Animated AI Icon */}
                <div className="relative w-32 h-32 mx-auto mb-8">
                    <BrainCircuit size={64} className="absolute inset-0 m-auto text-sky-300 opacity-0 animate-pulse-glow" style={{ animationDelay: '1.8s' }} />
                    <svg className="loading-ring-svg absolute inset-0" viewBox="0 0 100 100">
                        <defs>
                            <linearGradient id="comet-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="rgba(56, 189, 248, 0)" /> 
                                <stop offset="100%" stopColor="rgba(191, 219, 254, 1)" />
                            </linearGradient>
                        </defs>
                        <circle className="ring-background-track" cx="50" cy="50" r="45" />
                        <circle className="ring-comet" cx="50" cy="50" r="45" />
                    </svg>
                </div>

                {/* Goodbye Message */}
                <h1 
                    className="text-3xl font-bold tracking-wider text-slate-100 mb-2 opacity-0 animate-text-focus-in"
                    style={{ animationDelay: '2.0s' }}
                >
                    Au revoir, {currentUser?.prenom || 'utilisateur'}
                </h1>
                <p 
                    className="text-md text-slate-400 opacity-0 animate-text-focus-in"
                    style={{ animationDelay: '2.4s' }}
                >
                    Déconnexion sécurisée en cours...
                </p>
            </div>

        </div>
    );
};

export default GoodbyePage;