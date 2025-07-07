// src/components/auth/ForgotPasswordModal.jsx
import { useState } from 'react';
import { Mail, KeyRound, Lock, X, Loader } from 'lucide-react';
import passwordResetService from '../../services/passwordResetService';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleClose = () => {
    onClose();
    // Reset state after a short delay
    setTimeout(() => {
        setStep(1);
        setEmail('');
        setCode('');
        setNewPassword('');
        setConfirmPassword('');
        setResetToken('');
        setError('');
        setSuccessMessage('');
    }, 300);
  };
  
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await passwordResetService.forgotPassword(email);
      setSuccessMessage(`Un code a été envoyé à ${email}.`);
      setStep(2);
    } catch (err) {
      setError(err.response?.data || "Utilisateur non trouvé ou erreur serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await passwordResetService.verifyCode(email, code);
      setResetToken(response.data.resetToken);
      setSuccessMessage('Code vérifié avec succès. Veuillez définir un nouveau mot de passe.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data || "Code invalide ou expiré.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas !");
      return;
    }
    if (newPassword.length < 8) {
        setError("Le mot de passe doit contenir au moins 8 caractères.");
        return;
    }
    setIsLoading(true);
    setError('');
    try {
      await passwordResetService.resetPassword(email, newPassword, resetToken);
      setSuccessMessage('Votre mot de passe a été réinitialisé avec succès ! Vous pouvez maintenant vous connecter.');
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (err) {
      setError(err.response?.data || "Erreur lors de la réinitialisation du mot de passe.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <div className="flex justify-center mb-5"><div className="w-14 h-14 rounded-full flex items-center justify-center bg-sky-100 text-sky-500"><Mail size={28} /></div></div>
            <h2 className="text-xl font-semibold text-center mb-2 text-slate-800 dark:text-slate-100">Mot de passe oublié ?</h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-6 text-sm">Pas de panique. Entrez votre email et nous vous enverrons un code de réinitialisation.</p>
            <form onSubmit={handleEmailSubmit}>
              <div className="mb-4">
                <label htmlFor="reset-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                <input id="reset-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input rounded-md" placeholder="votre@email.com" required />
              </div>
              <button type="submit" className="w-full btn btn-primary transition-all duration-300 transform hover:scale-102" disabled={isLoading}>
                {isLoading ? <Loader className="animate-spin" /> : 'Envoyer le code'}
              </button>
            </form>
          </div>
        );
      case 2:
        return (
          <div>
            <div className="flex justify-center mb-5"><div className="w-14 h-14 rounded-full flex items-center justify-center bg-orange-100 text-orange-500"><KeyRound size={28} /></div></div>
            <h2 className="text-xl font-semibold text-center mb-2 text-slate-800 dark:text-slate-100">Vérification</h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-6 text-sm">Un code vous a été envoyé. Veuillez le saisir ci-dessous.</p>
            <form onSubmit={handleCodeSubmit}>
              <div className="mb-4">
                <label htmlFor="code" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Code de vérification</label>
                <input id="code" type="text" value={code} onChange={(e) => setCode(e.target.value)} className="form-input rounded-md text-center tracking-[0.5em]" placeholder="------" required />
              </div>
              <button type="submit" className="w-full btn btn-primary transition-all duration-300 transform hover:scale-102" disabled={isLoading}>
                 {isLoading ? <Loader className="animate-spin" /> : 'Vérifier le code'}
              </button>
            </form>
          </div>
        );
      case 3:
        return (
          <div>
            <div className="flex justify-center mb-5"><div className="w-14 h-14 rounded-full flex items-center justify-center bg-sky-100 text-sky-500"><Lock size={28} /></div></div>
            <h2 className="text-xl font-semibold text-center mb-2 text-slate-800 dark:text-slate-100">Nouveau mot de passe</h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-6 text-sm">Entrez votre nouveau mot de passe sécurisé.</p>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label htmlFor="new-password">Nouveau mot de passe</label>
                <input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="form-input rounded-md" required />
              </div>
              <div>
                <label htmlFor="confirm-password">Confirmer le mot de passe</label>
                <input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="form-input rounded-md" required />
              </div>
              <button type="submit" className="w-full btn btn-primary transition-all duration-300 transform hover:scale-102" disabled={isLoading}>
                 {isLoading ? <Loader className="animate-spin" /> : 'Réinitialiser le mot de passe'}
              </button>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 w-full max-w-md relative animate-in fade-in-0 zoom-in-95">
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"><X size={20} /></button>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        {successMessage && !error && <p className="text-green-500 text-sm mb-4 text-center">{successMessage}</p>}
        {renderStepContent()}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;