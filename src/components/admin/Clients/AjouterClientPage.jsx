import React, { useState, useEffect } from 'react';
import { Save, XCircle, ArrowLeft } from 'lucide-react';
import Select from 'react-select'; // NOUVEAU: Import de react-select
import geoService from '../../../services/geoService';
import { useAuth } from '../../../context/AuthContext'; 

const AjouterClientPage = ({ onAddClient, onCancel }) => {
    // État pour les champs de formulaire simples
    const [formData, setFormData] = useState({
        nomComplet: '',
        adress: '',
        email: '',
        actif: true,
    });
    
    // États séparés pour les sélecteurs, c'est une meilleure pratique avec react-select
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();


    const [errors, setErrors] = useState({});
    
    // États pour les options des listes déroulantes
    const [countries, setCountries] = useState([]);
    const [regions, setRegions] = useState([]);
    const [isLoadingCountries, setIsLoadingCountries] = useState(true);

    // Étape 1: Charger les pays au premier rendu du composant
    useEffect(() => {
        if (isAuthLoading || !isAuthenticated) {
            return; // On attend que l'utilisateur soit bien authentifié.
        }

        const fetchCountries = async () => {
            setIsLoadingCountries(true);
            try {
                const data = await geoService.getAllCountries();
                // On transforme les données pour qu'elles soient compatibles avec react-select ({value, label})
                const countryOptions = data.map(c => ({ 
                    value: c.code, 
                    label: c.name, 
                    regions: c.regions // On garde les régions pour éviter un appel API plus tard
                }));
                setCountries(countryOptions);

                // Petite amélioration : on présélectionne la Tunisie si elle existe
                const tunisia = countryOptions.find(c => c.value === 'TN');
                if (tunisia) {
                    setSelectedCountry(tunisia);
                }
            } catch (err) {
                console.error("Erreur lors du chargement des pays:", err);
                setErrors({ general: "Impossible de charger les données géographiques." });
            } finally {
                setIsLoadingCountries(false);
            }
        };
        fetchCountries();
    }, [isAuthLoading, isAuthenticated]);

    // Étape 2: Mettre à jour la liste des régions quand le pays change
    useEffect(() => {
        if (selectedCountry) {
            // On utilise les régions déjà chargées pour plus de performance
            const regionOptions = selectedCountry.regions.map(r => ({ value: r.code, label: r.name }));
            setRegions(regionOptions);
        } else {
            setRegions([]); // Vider les régions si aucun pays n'est sélectionné
        }
        // Toujours réinitialiser la région sélectionnée pour forcer un nouveau choix
        setSelectedRegion(null);
    }, [selectedCountry]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.nomComplet.trim()) newErrors.nomComplet = "Le nom complet est requis.";
        if (!selectedCountry) newErrors.country = "Le pays est requis.";
        if (!selectedRegion) newErrors.region = "La région est requise.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // On construit l'objet de données final à envoyer au backend
            const clientData = {
                ...formData,
                countryCode: selectedCountry.value, // On utilise .value et .label de nos objets de sélection
                regionName: selectedRegion.label,
            };
            onAddClient(clientData);
        }
    };
    
    // Style personnalisé pour react-select pour gérer le mode sombre
    const selectStyles = {
        control: (styles) => ({ ...styles, backgroundColor: document.documentElement.classList.contains('dark') ? '#1e293b' : 'white', borderColor: document.documentElement.classList.contains('dark') ? '#475569' : '#cbd5e1' }),
        singleValue: (styles) => ({ ...styles, color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }),
        input: (styles) => ({...styles, color: document.documentElement.classList.contains('dark') ? 'white' : 'black'}),
        menu: (styles) => ({ ...styles, backgroundColor: document.documentElement.classList.contains('dark') ? '#334155' : 'white' }),
        option: (styles, { isFocused, isSelected }) => ({ ...styles, backgroundColor: isSelected ? '#3b82f6' : isFocused ? (document.documentElement.classList.contains('dark') ? '#475569' : '#f1f5f9') : 'transparent', color: document.documentElement.classList.contains('dark') ? 'white' : '#334155' }),
    };
    if (isAuthLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-slate-500">Vérification de l'authentification...</p>
            </div>
        );
    }   

    return (
        <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
            <div className="max-w-2xl mx-auto">
                <button onClick={onCancel} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 font-semibold mb-6">
                    <ArrowLeft size={16} /> Retour à la liste
                </button>
                <div className="bg-white dark:bg-slate-800/80 p-8 rounded-lg shadow-sm border border-slate-200/80 dark:border-slate-700">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Ajouter un nouveau Client</h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="nomComplet" className="form-label mb-1">Nom complet <span className="text-red-500">*</span></label>
                            <input type="text" id="nomComplet" name="nomComplet" value={formData.nomComplet} onChange={handleInputChange} className={`form-input ${errors.nomComplet ? 'border-red-500' : ''}`} placeholder="Ex: Hôpital Central"/>
                            {errors.nomComplet && <p className="text-red-500 text-xs mt-1">{errors.nomComplet}</p>}
                        </div>
                        <div>
                            <label htmlFor="email" className="form-label mb-1">Email</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className="form-input" placeholder="Ex: contact@hopital.com" />
                        </div>

                        {/* NOUVEAU: Sélecteur de Pays avec react-select */}
                        <div>
                            <label className="form-label mb-1">Pays <span className="text-red-500">*</span></label>
                            <Select
                                options={countries}
                                value={selectedCountry}
                                onChange={setSelectedCountry}
                                styles={selectStyles}
                                placeholder="Rechercher un pays..."
                                isLoading={isLoadingCountries}
                                isClearable
                            />
                            {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                        </div>

                        {/* NOUVEAU: Sélecteur de Région avec react-select */}
                        <div>
                            <label className="form-label mb-1">Région <span className="text-red-500">*</span></label>
                            <Select
                                options={regions}
                                value={selectedRegion}
                                onChange={setSelectedRegion}
                                styles={selectStyles}
                                placeholder="Sélectionnez un pays d'abord..."
                                isDisabled={!selectedCountry}
                                isClearable
                            />
                            {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region}</p>}
                        </div>
                        
                        <div>
                            <label htmlFor="adress" className="form-label mb-1">Adresse</label>
                            <textarea id="adress" name="adress" value={formData.adress} onChange={handleInputChange} className="form-textarea" placeholder="Ex: 123 Rue de la Santé, Tunis" rows="2"></textarea>
                        </div>
                        <div className="pt-2">
                            <label className="flex items-center cursor-pointer">
                                <input type="checkbox" id="actif" name="actif" checked={formData.actif} onChange={handleInputChange} className="form-checkbox" />
                                <span className="ml-3 text-sm text-slate-700 dark:text-slate-300">Client actif</span>
                            </label>
                        </div>

                        <div className="pt-6 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700">
                            <button type="button" onClick={onCancel} className="btn btn-secondary">
                                <XCircle size={16} className="mr-2"/>Annuler
                            </button>
                            <button type="submit" className="btn btn-primary">
                                <Save size={16} className="mr-2"/>Créer le client
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AjouterClientPage;