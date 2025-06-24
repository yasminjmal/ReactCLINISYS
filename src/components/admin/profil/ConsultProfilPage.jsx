import React, { useState, useEffect, useRef } from 'react';
import { 
    ArrowLeft, 
    Camera, 
    Trash2, 
    Calendar, 
    User, 
    Mail, 
    Phone, 
    Briefcase,
    ChevronDown,
    Copy
} from 'lucide-react';
import defaultUserProfileImage from '../../../assets/images/default-profile.png';

// --- Helper Components for the new design ---

const ToggleSwitch = ({ enabled, setEnabled, label }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <button
            type="button"
            className={`${
            enabled ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-600'
            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:ring-offset-slate-800`}
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(!enabled)}
        >
            <span
            aria-hidden="true"
            className={`${
                enabled ? 'translate-x-5' : 'translate-x-0'
            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
        </button>
    </div>
);

const ProgressBar = ({ value, label }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{value}%</span>
    </div>
    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
        <div
        className="bg-sky-500 h-2 rounded-full"
        style={{ width: `${value}%` }}
        ></div>
    </div>
  </div>
);


const DetailInput = ({ label, name, value, onChange, icon, type = 'text', placeholder = '' }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
               {React.cloneElement(icon, { className: "h-5 w-5 text-slate-400"})}
            </div>
            <input
                type={type}
                id={name}
                name={name}
                value={value || ''}
                onChange={onChange}
                placeholder={placeholder}
                className="form-input pl-10 w-full bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 focus:border-sky-500 focus:ring-sky-500"
            />
             {(name === "email" || name === "num_telephone") && (
                <button type="button" onClick={() => navigator.clipboard.writeText(value)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-sky-500">
                    <Copy size={16} />
                </button>
             )}
        </div>
    </div>
);

const TeamMemberSelector = ({ label, options, selected, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
        <div className="relative">
            <select
                value={selected}
                onChange={onChange}
                className="form-select w-full appearance-none bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 focus:border-sky-500 focus:ring-sky-500"
            >
                {options.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <ChevronDown size={20} />
            </div>
        </div>
    </div>
);

const OnboardingTask = ({ task, onToggle }) => (
    <div className="flex items-center justify-between py-2">
        <div className="flex items-center">
            <ToggleSwitch enabled={task.completed} setEnabled={onToggle} label="" />
            <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">{task.label}</span>
        </div>
        <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">{task.progress}%</span>
    </div>
);


// --- Main Profile Page Component ---

const ConsultProfilPage = ({ user: initialUser, onUpdateProfile, onNavigateHome }) => {
  const [formData, setFormData] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const fileInputRef = useRef(null);
  
  // --- MOCK DATA for new UI elements ---
  // This data is not in your current user object. 
  // You will need to fetch this from your backend.
  const [teamData, setTeamData] = useState({
      hr: 'hr_kate',
      manager: 'mgr_kirk',
      lead: 'lead_eugene'
  });

  const [onboardingRequired, setOnboardingRequired] = useState(true);

  const [onboardingScripts, setOnboardingScripts] = useState([
    { id: 1, label: 'Office Tour', completed: true, progress: 100 },
    { id: 2, label: 'Management Introductory', completed: false, progress: 0 },
    { id: 3, label: 'Work Tools', completed: false, progress: 20 },
    { id: 4, label: 'Meet Your Colleagues', completed: false, progress: 0 },
    { id: 5, label: 'Duties Journal', completed: false, progress: 0 },
    { id: 6, label: 'Requests Handling', completed: false, progress: 0 },
    { id: 7, label: 'Activity Tracking', completed: false, progress: 0 },
  ]);

  const mockTeamMembers = [
      { id: 'hr_kate', name: 'Kate Middleton' },
      { id: 'hr_john', name: 'John Doe' },
      { id: 'mgr_kirk', name: 'Kirk Mitrohin' },
      { id: 'mgr_jane', name: 'Jane Smith' },
      { id: 'lead_eugene', name: 'Eugene Hummell' },
      { id: 'lead_sara', name: 'Sara Connor' },
  ];
  // --- END MOCK DATA ---

  useEffect(() => {
    if (initialUser) {
      setFormData({
        prenom: initialUser.prenom || '',
        nom: initialUser.nom || '',
        email: initialUser.email || '',
        num_telephone: initialUser.num_telephone || '',
        poste: initialUser.poste || '',
        role: initialUser.role || 'E',
      });
      if (initialUser.photo) {
          setPreviewImage(`data:image/jpeg;base64,${initialUser.photo}`);
      } else {
          setPreviewImage(defaultUserProfileImage);
      }
    }
  }, [initialUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setPhotoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
    }
  };
  
  const handleSaveChanges = (e) => {
    e.preventDefault();
    // In a real app, you would also pass teamData and onboarding data
    onUpdateProfile(initialUser.id, formData, photoFile);
  };
  
  const handleToggleOnboardingScript = (id) => {
    setOnboardingScripts(prev => prev.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };
  
  const onboardingProgress = Math.round(
    (onboardingScripts.filter(t => t.completed).length / onboardingScripts.length) * 100
  );

  return (
    <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-full">
        <form onSubmit={handleSaveChanges}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={onNavigateHome} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                        <ArrowLeft className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                    </button>
                    <div className="flex items-center gap-3">
                        <img src={previewImage} alt="Profile" className="h-10 w-10 rounded-full object-cover" />
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                            {formData.prenom} {formData.nom}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        Added on {new Date(initialUser.dateCreation).toLocaleDateString()}
                    </span>
                    <button type="button" className="btn btn-danger-outline">
                        <Trash2 size={16} className="mr-2" />
                        Delete
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Profile Image */}
                    <div className="card-white">
                        <h3 className="card-header">Profile Image</h3>
                        <div className="p-6">
                            <div className="w-48 h-48 mx-auto rounded-full overflow-hidden ring-4 ring-slate-200 dark:ring-slate-700">
                                <img src={previewImage} alt="Profile Preview" className="h-full w-full object-cover" />
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handlePhotoChange}
                                className="hidden"
                                accept="image/*"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="mt-6 w-full btn btn-secondary"
                            >
                                <Camera size={16} className="mr-2" />
                                Change Profile Image
                            </button>
                        </div>
                    </div>
                    
                    {/* Employee Details */}
                    <div className="card-white">
                         <h3 className="card-header">Employee Details</h3>
                         <div className="p-6 space-y-4">
                            <DetailInput label="First Name" name="prenom" value={formData.prenom} onChange={handleInputChange} icon={<User />} />
                            <DetailInput label="Last Name" name="nom" value={formData.nom} onChange={handleInputChange} icon={<User />} />
                            <DetailInput label="Email Address" name="email" value={formData.email} onChange={handleInputChange} icon={<Mail />} />
                            <DetailInput label="Phone Number" name="num_telephone" value={formData.num_telephone} onChange={handleInputChange} icon={<Phone />} />
                            <DetailInput label="Position" name="poste" value={formData.poste} onChange={handleInputChange} icon={<Briefcase />} />
                         </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Role & Team */}
                        <div className="space-y-8">
                            <div className="card-white">
                                <h3 className="card-header">Role</h3>
                                <div className="p-6">
                                     <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className="form-select w-full bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 focus:border-sky-500 focus:ring-sky-500"
                                    >
                                        <option value="E">Employee</option>
                                        <option value="C">Team Lead</option>
                                        <option value="A">Administrator</option>
                                    </select>
                                </div>
                            </div>
                            <div className="card-white">
                                <h3 className="card-header">Team</h3>
                                <div className="p-6 space-y-4">
                                   <TeamMemberSelector label="HR" options={mockTeamMembers.filter(m => m.id.startsWith('hr'))} selected={teamData.hr} onChange={(e) => setTeamData(d => ({...d, hr: e.target.value}))} />
                                   <TeamMemberSelector label="Manager" options={mockTeamMembers.filter(m => m.id.startsWith('mgr'))} selected={teamData.manager} onChange={(e) => setTeamData(d => ({...d, manager: e.target.value}))} />
                                   <TeamMemberSelector label="Lead" options={mockTeamMembers.filter(m => m.id.startsWith('lead'))} selected={teamData.lead} onChange={(e) => setTeamData(d => ({...d, lead: e.target.value}))} />
                                </div>
                            </div>
                        </div>

                        {/* Onboarding */}
                        <div className="card-white">
                            <h3 className="card-header">Onboarding</h3>
                            <div className="p-6 space-y-5">
                                <div className="relative">
                                     <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Calendar className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input type="text" defaultValue="21.05.2025" className="form-input pl-10 w-full bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 focus:border-sky-500 focus:ring-sky-500" />
                                </div>
                                <ToggleSwitch label="Onboarding required" enabled={onboardingRequired} setEnabled={setOnboardingRequired} />
                                <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                                    <ProgressBar value={onboardingProgress} label="Current Status" />
                                    <a href="#" className="text-sm font-semibold text-sky-600 dark:text-sky-400 mt-2 inline-block">View Answers</a>
                                </div>
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-700 px-6 pt-4 pb-2">
                                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Onboarding Scripts</h4>
                                {onboardingScripts.map(task => (
                                    <OnboardingTask key={task.id} task={task} onToggle={() => handleToggleOnboardingScript(task.id)} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-10 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700 pt-6">
                <button type="button" onClick={onNavigateHome} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
        </form>
    </div>
  );
};

export default ConsultProfilPage;
