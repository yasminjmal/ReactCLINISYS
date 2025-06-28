import React, { useState, useEffect } from 'react';
import { Save, XCircle, ArrowLeft } from 'lucide-react';
import geoService from '../../../services/geoService'; // Importez le service geoService

const AjouterClientPage = ({ onAddClient, onCancel }) => {
    const [formData, setFormData] = useState({
        nomComplet: '',
        adress: '',
        email: '',
        region: '',
        actif: true,
        countryCode: 'TN', // Nouvelle propriété: code pays, Tunisie par défaut
    });
    const [errors, setErrors] = useState({});
    const [countries, setCountries] = useState([]); // Liste des pays
    const [regions, setRegions] = useState([]);     // Liste des régions pour le pays sélectionné

    // Charger les pays au montage
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const data = await geoService.getAllCountries();
                setCountries(data);
                // Si la Tunisie est présente, la présélectionner, sinon le premier pays
                const tunisia = data.find(c => c.code === 'TN');
                if (tunisia) {
                    setFormData(prev => ({ ...prev, countryCode: 'TN' }));
                    // Charger les régions de la Tunisie immédiatement
                    const tunisiaRegions = await geoService.getRegionsByCountryCode('TN');
                    setRegions(tunisiaRegions);
                } else if (data.length > 0) {
                    setFormData(prev => ({ ...prev, countryCode: data[0].code }));
                    const firstCountryRegions = await geoService.getRegionsByCountryCode(data[0].code);
                    setRegions(firstCountryRegions);
                }
            } catch (err) {
                console.error("Erreur lors du chargement des pays:", err);
                // Gérer l'erreur via toast ou autre
            }
        };
        fetchCountries();
    }, []);

    // Charger les régions quand le pays sélectionné dans formData change
    useEffect(() => {
        if (formData.countryCode) {
            const fetchRegions = async () => {
                try {
                    const data = await geoService.getRegionsByCountryCode(formData.countryCode);
                    setRegions(data);
                    // Si la région actuelle de formData n'est pas dans la nouvelle liste de régions, la vider
                    if (!data.some(r => r.name === formData.region)) {
                        setFormData(prev => ({ ...prev, region: '' }));
                    }
                } catch (err) {
                    console.error("Erreur lors du chargement des régions pour le pays:", formData.countryCode, err);
                }
            };
            fetchRegions();
        } else {
            setRegions([]); // Vider les régions si aucun pays sélectionné
        }
    }, [formData.countryCode]); // Déclenché par le changement de countryCode dans formData

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.nomComplet.trim()) {
            newErrors.nomComplet = "Le nom complet est requis.";
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Veuillez saisir une adresse email valide.";
        }
        // Validation pour Pays et Région
        if (!formData.countryCode) {
            newErrors.countryCode = "Le pays est requis.";
        }
        if (!formData.region) {
            newErrors.region = "La région est requise.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onAddClient(formData);
        }
    };

    return (
        <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 font-semibold mb-6 transition-colors duration-200"
                >
                    <ArrowLeft size={16} />
                    Retour à la liste des clients
                </button>

                <div className="bg-white dark:bg-slate-800/80 p-8 rounded-lg shadow-sm border border-slate-200/80 dark:border-slate-700">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Ajouter un nouveau Client</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="nomComplet" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom complet <span className="text-red-500">*</span></label>
                            <input type="text" id="nomComplet" name="nomComplet" value={formData.nomComplet} onChange={handleInputChange} className={`form-input ${errors.nomComplet ? 'border-red-500' : ''}`} placeholder="Ex: Hôpital Central" required />
                            {errors.nomComplet && <p className="text-red-500 text-xs mt-1">{errors.nomComplet}</p>}
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className={`form-input ${errors.email ? 'border-red-500' : ''}`} placeholder="Ex: contact@hopital.com" />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        {/* Sélecteur de Pays */}
                        <div>
                            <label htmlFor="countryCode" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pays <span className="text-red-500">*</span></label>
                            <select
                                id="countryCode"
                                name="countryCode" // Important pour le handleChange
                                value={formData.countryCode}
                                onChange={handleInputChange} // Utiliser handleInputChange pour mettre à jour formData.countryCode
                                className={`form-select w-full ${errors.countryCode ? 'border-red-500' : ''}`}
                                required
                            >
                                <option value="">Sélectionner un pays</option>
                                {countries.map(country => (
                                    <option key={country.code} value={country.code}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                            {errors.countryCode && <p className="text-red-500 text-xs mt-1">{errors.countryCode}</p>}
                        </div>

                        {/* Sélecteur de Région */}
                        <div>
                            <label htmlFor="region" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Région <span className="text-red-500">*</span></label>
                            <select
                                id="region"
                                name="region"
                                value={formData.region}
                                onChange={handleInputChange}
                                className={`form-select w-full ${errors.region ? 'border-red-500' : ''}`}
                                required
                                disabled={!formData.countryCode || regions.length === 0} // Désactivé si pas de pays sélectionné ou pas de régions
                            >
                                <option value="">Sélectionner une région</option>
                                {regions.map(region => (
                                    <option key={region.code} value={region.name}>
                                        {region.name}
                                    </option>
                                ))}
                            </select>
                            {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region}</p>}
                        </div>
                        
                        <div>
                            <label htmlFor="adress" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Adresse</label>
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