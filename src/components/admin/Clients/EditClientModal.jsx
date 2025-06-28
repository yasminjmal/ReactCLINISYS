// src/pages/Admin/Clients/EditClientModal.jsx
import React, { useState, useEffect } from 'react';
import { Save, XCircle } from 'lucide-react';
import geoService from '../../../services/geoService'; // Importez le service geoService

const EditClientModal = ({ client, onUpdate, onCancel, showTemporaryMessage }) => { // Ajoutez showTemporaryMessage
    const [formData, setFormData] = useState({
        nomComplet: '',
        email: '',
        adress: '',
        region: '',
        actif: true,
        countryCode: '', // Nouvelle propriété
    });
    const [error, setError] = useState('');
    const [countries, setCountries] = useState([]);
    const [regions, setRegions] = useState([]);

    // Charger les données du client et les pays au montage
    useEffect(() => {
        if (client) {
            setFormData({
                nomComplet: client.nomComplet || '',
                email: client.email || '',
                adress: client.adress || '',
                region: client.region || '',
                actif: client.actif ?? true,
                countryCode: client.countryCode || '', // Si client a déjà un countryCode, le présélectionner
            });

            const fetchCountries = async () => {
                try {
                    const data = await geoService.getAllCountries();
                    setCountries(data);
                    // Trouver le code du pays pour la région du client actuel
                    // Cela suppose qu'une région est unique à un pays, ou que le client.countryCode est déjà là
                    if (client.region && !client.countryCode) {
                        // Chercher le pays de la région actuelle du client si le countryCode n'est pas déjà défini
                        const foundCountry = data.find(c => c.regions.some(r => r.name === client.region));
                        if (foundCountry) {
                            setFormData(prev => ({ ...prev, countryCode: foundCountry.code }));
                        }
                    }
                } catch (err) {
                    console.error("Erreur lors du chargement des pays:", err);
                    if(showTemporaryMessage) showTemporaryMessage('error', 'Impossible de charger les pays.');
                }
            };
            fetchCountries();
        }
    }, [client, showTemporaryMessage]); // Déclenché quand client change

    // Charger les régions quand le pays sélectionné dans formData change
    useEffect(() => {
        if (formData.countryCode) {
            const fetchRegions = async () => {
                try {
                    const data = await geoService.getRegionsByCountryCode(formData.countryCode);
                    setRegions(data);
                    // Garder la région existante si elle est dans la nouvelle liste
                    if (client.region && data.some(r => r.name === client.region)) {
                         setFormData(prev => ({ ...prev, region: client.region }));
                    } else if (client.countryCode === formData.countryCode) {
                        // Si on revient sur le pays d'origine du client, garder sa région
                         setFormData(prev => ({ ...prev, region: client.region || '' }));
                    } else {
                        // Sinon, vider la région
                        setFormData(prev => ({ ...prev, region: '' }));
                    }
                } catch (err) {
                    console.error("Erreur lors du chargement des régions pour le pays:", formData.countryCode, err);
                    if(showTemporaryMessage) showTemporaryMessage('error', 'Impossible de charger les régions.');
                }
            };
            fetchRegions();
        } else {
            setRegions([]);
            setFormData(prev => ({ ...prev, region: '' }));
        }
    }, [formData.countryCode, client]); // Déclenché par le changement de countryCode dans formData ou quand client change

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.nomComplet.trim()) {
            setError('Le nom complet est requis.');
            return;
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Veuillez saisir une adresse email valide.');
            return;
        }
        // Validation pour Pays et Région
        if (!formData.countryCode) {
            setError("Le pays est requis.");
            return;
        }
        if (!formData.region) {
            setError("La région est requise.");
            return;
        }

        onUpdate(client.id, formData);
    };

    if (!client) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Modifier le Client</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Champ Nom Complet */}
                    <div>
                        <label htmlFor="edit-nomComplet" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom Complet</label>
                        <input type="text" id="edit-nomComplet" name="nomComplet" value={formData.nomComplet} onChange={handleInputChange} className={`form-input ${error && error.includes('nom complet') ? 'border-red-500' : ''}`} />
                        {error && error.includes('nom complet') && <p className="text-xs text-red-500 mt-1">{error}</p>}
                    </div>
                    {/* Champ Email */}
                    <div>
                        <label htmlFor="edit-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                        <input type="email" id="edit-email" name="email" value={formData.email} onChange={handleInputChange} className={`form-input ${error && error.includes('email') ? 'border-red-500' : ''}`} />
                        {error && error.includes('email') && <p className="text-xs text-red-500 mt-1">{error}</p>}
                    </div>

                    {/* Sélecteur de Pays */}
                    <div>
                        <label htmlFor="edit-countryCode" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pays</label>
                        <select
                            id="edit-countryCode"
                            name="countryCode"
                            value={formData.countryCode}
                            onChange={handleInputChange}
                            className="form-select w-full"
                        >
                            <option value="">Sélectionner un pays</option>
                            {countries.map(country => (
                                <option key={country.code} value={country.code}>
                                    {country.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sélecteur de Région */}
                    <div>
                        <label htmlFor="edit-region" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Région</label>
                        <select
                            id="edit-region"
                            name="region"
                            value={formData.region}
                            onChange={handleInputChange}
                            className="form-select w-full"
                            disabled={!formData.countryCode || regions.length === 0}
                        >
                            <option value="">Sélectionner une région</option>
                            {regions.map(region => (
                                <option key={region.code} value={region.name}>
                                    {region.name}
                                </option>
                            ))}
                        </select>
                         {error && error.includes('Région') && <p className="text-xs text-red-500 mt-1">{error}</p>}
                    </div>

                    {/* Champ Adresse */}
                    <div>
                        <label htmlFor="edit-adress" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Adresse</label>
                        <textarea id="edit-adress" name="adress" value={formData.adress} onChange={handleInputChange} className="form-textarea" rows="2"></textarea>
                    </div>
                    {/* Champ Actif (Checkbox) */}
                    <div className="flex items-center pt-2">
                        <input type="checkbox" id="edit-actif" name="actif" checked={formData.actif} onChange={handleInputChange} className="form-checkbox" />
                        <label htmlFor="edit-actif" className="ml-3 block text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Actif</label>
                    </div>
                    {/* Boutons d'action */}
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