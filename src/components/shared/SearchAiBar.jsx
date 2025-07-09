import React, { useState, useRef } from 'react';
import { X, Loader } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Icône circulaire avec un anneau en dégradé animé.
 * L'animation est définie dans tailwind.config.js.
 */
const GradientIcon = () => (
    <div 
        className="
            w-7 h-7 rounded-full p-1 
            bg-gradient-to-br from-purple-900 via-blue-500 to-teal-400 
            bg-[length:200%_200%]
            animate-gradient
        "
    >
        <div className="w-full  h-full rounded-full bg-slate-100" />
    </div>
);

/**
 * Barre de recherche avec une icône animée et une gestion de l'état de recherche.
 */
const SearchAiBar = ({ onSearch, placeholder = "Ask Meta AI or Search...", className }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const inputRef = useRef(null);

    const handleSearch = async () => {
        if (searchTerm.trim() === '') return; // Ne rien faire si la recherche est vide

        setIsSearching(true);
        try {
            // Appelle la fonction onSearch passée par le composant parent
            await onSearch(searchTerm); 
        } catch (error) {
            console.error("Erreur lors de la recherche AI:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const clearSearch = () => {
        setSearchTerm('');
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <div className={`relative flex items-center w-full max-w-md p-1 rounded-full bg-slate-200 shadow-lg ${className}`}>
            
            {/* Affiche le loader ou l'icône animée */}
            <div className="absolute left-3 flex items-center justify-center h-full ">
                {isSearching ? <Loader size={20} className="text-slate-400 animate-spin" /> : <GradientIcon />}
            </div>

            <input
                type="text"
                ref={inputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                className="w-full pl-10 pr-10 py-2 rounded-full bg-transparent text-slate-900 placeholder-slate-500 focus:outline-none transition-colors duration-200 ease-in-out"
                disabled={isSearching}
            />

            {/* Affiche le bouton pour effacer uniquement si du texte est présent */}
            {searchTerm && !isSearching && (
                <button
                    onClick={clearSearch}
                    className="absolute right-3 text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label="Effacer la recherche"
                >
                    <X size={18} />
                </button>
            )}
        </div>
    );
};

SearchAiBar.propTypes = {
    onSearch: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    className: PropTypes.string,
};

export default SearchAiBar;