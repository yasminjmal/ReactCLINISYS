// src/components/chefEquipe/TeamTabNavigator.jsx
import React from 'react';
import { Globe, Users as UsersIcon } from 'lucide-react'; // UsersIcon for general team tabs

const TeamTabNavigator = ({ teams, activeTab, onTabClick }) => {
    return (
        <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                {/* Global View Tab */}
                <button
                    onClick={() => onTabClick('global')}
                    className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold transition-all duration-300 rounded-t-lg border-b-2
                        ${activeTab === 'global'
                            ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                            : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-violet-500'
                        }`}
                >
                    <Globe size={20} />
                    <span>Vue Globale</span>
                </button>

                {/* Individual Team Tabs */}
                {teams.map(team => (
                    <button
                        key={team.id}
                        onClick={() => onTabClick(team.id)}
                        className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold transition-all duration-300 rounded-t-lg border-b-2
                            ${activeTab === team.id
                                ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                                : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-violet-500'
                            }`}
                    >
                        <UsersIcon size={20} />
                        <span>{team.designation}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TeamTabNavigator;