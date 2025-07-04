import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User as UserIcon, Mail, X, KeyRound } from 'lucide-react'; // Ajout de X et KeyRound
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { useTranslation } from 'react-i18next';

import logoClinisys from '../assets/images/logoTRANSPARENT.png'; 
import { FaGoogle, FaFacebookF } from 'react-icons/fa';

// --- NOUVEAU : Composant pour la modale de mot de passe oublié ---
// J'ai créé ce composant directement ici pour garder tout au même endroit.
const ForgotPasswordModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    console.log(`Demande de récupération pour l'email : ${email}`);
    setStep(2);
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    console.log(`Code entré : ${code}`);
    setStep(3);
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }
    console.log(`Nouveau mot de passe défini : ${newPassword}`);
    alert("Mot de passe réinitialisé avec succès !");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 w-full max-w-md relative animate-in fade-in-0 zoom-in-95">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300">
          <X size={20} />
        </button>

        {step === 1 && (
          <div>
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-sky-100 text-sky-500">
                <Mail size={28} />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-center mb-4 text-slate-800 dark:text-slate-100">Récupérer votre mot de passe</h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-6 text-sm">Entrez votre email et nous vous enverrons un code.</p>
            <form onSubmit={handleEmailSubmit}>
              <div className="mb-4">
                <label htmlFor="reset-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input rounded-md"
                  placeholder="votre@email.com"
                  required
                />
              </div>
              <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-orange-500 hover:from-sky-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-300 transform hover:scale-102">
                Envoyer
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-orange-100 text-orange-500">
                <KeyRound size={28} />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-center mb-4 text-slate-800 dark:text-slate-100">Vérification du code</h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-6 text-sm">Un code a été envoyé à {email}. Veuillez l'entrer ci-dessous.</p>
            <form onSubmit={handleCodeSubmit}>
              <div className="mb-4">
                <label htmlFor="code" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Code de vérification</label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="form-input rounded-md text-center tracking-[0.5em]"
                  placeholder="------"
                  required
                />
              </div>
              <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-orange-500 hover:from-sky-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-300 transform hover:scale-102">
                Vérifier
              </button>
            </form>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-sky-100 text-sky-500">
                <Lock size={28} />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-center mb-4 text-slate-800 dark:text-slate-100">Nouveau mot de passe</h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-6 text-sm">Entrez votre nouveau mot de passe ci-dessous.</p>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nouveau mot de passe</label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input rounded-md"
                  required
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirmer le mot de passe</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input rounded-md"
                  required
                />
              </div>
              <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-orange-500 hover:from-sky-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-300 transform hover:scale-102">
                Réinitialiser
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};


// --- Composant principal de la page de connexion ---
const LoginPage = () => {
  const { t } = useTranslation();
  const [loginState, setLoginState] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // --- NOUVEAU : État pour contrôler la visibilité de la modale ---
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
    <> {/* Utilisation d'un Fragment pour encapsuler la page et la modale */}
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 grid grid-cols-1 md:grid-cols-2">
        
        {/* --- COLONNE DE GAUCHE : LE FORMULAIRE --- */}
        <div className="flex flex-col justify-center items-center p-6 md:p-12">
          <div className="w-full max-w-sm">
            {/* ... (le reste du formulaire ne change pas) ... */}
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
                
                {/* --- CHANGEMENT MAJEUR : Le lien devient un bouton qui ouvre la modale --- */}
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
              
              {/* ... (le reste de la page ne change pas) ... */}
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

        {/* --- COLONNE DE DROITE : PANNEAU DÉCORATIF --- */}
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

      {/* --- NOUVEAU : On appelle le composant de la modale ici --- */}
      <ForgotPasswordModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default LoginPage;