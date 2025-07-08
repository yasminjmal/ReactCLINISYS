// src/components/admin/Tracabilite/TracabilitePage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Search, History, Loader, AlertTriangle, GitCommit, Edit, PlusCircle, Trash2, Clock, ArrowRight, Users, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// --- Services ---
import auditService from '../../../services/auditService';
import api from '../../../services/api';

// =================================================================================
//  SOUS-COMPOSANTS POUR L'AFFICHAGE DE L'HISTORIQUE (Refonte complète)
// =================================================================================

const RevisionTypeBadge = ({ type }) => {
    const types = {
        ADD: { text: 'Création', color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300', icon: <PlusCircle size={14} /> },
        MOD: { text: 'Modification', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300', icon: <Edit size={14} /> },
        DEL: { text: 'Archivage', color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300', icon: <Trash2 size={14} /> },
    };
    const { text, color, icon } = types[type] || { text: 'Inconnu', color: 'bg-slate-100 text-slate-700' };
    return <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${color}`}>{icon}{text}</span>;
};

const DiffViewer = ({ before, after }) => {
    if (!before || !after) return null;
    const changes = [];
    const allKeys = new Set([...Object.keys(after), ...Object.keys(before)]);
    const ignoredKeys = ['id', 'childTickets', 'commentaireList', 'documentJointesList', 'ticketList', 'equipePosteSet', 'dateCreation', 'userCreation', 'photo'];

    allKeys.forEach(key => {
        if (ignoredKeys.includes(key)) return;
        const getComparableValue = (obj) => obj && typeof obj === 'object' && obj.id ? obj.id : obj;
        if (JSON.stringify(getComparableValue(before[key])) !== JSON.stringify(getComparableValue(after[key]))) {
            const formatValue = (val) => {
                if (val === true) return 'Oui'; if (val === false) return 'Non';
                if (val && typeof val === 'object') return val.nomComplet || val.designation || `${val.prenom || ''} ${val.nom || ''}`.trim() || `ID: ${val.id}`;
                return val !== null && val !== undefined ? String(val) : 'Vide';
            };
            changes.push({
                field: key.replace(/([A-Z])/g, ' $1').replace('id ', '').replace('echeance', 'échéance').trim(),
                from: formatValue(before[key]),
                to: formatValue(after[key]),
            });
        }
    });

    if (changes.length === 0) return <p className="text-sm text-slate-500 italic mt-2">Aucun changement de données détecté pour cette modification.</p>;

    return (
        <div className="mt-4 space-y-3">{changes.map((change, index) => (
            <div key={index} className="text-sm"><strong className="font-semibold capitalize text-slate-700 dark:text-slate-300">{change.field}:</strong>
                <div className="flex items-center flex-wrap gap-2 mt-1 text-slate-600 dark:text-slate-400">
                    <span className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-md line-through">{change.from}</span>
                    <ArrowRight size={16} className="text-slate-400 flex-shrink-0" />
                    <span className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-md">{change.to}</span>
                </div>
            </div>))}
        </div>
    );
};

const StatCard = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md flex items-center gap-4">
        <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        </div>
    </div>
);

const HistoryDashboard = ({ history }) => {
    const { totalChanges, userContributions, changesOverTime } = useMemo(() => {
        const userContrib = {};
        const timeChanges = {};
        history.forEach(log => {
            const user = log.revisionInfo.userCreate;
            const date = new Date(log.revisionInfo.timestamp).toLocaleDateString('fr-CA'); // Format YYYY-MM-DD
            userContrib[user] = (userContrib[user] || 0) + 1;
            if (log.revisionType === 'MOD') {
                timeChanges[date] = (timeChanges[date] || 0) + 1;
            }
        });
        return {
            totalChanges: history.length,
            userContributions: Object.entries(userContrib).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
            changesOverTime: Object.entries(timeChanges).map(([date, modifications]) => ({ date, modifications })).sort((a,b) => new Date(a.date) - new Date(b.date)),
        };
    }, [history]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Total des révisions" value={totalChanges} icon={<History size={24} className="text-blue-600 dark:text-blue-300" />} />
                <StatCard title="Contributeurs uniques" value={userContributions.length} icon={<Users size={24} className="text-blue-600 dark:text-blue-300" />} />
                <StatCard title="Premier contributeur" value={userContributions[0]?.name || 'N/A'} icon={<GitCommit size={24} className="text-blue-600 dark:text-blue-300" />} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
                    <h4 className="font-semibold mb-4 text-slate-700 dark:text-slate-200">Modifications par jour</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={changesOverTime} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }} labelStyle={{ color: '#cbd5e1' }} itemStyle={{ fontWeight: 'bold' }} />
                            <Bar dataKey="modifications" fill="#3b82f6" name="Modifications" barSize={20} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
                    <h4 className="font-semibold mb-4 text-slate-700 dark:text-slate-200">Répartition par contributeur</h4>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={userContributions} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                                {userContributions.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const HistoryTimeline = ({ history }) => (
    <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6">Détail de l'historique</h3>
        <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3">
            {history.map((log) => (
                <div key={log.revisionInfo.id} className="mb-8 ml-8">
                    <span className="absolute -left-4 flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full ring-4 ring-white dark:ring-slate-900/50 dark:bg-blue-900"><Clock size={16} className="text-blue-600 dark:text-blue-300" /></span>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <RevisionTypeBadge type={log.revisionType} />
                            <div className="text-xs font-normal text-slate-500 dark:text-slate-400"><span>{new Date(log.revisionInfo.timestamp).toLocaleString('fr-FR')}</span><span className="mx-1">par</span><strong className="font-medium text-slate-700 dark:text-slate-200">{log.revisionInfo.userCreate}</strong></div>
                        </div>
                        {log.revisionType === 'ADD' && <p className="text-sm text-green-600 dark:text-green-400">Élément créé avec les données initiales.</p>}
                        {log.revisionType === 'DEL' && <p className="text-sm text-red-600 dark:text-red-400">Élément archivé/supprimé.</p>}
                        {log.revisionType === 'MOD' && <DiffViewer before={log.previousEntity} after={log.entity} />}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// =================================================================================
//  COMPOSANT PRINCIPAL DE LA PAGE
// =================================================================================

const TracabilitePage = () => {
    const [selectedEntityType, setSelectedEntityType] = useState('ticket');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [history, setHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [errorHistory, setErrorHistory] = useState(null);

    const entityConfig = {
        ticket: { label: 'Tickets', searchPath: '/tickets/search' },
        client: { label: 'Clients', searchPath: '/clients/search' },
        utilisateur: { label: 'Utilisateurs', searchPath: '/utilisateurs/search' },
    };

    useEffect(() => {
        if (searchTerm.length < 2) { setSearchResults([]); return; }
        const handler = setTimeout(async () => {
            setIsSearching(true);
            try {
                const path = entityConfig[selectedEntityType].searchPath;
                const response = await api.get(path, { params: { term: searchTerm } });
                setSearchResults(response.data || []);
            } catch (error) { setSearchResults([]); } finally { setIsSearching(false); }
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm, selectedEntityType]);

    const handleSelectEntity = async (entity) => {
        setSelectedEntity({ id: entity.id, name: entity.titre || entity.nomComplet || `${entity.prenom || ''} ${entity.nom || ''}`.trim() });
        setSearchTerm('');
        setSearchResults([]);
        setIsLoadingHistory(true);
        setErrorHistory(null);
        try {
            const data = await auditService.getHistory(selectedEntityType, entity.id);
            setHistory(data);
        } catch (err) {
            setErrorHistory("Impossible de charger l'historique.");
        } finally {
            setIsLoadingHistory(false);
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3"><History size={32} />Traçabilité des Entités</h1>
                <p className="text-slate-500 mt-1">Consultez l'historique complet des modifications pour n'importe quelle entité du système.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                        <div className="mb-4">
                            <label htmlFor="entityType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">1. Choisir le type d'entité</label>
                            <select id="entityType" value={selectedEntityType} onChange={(e) => { setSelectedEntityType(e.target.value); setSearchTerm(''); setSearchResults([]); setSelectedEntity(null); setHistory([]); }} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500">
                                {Object.entries(entityConfig).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="searchEntity" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">2. Rechercher un élément</label>
                            <div className="relative"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" id="searchEntity" placeholder={`Rechercher dans les ${entityConfig[selectedEntityType].label.toLowerCase()}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500" />{isSearching && <Loader size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />}</div>
                            {searchResults.length > 0 && <ul className="mt-2 border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 max-h-60 overflow-y-auto">{searchResults.map(item => <li key={item.id}><button onClick={() => handleSelectEntity(item)} className="w-full text-left p-3 hover:bg-slate-100 dark:hover:bg-slate-600 border-b dark:border-slate-600 last:border-b-0"><span className="font-medium text-slate-800 dark:text-slate-200">{item.titre || item.nomComplet || `${item.prenom || ''} ${item.nom || ''}`}</span><span className="text-sm text-slate-500 ml-2">#{item.id}</span></button></li>)}</ul>}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-2">
                    {selectedEntity ? (
                        isLoadingHistory ? <div className="p-4 text-center text-slate-500"><Loader className="animate-spin inline-block mr-2" />Chargement...</div> :
                        errorHistory ? <div className="p-4 text-center text-red-500">{errorHistory}</div> :
                        <>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Tableau de Bord pour : <span className="text-blue-600">{selectedEntity.name}</span></h2>
                            <HistoryDashboard history={history} />
                            <HistoryTimeline history={history} />
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 text-center">
                            <AlertTriangle size={48} className="text-slate-400 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Aucun élément sélectionné</h3>
                            <p className="text-slate-500">Veuillez rechercher et sélectionner un élément pour voir son historique.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TracabilitePage;
