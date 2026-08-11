import { motion } from 'motion/react';
import { Search as SearchIcon, FileText, Pill } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppContext } from '@/context/AppContext';

export function Search() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { records } = useAppContext();

  // Simple text search across record title, clinic, findings
  const searchResults = records.filter(record => {
    if (!query.trim()) return false;
    const q = query.toLowerCase();
    return (
      record.title.toLowerCase().includes(q) ||
      record.clinic.toLowerCase().includes(q) ||
      record.findings.some(f => f.title.toLowerCase().includes(q) || f.value.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-3xl mx-auto pt-4 md:pt-12">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
          <SearchIcon className="h-6 w-6 text-text-secondary group-focus-within:text-text-primary transition-colors" />
        </div>
        <input
          type="text"
          className="block w-full pl-16 pr-6 py-6 border-0 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] text-xl font-medium focus:ring-2 focus:ring-pastel-lavender transition-all placeholder:text-text-secondary/50 outline-none"
          placeholder="Search records, findings, clinics..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {records.length === 0 ? (
        <div className="text-center text-text-secondary mt-12">
          <p>No records available. Upload a medical record to search.</p>
        </div>
      ) : query.trim() !== '' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold px-2">{searchResults.length} results</h3>
          
          <div className="space-y-3">
            {searchResults.map(record => {
              // Highlight snippet logic (naive)
              let snippet = `Found in ${record.title}`;
              const matchFinding = record.findings.find(f => f.title.toLowerCase().includes(query.toLowerCase()));
              if (matchFinding) {
                snippet = `Found finding: ${matchFinding.title} (${matchFinding.value})`;
              }

              return (
                <SearchResultCard 
                  key={record.id}
                  title={record.title}
                  date={record.date}
                  icon={record.type.toLowerCase().includes('prescription') ? Pill : FileText}
                  preview={snippet}
                  onClick={() => navigate('/analyze', { state: { record } })}
                />
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function SearchResultCard({ title, date, icon: Icon, preview, onClick }: any) {
  return (
    <Card 
      className="p-5 border-none bg-white/60 hover:bg-white cursor-pointer transition-all hover:shadow-md group"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-pastel-bg flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className="font-semibold text-lg truncate pr-4">{title}</h4>
            <span className="text-sm text-text-secondary whitespace-nowrap">{date}</span>
          </div>
          <p className="text-text-secondary mt-2 text-sm leading-relaxed">{preview}</p>
        </div>
      </div>
    </Card>
  );
}
