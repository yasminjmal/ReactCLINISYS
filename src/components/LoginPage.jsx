import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Importe le hook useAuth
import authService from '../services/authService'; // Importe votre service d'authentification

import logoClinisysTransparent from '../assets/images/logoTRANSPARENT.png';
import fondEcranFlou from '../assets/images/fond.png';

const LoginPage = () => {
  const [loginState, setLoginState] = useState(''); // État pour le champ login
  const [motDePasse, setMotDePasse] = useState(''); // État pour le champ mot de passe
  const [showPassword, setShowPassword] = useState(false); // État pour afficher/masquer le mot de passe
  const [isLoading, setIsLoading] = useState(false); // État pour le chargement (bouton désactivé)
  const [error, setError] = useState(''); // Message d'erreur à afficher

  // Récupère la fonction de login du contexte d'authentification.
  // Renommée 'authContextLogin' pour éviter un conflit de nom avec l'état 'loginState'.
  const { login: authContextLogin } = useAuth(); 
  const navigate = useNavigate(); // Hook pour la navigation programmatique

  // Fonction utilitaire pour normaliser les rôles (si nécessaire pour la redirection)
  const normalizeRoleForSwitch = (roleFromServer) => {
    if (!roleFromServer) return '';
    let normalized = String(roleFromServer).toLowerCase();
    if (normalized.startsWith('role_')) {
      normalized = normalized.substring(5); // Enlève "role_"
    }
    return normalized; // Ex: "admin", "chef_equipe", "employe"
  };

  // Gère la soumission du formulaire de connexion
  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le comportement par défaut du formulaire (rechargement de la page)
    setIsLoading(true); // Active l'état de chargement
    setError(''); // Réinitialise les messages d'erreur

    try {
      // Appelle la fonction de login du contexte, en lui passant les identifiants
      // Cette fonction interagit avec authService.login() et met à jour l'état global.
      const userData = await authContextLogin({ login: loginState, motDePasse: motDePasse });
      
      console.log("LoginPage: userData reçu après authContextLogin:", userData);

      // Logique de redirection basée sur le rôle de l'utilisateur
      if (userData && userData.role) {
        const normalizedUserRole = normalizeRoleForSwitch(userData.role);
        console.log(`LoginPage: Rôle original: "${userData.role}", Rôle normalisé pour switch: "${normalizedUserRole}"`);
        
        switch (normalizedUserRole) { 
          case 'a':
            console.log("LoginPage: Redirection vers /admin");
            navigate('/admin'); 
            break;
          case 'c': 
            console.log("LoginPage: Redirection vers /chef");
            navigate('/chef');
            break;
          case 'e': 
            console.log("LoginPage: Redirection vers /employe");
            navigate('/employe');
            break;
          default:
            console.warn('LoginPage: Rôle utilisateur non reconnu après normalisation. Rôle original:', userData.role, 'Normalisé:', normalizedUserRole);
            setError(`Rôle utilisateur "${userData.role}" non supporté pour la redirection.`);
            // Si le rôle n'est pas géré, déconnectez pour des raisons de sécurité
            authService.logout(); // Nettoie le localStorage et l'état
            break;
        }
      } else {
        setError("Connexion réussie, mais le rôle de l'utilisateur est manquant ou invalide.");
        authService.logout(); // Déconnectez si les données de rôle sont invalides
      }
    } catch (err) {
      // Gestion des erreurs de connexion (par exemple, "Nom d'utilisateur ou mot de passe incorrect")
      setError(err.response?.data?.message || "Une erreur de connexion est survenue.");
      console.error("LoginPage: Erreur lors du handleSubmit:", err);
    } finally {
      setIsLoading(false); // Désactive l'état de chargement
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4 selection:bg-sky-500 selection:text-white"
      style={{ backgroundImage: `url(${fondEcranFlou})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="w-full max-w-md">
        <div className="bg-slate-800 bg-opacity-50 backdrop-blur-xl shadow-2xl rounded-xl p-8 md:p-10">
          <div className="flex justify-center mb-10">
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
              <label htmlFor="login" className="block text-sm font-medium text-slate-300 mb-1">
                Login
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="login"
                  name="login"
                  type="text"
                  autoComplete="username"
                  required
                  value={loginState}
                  onChange={(e) => setLoginState(e.target.value)}
                  placeholder="Votre login"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-700 bg-opacity-70 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                />
              </div>
            </div>
            <div>
              <label htmlFor="motDePasse" className="block text-sm font-medium text-slate-300 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="motDePasse"
                  name="motDePasse"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-700 bg-opacity-70 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                  aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-sky-500 bg-slate-600 border-slate-500 rounded focus:ring-sky-500 focus:ring-offset-slate-800" />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">Se souvenir de moi</label>
                </div>
                <div className="text-sm">
                    <a href="#" className="font-medium text-sky-400 hover:text-sky-300 transition-colors">Mot de passe oublié ?</a>
                </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 disabled:opacity-70 disabled:cursor-not-allowed transition"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion en cours...
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

export default LoginPage;