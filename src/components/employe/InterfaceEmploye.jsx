const EmployeInterface = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-slate-700 text-white flex flex-col items-center justify-center p-8">
      <Briefcase size={64} className="text-indigo-400 mb-6" />
      <h1 className="text-4xl font-bold mb-4">Interface Employé</h1>
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
export default EmployeInterface;