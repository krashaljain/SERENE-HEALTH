import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAppContext } from '@/context/AppContext';

export function EventModal({ isOpen, onClose, eventToEdit }: { isOpen: boolean; onClose: () => void; eventToEdit?: any }) {
  const { addEvent, updateEvent } = useAppContext();
  
  const [name, setName] = useState(eventToEdit?.name || '');
  const [type, setType] = useState(eventToEdit?.type || 'Doctor Follow-up');
  const [date, setDate] = useState(eventToEdit?.date || '');
  const [time, setTime] = useState(eventToEdit?.time || '');
  const [doctor, setDoctor] = useState(eventToEdit?.doctor || '');
  const [notes, setNotes] = useState(eventToEdit?.notes || '');

  React.useEffect(() => {
    if (isOpen) {
      setName(eventToEdit?.name || '');
      setType(eventToEdit?.type || 'Doctor Follow-up');
      setDate(eventToEdit?.date || '');
      setTime(eventToEdit?.time || '');
      setDoctor(eventToEdit?.doctor || '');
      setNotes(eventToEdit?.notes || '');
    }
  }, [isOpen, eventToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (eventToEdit) {
      await updateEvent(eventToEdit.id, { name, type, date, time, doctor, notes });
    } else {
      await addEvent({ name, type, date, time, doctor, notes });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-50 overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-black/5 flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-pastel-peach" /> Add Upcoming Event
              </h2>
              <button type="button" onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Event Type</label>
                <select 
                  value={type} 
                  onChange={e => setType(e.target.value)}
                  className="w-full p-3 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-pastel-peach transition-all"
                  required
                >
                  <option value="Doctor Follow-up">Doctor Follow-up</option>
                  <option value="Blood Test">Blood Test</option>
                  <option value="Vaccination">Vaccination</option>
                  <option value="Medical Appointment">Medical Appointment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Event Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-pastel-peach transition-all"
                  placeholder="e.g. Annual Checkup"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Date</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                    className="w-full p-3 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-pastel-peach transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Time <span className="text-xs font-normal opacity-70">(Optional)</span></label>
                  <input 
                    type="time" 
                    value={time} 
                    onChange={e => setTime(e.target.value)}
                    className="w-full p-3 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-pastel-peach transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Doctor / Hospital <span className="text-xs font-normal opacity-70">(Optional)</span></label>
                <input 
                  type="text" 
                  value={doctor} 
                  onChange={e => setDoctor(e.target.value)}
                  className="w-full p-3 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-pastel-peach transition-all"
                  placeholder="e.g. Dr. Sarah Jenkins"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Notes <span className="text-xs font-normal opacity-70">(Optional)</span></label>
                <textarea 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-pastel-peach transition-all min-h-[80px]"
                  placeholder="e.g. Fasting required"
                />
              </div>
              
              <Button type="submit" className="w-full bg-pastel-peach text-text-primary hover:bg-pastel-peach/80 mt-4 py-4">
                Save Event
              </Button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
