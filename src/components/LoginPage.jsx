import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { useTranslation } from 'react-i18next'; // <-- IMPORT useTranslation

import logoClinisysTransparent from '../assets/images/logoTRANSPARENT.png';
import fondEcranFlou from '../assets/images/fond.png';

const LoginPage = () => {
  const { t } = useTranslation(); // <-- USE the hook
  const [loginState, setLoginState] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login: authContextLogin } = useAuth(); 
  const navigate = useNavigate();

  const normalizeRoleForSwitch = (roleFromServer) => {
    if (!roleFromServer) return '';
    let normalized = String(roleFromServer).toLowerCase();
    if (normalized.startsWith('role_')) {
      normalized = normalized.substring(5);
    }
    return normalized;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const userData = await authContextLogin({ login: loginState, motDePasse: motDePasse });
      
      if (userData && userData.role) {
        const normalizedUserRole = normalizeRoleForSwitch(userData.role);
        
        switch (normalizedUserRole) { 
          case 'a': navigate('/admin'); break;
          case 'c': navigate('/chef'); break;
          case 'e': navigate('/employe'); break;
          default:
            setError(`Rôle utilisateur "${userData.role}" non supporté.`);
            authService.logout();
            break;
        }
      } else {
        setError("Connexion réussie, mais le rôle est manquant ou invalide.");
        authService.logout();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur de connexion est survenue.");
    } finally {
      setIsLoading(false);
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
            {t('pages.login.title', 'Bienvenue')} {/* <-- TRANSLATE */}
          </h2>
          <p className="text-center text-slate-300 mb-8">
            {t('pages.login.subtitle', 'Connectez-vous pour accéder à votre espace.')} {/* <-- TRANSLATE (Add this key to i18n.js if needed) */}
          </p>
          {error && (
            <div className="mb-6 p-3 bg-red-500 bg-opacity-30 text-red-200 border border-red-500 rounded-md text-sm text-center">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="login" className="block text-sm font-medium text-slate-300 mb-1">
                {t('pages.login.email', 'Login')} {/* <-- TRANSLATE */}
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
                  placeholder={t('pages.login.emailPlaceholder', 'Votre login')} 
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-700 bg-opacity-70 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                />
              </div>
            </div>
            <div>
              <label htmlFor="motDePasse" className="block text-sm font-medium text-slate-300 mb-1">
                {t('pages.login.password', 'Mot de passe')} {/* <-- TRANSLATE */}
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
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">{t('pages.login.rememberMe', 'Se souvenir de moi')}</label> {/* <-- TRANSLATE */}
                </div>
                <div className="text-sm">
                    <a href="#" className="font-medium text-sky-400 hover:text-sky-300 transition-colors">{t('pages.login.forgotPassword', 'Mot de passe oublié ?')}</a> {/* <-- TRANSLATE */}
                </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 disabled:opacity-70 disabled:cursor-not-allowed transition"
              >
                {isLoading ? t('pages.login.connecting', 'Connexion en cours...') : t('pages.login.connect', 'Se connecter')} {/* <-- TRANSLATE */}
              </button>
            </div>
          </form>
        </div>
        <p className="mt-8 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} Clinisys. {t('common.rightsReserved', 'Tous droits réservés.')} {/* <-- TRANSLATE */}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;