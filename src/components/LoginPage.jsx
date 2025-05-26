import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, User as UserIcon, LogOut, Shield, Users, Briefcase } from 'lucide-react';

// Importation correcte des images depuis src/assets/images/
// Le chemin est relatif à l'emplacement de LoginPage.jsx (src/components/LoginPage.jsx)
import logoClinisysTransparent from '../assets/images/logoTRANSPARENT.png'; //
import fondEcranFlou from '../assets/images/fond.png'; //


// --- Données Statiques des Utilisateurs ---
const mockUsers = [
  { username: 'admin', password: 'admin', role: 'admin', name: 'Administrateur Principal' },
  { username: 'chef', password: 'chef', role: 'chef_equipe', name: 'Chef Michel' },
  { username: 'employe', password: 'employe', role: 'employe', name: 'Employé Jean' },
];

// --- Composant LoginPage ---
const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const user = mockUsers.find(
        (u) => u.username === username && u.password === password
      );

      if (user) {
        onLoginSuccess(user);
      } else {
        setError("Nom d'utilisateur ou mot de passe incorrect.");
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4 selection:bg-sky-500 selection:text-white"
      style={{
        backgroundImage: `url(${fondEcranFlou})`, // Utilisation de la variable importée
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="w-full max-w-md">
        <div className="bg-slate-800 bg-opacity-50 backdrop-blur-xl shadow-2xl rounded-xl p-8 md:p-10">
          <div className="flex justify-center mb-10">
            {/* Utilisation de la variable importée pour le logo */}
            <img src={logoClinisysTransparent} alt="Logo Clinisys" className="h-28 w-56 object-contain" />
          </div>
          <h2 className="text-3xl font-bold text-center text-slate-100 mb-2">
            Bienvenue
          </h2>
          <p className="text-center text-slate-300 mb-8">
            Connectez-vous pour accéder à votre espace.
          </p>
          {error && (
            <div className="mb-6 p-3 bg-red-500 bg-opacity-30 text-red-200 border border-red-500 rounded-md text-sm text-center">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Nom d'utilisateur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Votre nom d'utilisateur"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-700 bg-opacity-70 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition duration-150 ease-in-out"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-700 bg-opacity-70 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition duration-150 ease-in-out"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-sky-500 bg-slate-600 border-slate-500 rounded focus:ring-sky-500 focus:ring-offset-slate-800"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-slate-300"
                >
                  Se souvenir de moi
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-sky-400 hover:text-sky-300 transition-colors">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 disabled:opacity-70 disabled:cursor-not-allowed transition duration-150 ease-in-out transform hover:scale-105 active:scale-100"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Chargement...
                  </>
                ) : (
                  'Se connecter'
                )}
              </button>
            </div>
          </form>
        </div>
        <p className="mt-8 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} Clinisys. Tous droits réservés.
        </p>
      </div>
    </div>
  );
};

// --- Composant Interface Admin ---
const AdminInterface = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
      <Shield size={64} className="text-sky-400 mb-6" />
      <h1 className="text-4xl font-bold mb-4">Interface Administrateur</h1>
      <p className="text-2xl mb-8">Bienvenue, {user.name} !</p>
      <button
        onClick={onLogout}
        className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold flex items-center space-x-2 transition-colors"
      >
        <LogOut size={20} />
        <span>Se déconnecter</span>
      </button>
    </div>
  );
};

// --- Composant Interface Chef d'Équipe ---
const ChefEquipeInterface = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-slate-800 text-white flex flex-col items-center justify-center p-8">
      <Users size={64} className="text-teal-400 mb-6" />
      <h1 className="text-4xl font-bold mb-4">Interface Chef d'Équipe</h1>
      <p className="text-2xl mb-8">Bienvenue, {user.name} !</p>
      <button
        onClick={onLogout}
        className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold flex items-center space-x-2 transition-colors"
      >
        <LogOut size={20} />
        <span>Se déconnecter</span>
      </button>
    </div>
  );
};
export default LoginPage;