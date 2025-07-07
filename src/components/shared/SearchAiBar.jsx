import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader } from 'lucide-react'; // Importe Loader pour un état de chargement
import PropTypes from 'prop-types'; // Pour la validation des props

const SearchAiBar = ({ onSearch, placeholder = "Rechercher avec l'IA...", className }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const inputRef = useRef(null);

    const handleSearch = async () => {
        if (searchTerm.trim() === '') return; // Ne rien faire si la recherche est vide

        setIsSearching(true);
        // Simuler un appel API ou une logique de recherche AI
        try {
            await onSearch(searchTerm); // Appelle la fonction onSearch passée par le parent
        } catch (error) {
            console.error("Erreur lors de la recherche AI:", error);
            // Gérer l'erreur, peut-être avec un MessageAi de type 'error'
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
        <div className={`relative flex items-center ${className}`}>
            <input
                type="text"
                ref={inputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out"
                disabled={isSearching}
            />
            <button
                onClick={handleSearch}
                className="absolute left-3 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-500"
                aria-label="Rechercher"
                disabled={isSearching}
            >
                {isSearching ? <Loader size={18} className="animate-spin" /> : <Search size={18} />}
            </button>
            {searchTerm && !isSearching && (
                <button
                    onClick={clearSearch}
                    className="absolute right-3 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-500"
                    aria-label="Effacer la recherche"
                >
                    <X size={16} />
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