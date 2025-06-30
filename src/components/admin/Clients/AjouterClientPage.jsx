// src/pages/Admin/Clients/AjouterClientPage.jsx
import React, { useState, useEffect } from 'react';
import { Save, XCircle, ArrowLeft, X } from 'lucide-react';
import Select from 'react-select';
// Supprimez l'import de geoService car le géocodage se fera au backend
// import geoService from '../../../services/geoService'; // <<--- C'est ICI qu'il faut supprimer cette ligne
import { useAuth } from '../../../context/AuthContext';
import clientService from '../../../services/clientService'; // Importez votre service client

const AjouterClientPage = ({ onAddClient, onCancel, clientToEdit }) => {
    const [formData, setFormData] = useState({
        nomComplet: '',
        adress: '',
        email: '',
        actif: true,
        countryCode: '', // Gardez ces champs pour les envoyer au backend
        regionName: '',
    });

    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

    const [errors, setErrors] = useState({});

    const [countries, setCountries] = useState([]);
    const [regions, setRegions] = useState([]);
    const [isLoadingCountries, setIsLoadingCountries] = useState(true);
    const [isEditing, setIsEditing] = useState(false); // Ajout pour gérer l'édition

    // Charger les pays au premier rendu du composant
    useEffect(() => {
        if (isAuthLoading || !isAuthenticated) {
            return;
        }

        const fetchCountries = async () => {
            try {
                const data = await fetch('http://localhost:9010/template-core/api/geo/countries').then(res => res.json()); // Utilisez votre endpoint API pour les pays
                setCountries(data.map(c => ({ value: c.code, label: c.name })));
            } catch (error) {
                console.error("Erreur lors du chargement des pays:", error);
                setErrors(prev => ({ ...prev, general: "Erreur lors du chargement des pays." }));
            } finally {
                setIsLoadingCountries(false);
            }
        };
        fetchCountries();
    }, [isAuthLoading, isAuthenticated]);

    // Pré-remplir le formulaire si un client est en cours d'édition
    useEffect(() => {
        if (clientToEdit) {
            setIsEditing(true);
            setFormData({
                nomComplet: clientToEdit.nomComplet || '',
                adress: clientToEdit.adress || '',
                email: clientToEdit.email || '',
                actif: clientToEdit.actif !== undefined ? clientToEdit.actif : true,
                countryCode: clientToEdit.countryCode || '',
                regionName: clientToEdit.regionName || '',
            });

            // Trouver et définir le pays sélectionné
            if (clientToEdit.countryCode && countries.length > 0) {
                const country = countries.find(c => c.value === clientToEdit.countryCode);
                setSelectedCountry(country);
            }
        } else {
            setIsEditing(false);
            setFormData({
                nomComplet: '',
                adress: '',
                email: '',
                actif: true,
                countryCode: '',
                regionName: '',
            });
            setSelectedCountry(null);
            setSelectedRegion(null);
        }
    }, [clientToEdit, countries]);

    // Charger les régions lorsque le pays sélectionné change
    useEffect(() => {
        if (selectedCountry) {
            const fetchRegions = async () => {
                try {
                    const data = await fetch(`http://localhost:9010/template-core/api/geo/countries/${selectedCountry.value}/regions`).then(res => res.json());
                    setRegions(data.map(r => ({ value: r.name, label: r.name }))); // Utilisez 'name' pour value et label
                    // Si en édition et que la région existe, la pré-sélectionner
                    if (isEditing && formData.regionName && data.some(r => r.name === formData.regionName)) {
                        setSelectedRegion({ value: formData.regionName, label: formData.regionName });
                    } else {
                        setSelectedRegion(null);
                    }
                } catch (error) {
                    console.error("Erreur lors du chargement des régions:", error);
                    setRegions([]); // Vider les régions en cas d'erreur
                    setSelectedRegion(null);
                }
            };
            fetchRegions();
        } else {
            setRegions([]);
            setSelectedRegion(null);
        }
    }, [selectedCountry, isEditing, formData.regionName]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCountryChange = (selectedOption) => {
        setSelectedCountry(selectedOption);
        setSelectedRegion(null); // Réinitialiser la région lors du changement de pays
        setFormData(prev => ({
            ...prev,
            countryCode: selectedOption ? selectedOption.value : '',
            regionName: '', // Effacer la région du formData
        }));
    };

    const handleRegionChange = (selectedOption) => {
        setSelectedRegion(selectedOption);
        setFormData(prev => ({
            ...prev,
            regionName: selectedOption ? selectedOption.value : '',
        }));
    };

    const validateForm = () => {
        let newErrors = {};
        if (!formData.nomComplet.trim()) {
            newErrors.nomComplet = "Le nom complet est requis.";
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "L'email n'est pas valide.";
        }
        // Pas besoin de valider lat/lng ici
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        try {
            const clientToSave = {
                ...formData,
                countryCode: selectedCountry ? selectedCountry.value : '',
                regionName: selectedRegion ? selectedRegion.value : '', // Utilisez selectedRegion.value car vous avez mappé 'name' à 'value' dans les options
            };

            if (isEditing) {
                await clientService.updateClient(clientToEdit.id, clientToSave);
                // Si la modification est réussie, appelez onAddClient avec l'ID pour le surlignage
                onAddClient(clientToEdit.id);
            } else {
                // Pour la création, la réponse contient l'objet client créé avec son ID
                const response = await clientService.createClient(clientToSave);
                // Si votre backend renvoie l'ID dans response.data.id
                onAddClient(response.data?.id); // Passez l'ID du nouveau client à la fonction parente
            }
            onCancel(); // Fermez le modal/page d'ajout/édition après succès
        } catch (error) {
            console.error("Erreur lors de la sauvegarde du client:", error);
            const errorMessage = error.response?.data?.message || "Erreur lors de la sauvegarde du client. Veuillez réessayer.";
            setErrors(prev => ({ ...prev, general: errorMessage }));
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg p-6 relative">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{isEditing ? "Modifier le client" : "Ajouter un nouveau client"}</h3>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[70vh]">
                    <form onSubmit={handleSubmit}>
                        {errors.general && <p className="text-red-500 text-sm mb-4">{errors.general}</p>}

                        <div className="mb-4">
                            <label htmlFor="nomComplet" className="form-label mb-1">Nom Complet</label>
                            <input
                                type="text"
                                id="nomComplet"
                                name="nomComplet"
                                value={formData.nomComplet}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="Nom et prénom du client"
                            />
                            {errors.nomComplet && <p className="text-red-500 text-sm mt-1">{errors.nomComplet}</p>}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="email" className="form-label mb-1">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="client@exemple.com"
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        {/* Champs Pays et Région */}
                        <div className="mb-4">
                            <label htmlFor="country" className="form-label mb-1">Pays</label>
                            <Select
                                id="country"
                                name="country"
                                options={countries}
                                value={selectedCountry}
                                onChange={handleCountryChange}
                                isLoading={isLoadingCountries}
                                isClearable
                                placeholder="Sélectionner un pays"
                                classNamePrefix="react-select"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="region" className="form-label mb-1">Région (Gouvernorat)</label>
                            <Select
                                id="region"
                                name="region"
                                options={regions}
                                value={selectedRegion}
                                onChange={handleRegionChange}
                                isClearable
                                placeholder="Sélectionner une région"
                                isDisabled={!selectedCountry || regions.length === 0} // Désactivé si pas de pays sélectionné
                                classNamePrefix="react-select"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="adress" className="form-label mb-1">Adresse</label>
                            <textarea
                                id="adress"
                                name="adress"
                                value={formData.adress}
                                onChange={handleInputChange}
                                className="form-textarea"
                                placeholder="Ex: 123 Rue de la Santé, Tunis"
                                rows="2"
                            ></textarea>
                        </div>

                        <div className="pt-2">
                            <label className="flex items-center cursor-pointer">
                                <input type="checkbox" id="actif" name="actif" checked={formData.actif} onChange={handleInputChange} className="form-checkbox" />
                                <span className="ml-3 text-sm text-slate-700 dark:text-slate-300">Client actif</span>
                            </label>
                        </div>

                        <div className="pt-6 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700">
                            <button type="button" onClick={onCancel} className="btn btn-secondary">
                                <XCircle size={16} className="mr-2" />Annuler
                            </button>
                            <button type="submit" className="btn btn-primary" >
                                <Save size={16} className="mr-2" />{isEditing ? "Modifier le client" : "Créer le client"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AjouterClientPage;