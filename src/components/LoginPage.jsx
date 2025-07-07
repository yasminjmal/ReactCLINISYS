// src/components/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User as UserIcon, Mail, X, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { useTranslation } from 'react-i18next';

import logoClinisys from '../assets/images/logoTRANSPARENT.png'; 
import { FaGoogle, FaFacebookF } from 'react-icons/fa';
import ForgotPasswordModal from './auth/ForgotPasswordModal'; // Import the new modal

const LoginPage = () => {
  const { t } = useTranslation();
  const [loginState, setLoginState] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State to control the visibility of the modal
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    <>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 grid grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col justify-center items-center p-6 md:p-12">
          <div className="w-full max-w-sm">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full border-2 border-slate-300 flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-slate-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100">
              Connectez vous à votre compte
            </h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-6 text-sm">
              Accédez à votre espace CliniSys
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded-md text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="login" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <span className="flex items-center"><Mail size={14} className="mr-2" />Login</span>
                </label>
                <input
                  id="login"
                  name="login"
                  type="text"
                  autoComplete="username"
                  required
                  value={loginState}
                  onChange={(e) => setLoginState(e.target.value)}
                  placeholder="Votre login ou email"
                  className="form-input"
                />
              </div>
              <div>
                <label htmlFor="motDePasse" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <span className="flex items-center"><Lock size={14} className="mr-2" />Mot de passe</span>
                </label>
                <div className="relative">
                  <input
                    id="motDePasse"
                    name="motDePasse"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    placeholder="••••••••"
                    className="form-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"/>
                  <span className="ml-2 text-slate-600 dark:text-slate-400">Se souvenir de moi</span>
                </label>
                
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="font-medium text-sky-600 hover:text-sky-800"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-orange-500 hover:from-sky-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-70 transition-all duration-300 transform hover:scale-105"
                >
                  {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                </button>
              </div>
              
              <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-300"></div>
                  <div className="flex-grow border-t border-slate-300"></div>
              </div>
              
              <p className="text-center text-xs text-slate-500">
                @2025 Clinisys. Tous droits réservés.
              </p>
            </form>
          </div>
        </div>

        <div className="hidden md:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-sky-400 to-orange-400 relative overflow-hidden">
          <div className="absolute -top-20 -left-40 w-96 h-96 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-32 -right-20 w-80 h-80 bg-white/20 rounded-full"></div>
          
          <div className="text-center z-10 text-white">
            <img src={logoClinisys} alt="Logo Clinisys" className="h-52 w-auto mx-auto mb-10 drop-shadow-lg" />
            <h1 className="text-4xl font-extrabold tracking-tight drop-shadow-md">
              Gestion Intelligente, Soins Optimisés
            </h1>
            <p className="mt-4 text-lg max-w-lg mx-auto text-sky-100 drop-shadow">
              Notre plateforme centralise la gestion des tickets, des équipes et des modules pour une efficacité maximale et une meilleure prise de décision.
            </p>
          </div>
        </div>
      </div>

      <ForgotPasswordModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default LoginPage;