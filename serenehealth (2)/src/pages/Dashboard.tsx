import { motion, AnimatePresence } from 'motion/react';
import { Card } from '@/components/ui/Card';
import { FileText, Calendar, AlertCircle, ChevronRight, Activity, Beaker, Plus, CheckCircle2, Circle, Edit2, X, Users } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useNavigate } from 'react-router';
import { useAppContext, AppEvent } from '@/context/AppContext';
import React, { useState } from 'react';
import { UploadModal } from '@/components/UploadModal';
import { EventModal } from '@/components/EventModal';
import { Button } from '@/components/ui/Button';

export function Dashboard() {
  const navigate = useNavigate();
  const { profiles, currentProfileId, records, events, switchProfile, addProfile, updateEvent, deleteEvent } = useAppContext();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<AppEvent | undefined>(undefined);

  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyRel, setNewFamilyRel] = useState('');

  const handleAddFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    await addProfile(newFamilyName, newFamilyRel);
    setNewFamilyName('');
    setNewFamilyRel('');
    setIsFamilyModalOpen(false);
  };

  const currentProfile = profiles.find(p => p.id === currentProfileId) || { name: 'User' };
  
  const abnormalFindingsCount = records.reduce((acc, record) => {
    return acc + record.findings.filter(f => f.statusVariant === 'abnormal').length;
  }, 0);
  
  const activeEvents = events.filter(e => !e.completed);
  const upcomingCount = activeEvents.length; 
  const recentReportsCount = records.filter(r => r.type.toLowerCase().includes('report') || r.type.toLowerCase().includes('test')).length;

  const scrollToUpcoming = () => {
    document.getElementById('upcoming-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Good afternoon, {currentProfile.name} 👋</h1>
          <p className="text-text-secondary mt-1">Here is your health overview for today.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex -space-x-2 mr-2">
            {profiles.map((p, idx) => (
              <div 
                key={p.id}
                onClick={() => switchProfile(p.id)}
                title={p.name}
                className={`w-10 h-10 rounded-full border-2 border-pastel-bg flex items-center justify-center text-sm font-medium transition-all cursor-pointer shadow-sm ${
                  p.id === currentProfileId 
                    ? 'bg-pastel-lavender ring-2 ring-pastel-lavender/50 z-30' 
                    : 'bg-pastel-bg opacity-60 hover:opacity-100 hover:z-40'
                }`}
              >
                <span className="text-text-primary">{p.name.substring(0, 2).toUpperCase()}</span>
              </div>
            ))}
            <div 
              onClick={() => setIsFamilyModalOpen(true)}
              className="w-10 h-10 rounded-full border-2 border-dashed border-pastel-lavender bg-white flex items-center justify-center text-pastel-lavender hover:bg-pastel-lavender/10 cursor-pointer transition-colors z-10"
              title="Add Family Member"
            >
              <Plus className="w-4 h-4" />
            </div>
          </div>
          <Button 
            className="gap-2 bg-gradient-to-r from-pastel-lavender to-pastel-blue text-text-primary hover:opacity-90 border border-black/5 shadow-sm"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Plus className="w-4 h-4" /> Add Medical Record
          </Button>
        </div>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">Health Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <OverviewCard onClick={() => navigate('/vault')} title="Medical Records" value={records.length} icon={FolderIcon} color="bg-pastel-blue" />
          <OverviewCard onClick={() => navigate('/vault')} title="Recent Reports" value={recentReportsCount} icon={FileText} color="bg-pastel-lavender" />
          <OverviewCard onClick={scrollToUpcoming} title="Upcoming" value={upcomingCount} icon={Calendar} color="bg-pastel-peach" />
          <OverviewCard onClick={() => navigate('/analyze')} title="Abnormal Findings" value={abnormalFindingsCount} icon={AlertCircle} color="bg-pastel-coral" textColor={abnormalFindingsCount > 0 ? "text-status-abnormal-text" : "text-text-primary"} />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Medical Records</h2>
            {records.length > 0 && (
              <button onClick={() => navigate('/vault')} className="text-sm font-medium text-text-secondary hover:text-text-primary flex items-center gap-1 transition-colors">
                View all <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {records.length === 0 ? (
              <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-black/5 bg-transparent shadow-none">
                 <div className="w-16 h-16 rounded-full bg-pastel-lavender/20 flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-pastel-lavender" />
                 </div>
                 <h3 className="text-xl font-semibold mb-2">Your health vault is ready</h3>
                 <p className="text-text-secondary mb-6 max-w-md">Start by adding your first medical record. AI will automatically analyze and organize your health data.</p>
                 <Button onClick={() => setIsUploadModalOpen(true)} className="gap-2 bg-pastel-lavender text-text-primary hover:bg-pastel-lavender/80">
                   <Plus className="w-4 h-4" /> Add Medical Record
                 </Button>
              </Card>
            ) : (
              records.slice().reverse().slice(0, 3).map(record => (
                <RecordCard 
                  key={record.id}
                  title={record.title}
                  date={record.date}
                  clinic={record.clinic}
                  status={record.status}
                  statusVariant={record.statusVariant}
                  icon={record.type.toLowerCase().includes('prescription') ? FileText : Beaker}
                  bgColor={record.statusVariant === 'abnormal' ? "bg-pastel-coral/10" : "bg-white/60"}
                  onClick={() => navigate('/analyze', { state: { record } })}
                />
              ))
            )}
          </div>
        </section>

        <section className="space-y-4" id="upcoming-section">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Coming Up</h2>
            <button onClick={() => { setEventToEdit(undefined); setIsEventModalOpen(true); }} className="text-sm font-medium text-text-secondary hover:text-text-primary flex items-center gap-1 transition-colors">
              <Plus className="w-4 h-4" /> Add Event
            </button>
          </div>
          <Card className="p-0 overflow-hidden bg-white/60 backdrop-blur-md h-[calc(100%-2rem)] flex flex-col">
            {activeEvents.length === 0 ? (
              <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                 <div className="w-12 h-12 rounded-full bg-pastel-bg flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-text-secondary" />
                 </div>
                 <h3 className="font-medium text-lg">No upcoming events</h3>
                 <p className="text-sm text-text-secondary mt-2">Add a doctor follow-up, test, or vaccination date to see it here.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {activeEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(event => (
                  <div key={event.id} className="p-5 border-b border-black/[0.03] flex items-start gap-4 hover:bg-black/[0.02] transition-colors relative group">
                    <button 
                      className="mt-1 flex-shrink-0 text-text-secondary hover:text-status-normal-text transition-colors"
                      onClick={() => updateEvent(event.id, { completed: true })}
                      title="Mark as completed"
                    >
                      <Circle className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                      <h3 className="font-medium">{event.name}</h3>
                      <p className="text-sm text-text-secondary mt-1">
                        {new Date(event.date).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {event.time && ` • ${event.time}`}
                      </p>
                      {event.doctor && <p className="text-sm text-text-secondary">{event.doctor}</p>}
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-3">
                      <button 
                        className="text-text-secondary hover:text-text-primary"
                        onClick={() => { setEventToEdit(event); setIsEventModalOpen(true); }}
                        title="Edit event"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-xs font-medium text-pastel-coral"
                        onClick={() => deleteEvent(event.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>
      </div>

      <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
      <EventModal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} eventToEdit={eventToEdit} />

      <AnimatePresence>
        {isFamilyModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
              onClick={() => setIsFamilyModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-50 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-black/5 flex justify-between items-center bg-white sticky top-0 z-10">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-pastel-lavender" /> Add Family Member
                </h2>
                <button type="button" onClick={() => setIsFamilyModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              <form onSubmit={handleAddFamily} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
                  <input type="text" required value={newFamilyName} onChange={e => setNewFamilyName(e.target.value)} className="w-full p-3 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-pastel-lavender" placeholder="Name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Relationship</label>
                  <input type="text" value={newFamilyRel} onChange={e => setNewFamilyRel(e.target.value)} className="w-full p-3 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-pastel-lavender" placeholder="e.g. Spouse, Child" />
                </div>
                <Button type="submit" className="w-full bg-pastel-lavender text-text-primary hover:bg-pastel-lavender/80 mt-4 py-4">
                  Add Member
                </Button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function OverviewCard({ title, value, icon: Icon, color, textColor = "text-text-primary", onClick }: any) {
  return (
    <Card onClick={onClick} className="p-5 flex flex-col justify-between h-32 group cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="flex justify-between items-start relative z-10">
        <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">{title}</span>
        <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-text-primary" />
        </div>
      </div>
      <span className={`text-3xl font-bold ${textColor} relative z-10`}>{value}</span>
      <div className="absolute inset-0 bg-black/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
    </Card>
  );
}

function RecordCard({ title, date, clinic, status, statusVariant, icon: Icon, bgColor, onClick }: any) {
  return (
    <Card 
      className={`p-0 overflow-hidden cursor-pointer group hover:shadow-md transition-all border-none ${bgColor}`}
      onClick={onClick}
    >
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-white/60 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Icon className="w-6 h-6 text-text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-text-secondary">
              <span>{date}</span>
              <span>•</span>
              <span>{clinic}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3 hidden sm:flex">
          <Badge variant={statusVariant}>{status}</Badge>
          <span className="text-sm font-medium text-text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            View Report <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
      {/* Mobile view for status */}
      <div className="sm:hidden px-5 pb-5 flex justify-between items-center">
         <Badge variant={statusVariant}>{status}</Badge>
         <ChevronRight className="w-5 h-5 text-text-secondary" />
      </div>
    </Card>
  );
}


function FolderIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </svg>
  );
}
