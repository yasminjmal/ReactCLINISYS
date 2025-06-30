// src/pages/Admin/Clients/EditClientModal.jsx

import React, { useState, useEffect } from 'react';
import { Save, XCircle } from 'lucide-react';
import Select from 'react-select';

// Supprimez cette ligne car vous utilisez des appels fetch directs maintenant
// import geoService from '../../../services/geoService';

const EditClientModal = ({ client, onUpdate, onCancel }) => {
    const [formData, setFormData] = useState({ nomComplet: '', email: '', adress: '', actif: true });
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState(null);

    const [countries, setCountries] = useState([]);
    const [regions, setRegions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Étape 1: Charger tous les pays au début
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const data = await fetch('http://localhost:9010/template-core/api/geo/countries').then(res => res.json());
                setCountries(data.map(c => ({ value: c.code, label: c.name })));
            } catch (err) {
                console.error("Erreur chargement pays dans EditClientModal:", err);
                setError("Erreur lors du chargement des pays.");
            }
        };
        fetchCountries();
    }, []);

    // Étape 2: Pré-remplir le formulaire, le pays et charger les régions du pays du client
    useEffect(() => {
        if (client && countries.length > 0) {
            setFormData({
                nomComplet: client.nomComplet || '',
                email: client.email || '',
                adress: client.adress || '',
                actif: client.actif ?? true,
            });

            const country = countries.find(c => c.value === client.countryCode);
            if (country) {
                setSelectedCountry(country);
                const fetchRegionsForClientCountry = async () => {
                    try {
                        const regionData = await fetch(`http://localhost:9010/template-core/api/geo/countries/${country.value}/regions`).then(res => res.json());
                        // Important: Assurez-vous que 'value' et 'label' correspondent à ce que votre API renvoie
                        // Si votre API renvoie un champ 'code' et 'name', utilisez-les.
                        // Ici, j'utilise 'name' pour les deux pour correspondre à votre logique précédente (regionName)
                        setRegions(regionData.map(r => ({ value: r.name, label: r.name })));
                        const clientRegion = regionData.find(r => r.name === client.regionName); // Chercher par 'name'
                        setSelectedRegion(clientRegion ? { value: clientRegion.name, label: clientRegion.name } : null);
                    } catch (err) {
                        console.error("Erreur chargement régions pour le client:", err);
                        setError("Erreur lors du chargement des régions du client.");
                    } finally {
                        setIsLoading(false);
                    }
                };
                fetchRegionsForClientCountry();
            } else {
                setIsLoading(false); // Pas de pays trouvé, donc pas de régions à charger
            }
        } else if (countries.length > 0) {
            setIsLoading(false);
        }
    }, [client, countries]);

    // Étape 3: Charger les régions quand l'utilisateur change de pays via le sélecteur
    useEffect(() => {
        if (selectedCountry) {
            const fetchRegionsOnCountryChange = async () => {
                try {
                    const data = await fetch(`http://localhost:9010/template-core/api/geo/countries/${selectedCountry.value}/regions`).then(res => res.json());
                    setRegions(data.map(r => ({ value: r.name, label: r.name }))); // Utilisez 'name' pour value et label
                    setSelectedRegion(null); // Réinitialiser la région lors du changement de pays
                } catch (error) {
                    console.error("Erreur lors du chargement des régions après changement de pays:", error);
                    setError("Erreur lors du chargement des régions.");
                    setRegions([]);
                    setSelectedRegion(null);
                }
            };
            fetchRegionsOnCountryChange();
        } else {
            setRegions([]);
            setSelectedRegion(null);
        }
    }, [selectedCountry]);


    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!formData.nomComplet || !formData.email) {
            setError("Le nom complet et l'email sont requis.");
            return;
        }
        if (!selectedCountry) {
            setError("Le pays est requis.");
            return;
        }

        const clientData = {
            ...formData,
            countryCode: selectedCountry?.value || '',
            regionName: selectedRegion?.value || '', // Utilisez .value ici car vous avez mappé 'name' à 'value'
        };
        onUpdate(client.id, clientData);
    };

    // Styles pour react-select (assurez-vous qu'ils sont complets et corrects)
    const selectStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: 'var(--bg-white-dark-slate-900-50)',
            borderColor: 'var(--border-slate-300-dark-slate-600)',
            color: 'var(--text-slate-900-dark-slate-100)',
            boxShadow: state.isFocused ? '0 0 0 1px var(--ring-blue-500)' : 'none',
            '&:hover': {
                borderColor: 'var(--border-blue-500)',
            },
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? 'var(--bg-blue-500)'
                : state.isFocused
                    ? 'var(--bg-blue-50)'
                    : 'var(--bg-white-dark-slate-800)',
            color: state.isSelected
                ? 'var(--text-white)'
                : 'var(--text-slate-900-dark-slate-100)',
            '&:active': {
                backgroundColor: 'var(--bg-blue-600)',
            },
        }),
        singleValue: (provided) => ({
            ...provided,
            color: 'var(--text-slate-900-dark-slate-100)',
        }),
        input: (provided) => ({
            ...provided,
            color: 'var(--text-slate-900-dark-slate-100)',
        }),
        placeholder: (provided) => ({
            ...provided,
            color: 'var(--placeholder-slate-400)',
        }),
    };

    if (!client || isLoading) return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto"></div>
                <p className="text-white mt-4">Chargement des données du client...</p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Modifier le Client</h2>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="nomComplet" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom Complet</label>
                        <input type="text" id="nomComplet" name="nomComplet" value={formData.nomComplet} onChange={handleInputChange} className="form-input" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className="form-input" />
                    </div>

                    {/* Sélecteur de Pays */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pays</label>
                        <Select
                            options={countries}
                            value={selectedCountry}
                            onChange={setSelectedCountry}
                            styles={selectStyles}
                            placeholder="Rechercher un pays..."
                            isClearable
                        />
                    </div>

                    {/* Sélecteur de Région */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Région</label>
                        <Select
                            options={regions}
                            value={selectedRegion}
                            onChange={setSelectedRegion}
                            styles={selectStyles}
                            isDisabled={!selectedCountry || regions.length === 0}
                            placeholder="Sélectionner une région..."
                            isClearable
                        />
                    </div>

                    <div>
                        <label htmlFor="adress" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Adresse</label>
                        <textarea id="adress" name="adress" value={formData.adress} onChange={handleInputChange} className="form-textarea" rows="2"></textarea>
                    </div>

                    <div className="flex items-center pt-2">
                        <input type="checkbox" id="actif" name="actif" checked={formData.actif} onChange={handleInputChange} className="form-checkbox" />
                        <label htmlFor="actif" className="ml-3 block text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Actif</label>
                    </div>

                    <div className="pt-6 flex justify-end space-x-2 border-t border-slate-200 dark:border-slate-700">
                        <button type="button" onClick={onCancel} className="btn btn-secondary">
                            <XCircle size={16} className="mr-1.5" /> Annuler
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <Save size={16} className="mr-1.5" /> Confirmer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditClientModal;