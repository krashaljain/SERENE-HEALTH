import { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '@/components/ui/Card';
import { Droplet, AlertTriangle, Pill, Phone, QrCode, Edit2, Check, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAppContext } from '@/context/AppContext';
import { useNavigate } from 'react-router';

export function Profile() {
  const { profiles, currentProfileId, updateProfile, isGuest, logout } = useAppContext();
  const currentProfile = profiles.find(p => p.id === currentProfileId) || { name: 'User' };
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-4xl mx-auto">
      
      {/* Profile Header */}
      <Card className="p-8 md:p-12 bg-white flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden border-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pastel-lavender/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        
        <div className="relative">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-pastel-bg bg-gradient-to-tr from-pastel-lavender to-pastel-blue flex items-center justify-center shadow-sm">
            <span className="text-4xl md:text-5xl font-bold text-text-primary tracking-tight">
              {currentProfile.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-pastel-mint border-2 border-white flex items-center justify-center shadow-sm">
            <div className="w-3 h-3 rounded-full bg-status-normal-text" />
          </div>
        </div>

        <div className="text-center md:text-left flex-1 z-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{currentProfile.name}</h1>
          <p className="text-lg text-text-secondary mt-2">Personal Health Profile</p>
          
          <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-4">
             <Button variant="secondary" className="gap-2">Edit Profile</Button>
             <Button variant="outline" className="gap-2 bg-white/50">Manage Family</Button>
          </div>
        </div>
      </Card>

      {/* Quick Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <EditableInfoCard 
          icon={Droplet} 
          title="Blood Group" 
          value={currentProfile.bloodGroup || "Not added"} 
          fieldKey="bloodGroup"
          color="bg-pastel-coral/20" 
          iconColor="text-status-abnormal-text"
          onUpdate={val => updateProfile({ bloodGroup: val })}
          isGuest={isGuest}
        />
        <EditableInfoCard 
          icon={AlertTriangle} 
          title="Allergies" 
          value={currentProfile.allergies || "Not added"} 
          fieldKey="allergies"
          color="bg-pastel-yellow/30" 
          iconColor="text-status-warning-text"
          onUpdate={val => updateProfile({ allergies: val })}
          isGuest={isGuest}
        />
        <EditableInfoCard 
          icon={Pill} 
          title="Medications" 
          value={currentProfile.medications || "Not added"} 
          fieldKey="medications"
          color="bg-pastel-blue/30" 
          iconColor="text-text-primary"
          onUpdate={val => updateProfile({ medications: val })}
          isGuest={isGuest}
        />
        <EditableInfoCard 
          icon={Phone} 
          title="Emergency Contact" 
          value={currentProfile.emergencyContact || "Not added"} 
          fieldKey="emergencyContact"
          color="bg-pastel-mint/30" 
          iconColor="text-status-normal-text"
          valueClass="text-sm md:text-base truncate"
          onUpdate={val => updateProfile({ emergencyContact: val })}
          isGuest={isGuest}
        />
      </div>

      {/* Emergency Card */}
      <Card className="p-8 md:p-12 bg-gradient-to-br from-pastel-lavender/40 to-pastel-blue/30 border-none relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 text-center md:text-left">
          <h2 className="text-2xl font-bold mb-2">Emergency Health Card</h2>
          <p className="text-text-primary/80 max-w-md">
            Share vital medical information securely with first responders or new doctors.
          </p>
        </div>

        <Button size="lg" className="relative z-10 gap-2 bg-white text-text-primary hover:bg-white/90 shadow-sm border border-black/[0.02]">
          <QrCode className="w-5 h-5" />
          Generate QR
        </Button>
      </Card>

    </div>
  );
}

function EditableInfoCard({ icon: Icon, title, value, color, iconColor, valueClass = "text-xl md:text-2xl font-bold mt-1", onUpdate, isGuest }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value === "Not added" ? "" : value);

  const handleSave = () => {
    onUpdate(editValue || "");
    setIsEditing(false);
  };

  return (
    <Card className="p-5 flex flex-col items-start bg-white/60 border-none hover:bg-white transition-colors group relative h-full">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <span className="text-sm font-medium text-text-secondary">{title}</span>
      
      {!isEditing ? (
        <div className="flex items-center justify-between w-full mt-1">
          <span className={valueClass}>{value}</span>
          {!isGuest && (
            <button 
              onClick={() => { setEditValue(value === "Not added" ? "" : value); setIsEditing(true); }} 
              className="text-text-secondary hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center w-full mt-1 gap-2">
          <input 
            autoFocus
            type="text" 
            value={editValue} 
            onChange={e => setEditValue(e.target.value)}
            className="w-full text-sm p-1 border-b border-black/20 bg-transparent focus:outline-none focus:border-black/50"
          />
          <button onClick={handleSave} className="text-pastel-mint hover:text-green-600">
            <Check className="w-4 h-4" />
          </button>
          <button onClick={() => setIsEditing(false)} className="text-pastel-coral hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </Card>
  );
}
