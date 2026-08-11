import { motion } from 'motion/react';
import { Card } from '@/components/ui/Card';
import { FileText, Calendar, Activity, Pill, Upload, Beaker } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAppContext } from '@/context/AppContext';
import { useState } from 'react';
import { UploadModal } from '@/components/UploadModal';
import { useNavigate } from 'react-router';

export function Vault() {
  const { records, events } = useAppContext();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const navigate = useNavigate();

  const reportsCount = records.filter(r => r.type.toLowerCase().includes('report') || r.type.toLowerCase().includes('test')).length;
  const prescriptionsCount = records.filter(r => r.type.toLowerCase().includes('prescription')).length;
  const abnormalFindings = records.reduce((acc, r) => acc + r.findings.filter(f => f.statusVariant === 'abnormal').length, 0);
  const activeEventsCount = events.filter(e => !e.completed).length;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Health Vault</h1>
          <p className="text-text-secondary mt-1">Your secure medical history.</p>
        </div>
        <Button className="gap-2" onClick={() => setIsUploadModalOpen(true)}>
          <Upload className="w-4 h-4" />
          Upload Record
        </Button>
      </header>

      {/* Health Summary */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Health Summary</h2>
          <span className="text-sm font-mono text-text-secondary bg-black/5 px-3 py-1 rounded-full">All time</span>
        </div>
        <Card className="p-0 overflow-hidden bg-white/80 backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-black/[0.05]">
            <div className="p-6 bg-pastel-lavender/10">
              <h3 className="text-sm font-medium text-text-secondary mb-3">Records</h3>
              <p className="font-semibold text-lg">{reportsCount} reports</p>
              <p className="font-semibold text-lg mt-1">{prescriptionsCount} prescriptions</p>
            </div>
            <div className="p-6 bg-pastel-coral/10">
              <h3 className="text-sm font-medium text-text-secondary mb-3">Report Findings</h3>
              {abnormalFindings > 0 ? (
                <p className="font-semibold text-lg leading-snug">{abnormalFindings} values were outside the provided reference ranges.</p>
              ) : (
                <p className="font-semibold text-lg leading-snug text-status-normal-text">All values are within normal ranges.</p>
              )}
            </div>
            <div className="p-6 bg-pastel-mint/10">
              <h3 className="text-sm font-medium text-text-secondary mb-3">Trends</h3>
              <div className="space-y-2 text-text-secondary">
                {records.length > 0 ? "Upload more data to see trends." : "No data yet."}
              </div>
            </div>
            <div className="p-6 bg-pastel-blue/10">
              <h3 className="text-sm font-medium text-text-secondary mb-3">Upcoming</h3>
              <p className="font-semibold text-lg text-text-secondary">{activeEventsCount === 0 ? "No upcoming events" : `${activeEventsCount} event(s)`}</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Health Timeline */}
      <section className="space-y-6 pt-4">
        <h2 className="text-xl font-semibold">Timeline</h2>
        
        {records.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            No medical records yet. Upload a document to build your timeline.
          </div>
        ) : (
          <div className="relative pl-6 md:pl-8 space-y-12 before:absolute before:inset-0 before:ml-[1.75rem] md:before:ml-[2.25rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-pastel-lavender before:via-pastel-blue before:to-transparent">
            {records.slice().reverse().map(record => (
              <TimelineItem 
                key={record.id}
                date={new Date(record.date).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
                title={record.title}
                subtitle={record.clinic}
                description={record.status}
                icon={record.type.toLowerCase().includes('prescription') ? Pill : BeakerIcon}
                color={record.statusVariant === 'abnormal' ? "bg-pastel-coral/50" : (record.type.toLowerCase().includes('prescription') ? "bg-pastel-blue" : "bg-pastel-mint")}
                ringColor={record.statusVariant === 'abnormal' ? "ring-pastel-coral/30" : (record.type.toLowerCase().includes('prescription') ? "ring-pastel-blue/30" : "ring-pastel-mint/30")}
                onClick={() => navigate('/analyze', { state: { record } })}
              />
            ))}
          </div>
        )}
      </section>

      <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
    </div>
  );
}

function TimelineItem({ date, title, subtitle, description, icon: Icon, color, ringColor, onClick }: any) {
  return (
    <div className="relative flex items-start group">
      {/* Node */}
      <div className="absolute top-0 -left-6 md:-left-8 -translate-x-1/2 flex h-8 w-8 items-center justify-center">
        <div className={`h-4 w-4 rounded-full ${color} ring-4 ${ringColor} shadow-sm group-hover:scale-125 transition-transform duration-300`} />
      </div>
      
      {/* Content */}
      <div className="flex-1 ml-4 md:ml-6">
        <div className="flex flex-col mb-1">
          <span className="text-sm font-bold text-text-secondary tracking-wider mb-2">{date}</span>
          <Card 
            className="p-5 border-none bg-white/60 hover:bg-white transition-colors cursor-pointer group-hover:-translate-y-1 group-hover:shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            onClick={onClick}
          >
             <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                   <Icon className="w-5 h-5 text-text-primary" />
                </div>
                <div>
                   <h3 className="font-semibold text-lg leading-tight">{title}</h3>
                   <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
                   <p className="text-sm text-text-primary/80 mt-1 leading-relaxed max-w-xl">{description}</p>
                </div>
             </div>
             <div className="flex items-center text-pastel-blue font-medium text-sm group-hover:translate-x-1 transition-transform self-end sm:self-auto">
               View Record →
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BeakerIcon(props: any) {
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
      <path d="M4.5 3h15" />
      <path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3" />
      <path d="M6 14h12" />
    </svg>
  );
}
