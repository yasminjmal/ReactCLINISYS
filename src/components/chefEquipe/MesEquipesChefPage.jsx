// src/components/chefEquipe/MesEquipesChefPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Users, User, Settings, Shield, ChevronDown, ChevronUp, Briefcase, Package, Search as SearchIcon, Info } from 'lucide-react';

// Données mockées (à remplacer par des données réelles via props ou API)
const mockChefEquipeData = {
  id: 'chef001', // ID du chef d'équipe connecté
  nom_utilisateur: 'chef_amine',
  equipesDirigees: [
    {
      id: 'eq1',
      nom: 'Équipe Alpha (Cardiologie)',
      description: 'Équipe spécialisée dans le module de cardiologie et interventions.',
      membres: [
        { id: 'user001', prenom: 'Yasmin', nom: 'Jmal', poste: 'Développeur Front', email: 'yasmin.jmal@example.com', statut: 'Actif', profileImage: 'https://placehold.co/100x100/E0E7FF/4F46E5?text=YJ' },
        { id: 'user002', prenom: 'Karim', nom: 'Bello', poste: 'Développeur Back', email: 'karim.bello@example.com', statut: 'Actif', profileImage: 'https://placehold.co/100x100/DBEAFE/1D4ED8?text=KB' },
        { id: 'user005', prenom: 'Sophie', nom: 'Durand', poste: 'Testeur QA', email: 'sophie.durand@example.com', statut: 'En congé', profileImage: 'https://placehold.co/100x100/FEF3C7/D97706?text=SD' },
      ],
      modulesAssocies: [
        { id: 'mod001', nom: 'Gestion des Patients (Cardio)', description: 'Dossiers patients spécifiques à la cardiologie.', icone: Package },
        { id: 'mod005', nom: 'Plannification Interventions Chirurgicales', description: 'Module pour la planification des opérations.', icone: Briefcase },
      ]
    },
    {
      id: 'eq3',
      nom: 'Équipe Gamma (Radiologie)',
      description: 'Gestion et maintenance du module de radiologie.',
      membres: [
        { id: 'user003', prenom: 'Ali', nom: 'Ben Salah', poste: 'Spécialiste Support Applicatif', email: 'ali.bensalah@example.com', statut: 'Actif', profileImage: 'https://placehold.co/100x100/D1FAE5/059669?text=AB' },
        { id: 'user006', prenom: 'Linda', nom: 'Martin', poste: 'Développeur Fullstack', email: 'linda.martin@example.com', statut: 'Actif', profileImage: 'https://placehold.co/100x100/FCE7F3/DB2777?text=LM' },
      ],
      modulesAssocies: [
        { id: 'mod008', nom: 'Imagerie Médicale (PACS)', description: 'Système d\'archivage et de communication des images.', icone: Settings },
      ]
    },
    {
      id: 'eq4',
      nom: 'Équipe Delta (Support Général)',
      description: 'Support technique de premier niveau pour diverses applications.',
      membres: [
        { id: 'user007', prenom: 'Marc', nom: 'Dupont', poste: 'Technicien Support N1', email: 'marc.dupont@example.com', statut: 'Actif', profileImage: 'https://placehold.co/100x100/E0E7FF/4F46E5?text=MD' },
      ],
      modulesAssocies: []
    }
  ]
};


