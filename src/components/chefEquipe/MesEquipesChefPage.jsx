// src/components/chefEquipe/MesEquipesChefPage.jsx
import React, { useState, useMemo } from 'react';
import { Users, User, Settings, Shield, ChevronDown, ChevronUp, Briefcase, Package, Search as SearchIcon, Info } from 'lucide-react';

const MesEquipesChefPage = ({ equipesChef, allModules }) => {
  const [expandedEquipes, setExpandedEquipes] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const toggleEquipeExpansion = (equipeId) => {
    setExpandedEquipes(prev => ({
      ...prev,
      [equipeId]: !prev[equipeId]
    }));
  };

  const filteredEquipes = useMemo(() => {
    if (!searchTerm) return equipesChef || [];
    const lowerSearchTerm = searchTerm.toLowerCase();
    return (equipesChef || []).filter(equipe => 
      equipe.designation.toLowerCase().includes(lowerSearchTerm) ||
      (equipe.description && equipe.description.toLowerCase().includes(lowerSearchTerm))
    );
  }, [equipesChef, searchTerm]);
  
  const getModulesForEquipe = (equipeId) => {
    if (!allModules || !equipeId) return [];
    return allModules.filter(module => module.equipe?.id === equipeId);
  };

  if (!equipesChef) {
    return <div className="p-6 text-center text-slate-500 dark:text-slate-400">Chargement de vos équipes...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-100 dark:bg-slate-950 min-h-full">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-5">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mes Équipes</h1>
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Rechercher une équipe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input-icon w-full py-2.5 text-sm pl-10"
            />
          </div>
        </div>
      </div>

      {filteredEquipes.length === 0 ? (
         <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg shadow-md">
            <Info size={48} className="mx-auto text-slate-400 dark:text-slate-500 mb-4" />
            <p className="text-slate-500 dark:text-slate-400">
                {searchTerm ? "Aucune équipe ne correspond à votre recherche." : "Vous ne supervisez aucune équipe pour le moment."}
            </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredEquipes.map((equipe) => {
            const modulesDeLequipe = getModulesForEquipe(equipe.id);
            const membres = equipe.utilisateurs || [];

            return (
              <div key={equipe.id} className="bg-white dark:bg-slate-800 shadow-xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => toggleEquipeExpansion(equipe.id)}
                  className="w-full flex justify-between items-center p-4 md:p-6 text-left hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <div className="flex items-center">
                    <div className="p-2.5 bg-sky-100 dark:bg-sky-700/30 rounded-lg mr-4">
                        <Users size={22} className="text-sky-600 dark:text-sky-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-sky-700 dark:text-sky-300">
                        {equipe.designation}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-prose">{equipe.description || "Pas de description pour cette équipe."}</p>
                    </div>
                  </div>
                  {expandedEquipes[equipe.id] ? <ChevronUp size={24} className="text-slate-500 dark:text-slate-400 flex-shrink-0" /> : <ChevronDown size={24} className="text-slate-500 dark:text-slate-400 flex-shrink-0" />}
                </button>

                {expandedEquipes[equipe.id] && (
                  <div className="border-t border-slate-200 dark:border-slate-700 p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-slate-800/30">
                    <section>
                      <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center">
                        <Package size={18} className="mr-2.5 text-teal-500 dark:text-teal-400" />
                        Modules Gérés ({modulesDeLequipe.length})
                      </h3>
                      {modulesDeLequipe.length > 0 ? (
                        <div className="space-y-3">
                          {modulesDeLequipe.map((module) => (
                            <div key={module.id} className="p-3.5 bg-white dark:bg-slate-700 rounded-lg shadow border border-slate-200 dark:border-slate-600 flex items-start space-x-3">
                              <div className="p-2 bg-teal-50 dark:bg-teal-700/30 rounded-md flex-shrink-0">
                                <Settings size={20} className="text-teal-600 dark:text-teal-400" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{module.designation}</p> {/* Changed module.nom to module.designation*/}
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{module.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400 italic">Aucun module n'est spécifiquement géré par cette équipe.</p>
                      )}
                    </section>
                    <section className="pt-5 border-t border-slate-300 dark:border-slate-700">
                      <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center">
                        <User size={18} className="mr-2.5 text-indigo-500 dark:text-indigo-400" />
                        Membres ({membres.length})
                      </h3>
                      {membres.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {membres.map((membre) => (
                            <div key={membre.id} className="p-3.5 bg-white dark:bg-slate-700 rounded-lg shadow-md border border-slate-200 dark:border-slate-600 flex items-start space-x-3">
                              <img 
                                src={membre.image || `https://placehold.co/80x80/E2E8F0/475569?text=${membre.prenom?.charAt(0)}${membre.nom?.charAt(0)}`} 
                                alt={`${membre.prenom} ${membre.nom}`}
                                className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-slate-300 dark:border-slate-500"
                                onError={(e) => { e.target.src = `https://placehold.co/80x80/E2E8F0/475569?text=??`; }}
                              />
                              <div className="flex-grow">
                                <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{membre.prenom} {membre.nom}</p>
                                <p className="text-xs text-sky-600 dark:text-sky-400">{membre.poste?.designation || 'N/A'}</p> {/* Changed membre.poste?.nom to membre.poste?.designation*/}
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate" title={membre.email}>{membre.email}</p>
                                <span className={`mt-1.5 inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full leading-tight ${
                                  membre.actif === true ? 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300'  /* Changed membre.statut === 'Actif' to membre.actif === true*/
                                                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-300'
                                }`}>
                                  {membre.actif ? 'Actif' : 'Inactif'} {/* Changed membre.statut to membre.actif*/}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400 italic">Aucun membre n'est actuellement affecté à cette équipe.</p>
                      )}
                    </section>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
};

export default MesEquipesChefPage;