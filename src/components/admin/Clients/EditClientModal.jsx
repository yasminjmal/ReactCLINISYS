import React, { useState, useEffect } from 'react';
import { Save, XCircle } from 'lucide-react';
import Select from 'react-select'; // Importer
import geoService from '../../../services/geoService';

const EditClientModal = ({ client, onUpdate, onCancel }) => {
    const [formData, setFormData] = useState({ nomComplet: '', email: '', adress: '', actif: true });
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState(null);

    const [countries, setCountries] = useState([]);
    const [regions, setRegions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Étape 1: Charger tous les pays au début
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const data = await geoService.getAllCountries();
                const countryOptions = data.map(c => ({ value: c.code, label: c.name, regions: c.regions }));
                setCountries(countryOptions);
            } catch (err) {
                console.error("Erreur chargement pays:", err);
            }
        };
        fetchCountries();
    }, []);

    // Étape 2: Pré-remplir le formulaire et le pays quand le client et les pays sont disponibles
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
            }
            setIsLoading(false);
        }
    }, [client, countries]);

    // Étape 3: Mettre à jour les régions et pré-sélectionner la bonne région
    useEffect(() => {
        if (selectedCountry) {
            const regionOptions = selectedCountry.regions.map(r => ({ value: r.code, label: r.name }));
            setRegions(regionOptions);

            // Si on charge le client, trouver sa région
            if (client && client.countryCode === selectedCountry.value) {
                const region = regionOptions.find(r => r.label === client.regionName);
                if (region) {
                    setSelectedRegion(region);
                }
            } else {
                 setSelectedRegion(null); // Réinitialiser si le pays change
            }
        }
    }, [selectedCountry, client]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const clientData = {
            ...formData,
            countryCode: selectedCountry?.value,
            regionName: selectedRegion?.label,
        };
        onUpdate(client.id, clientData);
    };

    // Styles pour react-select... (identiques à ceux de la page d'ajout)
    const selectStyles = { /* ... collez les styles d'en haut ici ... */ };

    if (!client || isLoading) return <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div></div>;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" style={{ /* ... collez les variables de style ici ... */ }}>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Modifier le Client</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ... champs de texte ... */}

                    {/* Sélecteur de Pays */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pays</label>
                        <Select
                            options={countries}
                            value={selectedCountry}
                            onChange={setSelectedCountry}
                            styles={selectStyles}
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
                            isDisabled={!selectedCountry}
                        />
                    </div>
                    
                    {/* ... reste du formulaire ... */}
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