const MesEquipesChefPage = ({ chefId }) => {
  const [allEquipes, setAllEquipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedEquipes, setExpandedEquipes] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setAllEquipes(mockChefEquipeData.equipesDirigees || []);
      setLoading(false);
    }, 500);
  }, [chefId]);

  const toggleEquipeExpansion = (equipeId) => {
    setExpandedEquipes(prev => ({
      ...prev,
      [equipeId]: !prev[equipeId]
    }));
  };

  const filteredEquipes = useMemo(() => {
    if (!searchTerm) return allEquipes;
    return allEquipes.filter(equipe => 
      equipe.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (equipe.description && equipe.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [allEquipes, searchTerm]);

  if (loading) {
    return <div className="p-6 text-center text-slate-500 dark:text-slate-400 animate-pulse">Chargement de vos équipes...</div>;
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

      {filteredEquipes.length === 0 && !loading && (
         <div className="text-center py-10">
            <Info size={48} className="mx-auto text-slate-400 dark:text-slate-500 mb-4" />
            <p className="text-slate-500 dark:text-slate-400">
                {searchTerm ? "Aucune équipe ne correspond à votre recherche." : "Vous ne supervisez aucune équipe pour le moment."}
            </p>
        </div>
      )}

      <div className="space-y-5">
        {filteredEquipes.map((equipe) => (
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
                    {equipe.nom}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-prose">{equipe.description || "Pas de description pour cette équipe."}</p>
                </div>
              </div>
              {expandedEquipes[equipe.id] ? <ChevronUp size={24} className="text-slate-500 dark:text-slate-400 flex-shrink-0" /> : <ChevronDown size={24} className="text-slate-500 dark:text-slate-400 flex-shrink-0" />}
            </button>

            {expandedEquipes[equipe.id] && (
              <div className="border-t border-slate-200 dark:border-slate-700 p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-slate-800/30">
                {/* Section Modules Associés (maintenant en premier) */}
                <section>
                  <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center">
                    <Package size={18} className="mr-2.5 text-teal-500 dark:text-teal-400" />
                    Modules Gérés ({equipe.modulesAssocies?.length || 0})
                  </h3>
                  {equipe.modulesAssocies && equipe.modulesAssocies.length > 0 ? (
                    <div className="space-y-3">
                      {equipe.modulesAssocies.map((module) => (
                        <div key={module.id} className="p-3.5 bg-white dark:bg-slate-700 rounded-lg shadow border border-slate-200 dark:border-slate-600 flex items-start space-x-3">
                          <div className="p-2 bg-teal-50 dark:bg-teal-700/30 rounded-md flex-shrink-0">
                            {module.icone ? <module.icone size={20} className="text-teal-600 dark:text-teal-400" /> : <Settings size={20} className="text-teal-600 dark:text-teal-400" />}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{module.nom}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{module.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic">Aucun module n'est spécifiquement géré par cette équipe.</p>
                  )}
                </section>

                {/* Section Membres (maintenant en deuxième) */}
                <section className="pt-5 border-t border-slate-300 dark:border-slate-700">
                  <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center">
                    <User size={18} className="mr-2.5 text-indigo-500 dark:text-indigo-400" />
                    Membres ({equipe.membres?.length || 0})
                  </h3>
                  {equipe.membres && equipe.membres.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {equipe.membres.map((membre) => (
                        <div key={membre.id} className="p-3.5 bg-white dark:bg-slate-700 rounded-lg shadow-md border border-slate-200 dark:border-slate-600 flex items-start space-x-3">
                          <img 
                            src={membre.profileImage || `https://placehold.co/80x80/E2E8F0/475569?text=${membre.prenom?.charAt(0)}${membre.nom?.charAt(0)}`} 
                            alt={`${membre.prenom} ${membre.nom}`}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-slate-300 dark:border-slate-500"
                            onError={(e) => { e.target.src = `https://placehold.co/80x80/E2E8F0/475569?text=??`; }}
                          />
                          <div className="flex-grow">
                            <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{membre.prenom} {membre.nom}</p>
                            <p className="text-xs text-sky-600 dark:text-sky-400">{membre.poste}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate" title={membre.email}>{membre.email}</p>
                            <span className={`mt-1.5 inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full leading-tight ${
                              membre.statut === 'Actif' ? 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300' 
                                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-300'
                            }`}>
                              {membre.statut}
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
        ))}
      </div>
    </div>
  );
};

export default MesEquipesChefPage;
