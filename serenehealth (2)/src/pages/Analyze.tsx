import { motion } from 'motion/react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router';
import { useAppContext, RecordType, Finding } from '@/context/AppContext';

export function Analyze() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { records } = useAppContext();
  
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(state?.record?.id || null);
  
  const recordToAnalyze = useMemo(() => {
    if (selectedRecordId) return records.find(r => r.id === selectedRecordId);
    return null;
  }, [selectedRecordId, records]);
  
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);

  useEffect(() => {
    if (recordToAnalyze && selectedMetrics.length === 0 && recordToAnalyze.findings.length > 0) {
      setSelectedMetrics([recordToAnalyze.findings[0].title]);
    }
  }, [recordToAnalyze, selectedMetrics.length]);

  const processedFindings = useMemo(() => {
    if (!recordToAnalyze) return { abnormal: [], normal: [] };

    const parseAndCheckAbnormal = (valueStr: string, refStr: string) => {
      const valMatch = valueStr.match(/[\d.]+/);
      if (!valMatch) return null;
      const val = parseFloat(valMatch[0]);

      const refMatch = refStr.match(/([\d.]+)\s*[-–to]+\s*([\d.]+)/);
      if (refMatch) {
        const min = parseFloat(refMatch[1]);
        const max = parseFloat(refMatch[2]);
        if (val < min) return { status: "Below Reference Range", variant: "abnormal" };
        if (val > max) return { status: "Above Reference Range", variant: "abnormal" };
        return { status: "Within Reference Range", variant: "normal" };
      }
      
      const ltMatch = refStr.match(/<\s*([\d.]+)/);
      if (ltMatch) {
        if (val >= parseFloat(ltMatch[1])) return { status: "Above Reference Range", variant: "abnormal" };
        return { status: "Within Reference Range", variant: "normal" };
      }

      const gtMatch = refStr.match(/>\s*([\d.]+)/);
      if (gtMatch) {
        if (val <= parseFloat(gtMatch[1])) return { status: "Below Reference Range", variant: "abnormal" };
        return { status: "Within Reference Range", variant: "normal" };
      }

      return null;
    };

    const abnormal: Finding[] = [];
    const normal: Finding[] = [];

    recordToAnalyze?.findings.forEach(f => {
      let finalStatus = f.status;
      let finalVariant = f.statusVariant;
      
      const calculated = parseAndCheckAbnormal(f.value, f.reference);
      if (calculated) {
        finalStatus = calculated.status;
        finalVariant = calculated.variant as "normal" | "abnormal";
      }

      const findingWithLogic = { ...f, status: finalStatus, statusVariant: finalVariant };

      if (finalVariant === 'abnormal') abnormal.push(findingWithLogic);
      else normal.push(findingWithLogic);
    });

    return { abnormal, normal };
  }, [recordToAnalyze]);

  if (!recordToAnalyze) {
    const reports = records.filter(r => r.type.toLowerCase().includes('report') || r.type.toLowerCase().includes('test'));
    
    if (reports.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-pastel-lavender/20 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-pastel-lavender" />
          </div>
          <h2 className="text-2xl font-bold">No reports available for analysis.</h2>
          <p className="text-text-secondary max-w-md">Upload a medical report to begin.</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">Back to Dashboard</Button>
        </div>
      );
    }

    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Select a report to analyze</h1>
          <p className="text-text-secondary mt-2">Choose a report to view extracted data and insights.</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map(report => (
            <Card 
              key={report.id} 
              className="p-6 cursor-pointer hover:shadow-md transition-shadow group flex flex-col justify-between"
              onClick={() => setSelectedRecordId(report.id)}
            >
              <div>
                <h3 className="font-semibold text-lg group-hover:text-pastel-blue transition-colors">{report.title}</h3>
                <p className="text-sm text-text-secondary mt-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> {report.type}
                </p>
                <p className="text-sm text-text-secondary mt-1">{report.clinic}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-black/5 flex justify-between items-center">
                <span className="text-sm font-medium">{report.date}</span>
                <span className="text-sm text-pastel-blue font-medium opacity-0 group-hover:opacity-100 transition-opacity">Analyze →</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const toggleMetric = (metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  const reportsWithFindings = records.filter(r => r.findings && r.findings.length > 0);
  
  const chartData = reportsWithFindings.map(r => {
    const dataPoint: any = {
      date: new Date(r.date).toLocaleString('default', { month: 'short', day: 'numeric', year: '2-digit' }),
      originalDate: new Date(r.date),
      name: r.title
    };
    r.findings.forEach(f => {
      const valMatch = f.value.match(/[\d.]+/);
      if (valMatch) {
        dataPoint[f.title] = parseFloat(valMatch[0]);
      }
    });
    return dataPoint;
  }).sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Report Analysis</h1>
          <p className="text-text-secondary mt-1">{recordToAnalyze.title} • {recordToAnalyze.date}</p>
        </div>
        <Button variant="outline" className="gap-2 bg-white/60">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </header>

      {recordToAnalyze.imageUrl && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Document Image</h2>
          <Card className="p-4 bg-white/60 overflow-hidden">
            <img 
              src={recordToAnalyze.imageUrl} 
              alt="Scanned Document" 
              className="w-full max-w-3xl mx-auto rounded-lg shadow-sm border border-black/5" 
            />
          </Card>
        </section>
      )}

      <section className="space-y-8">
        {recordToAnalyze.findings.length === 0 ? (
          <Card className="p-8 text-center text-text-secondary bg-white/60">
            No structured findings extracted from this document.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-status-abnormal-text flex items-center gap-2">
                🔴 Findings Outside Reference Range
              </h2>
              <div className="space-y-4">
                {processedFindings.abnormal.length === 0 ? (
                  <p className="text-text-secondary italic">None found</p>
                ) : (
                  processedFindings.abnormal.map((finding, idx) => (
                    <FindingCard 
                      key={idx}
                      title={finding.title}
                      value={finding.value}
                      reference={finding.reference}
                      status={finding.status}
                      statusVariant={finding.statusVariant}
                      bgClass="bg-pastel-coral/20 border-pastel-coral/30"
                    />
                  ))
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-status-normal-text flex items-center gap-2">
                ✓ Within Reference Range
              </h2>
              <div className="space-y-4">
                {processedFindings.normal.length === 0 ? (
                  <p className="text-text-secondary italic">None found</p>
                ) : (
                  processedFindings.normal.map((finding, idx) => (
                    <FindingCard 
                      key={idx}
                      title={finding.title}
                      value={finding.value}
                      reference={finding.reference}
                      status={finding.status}
                      statusVariant={finding.statusVariant}
                      bgClass="bg-pastel-mint/20 border-pastel-mint/30"
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Progress Chart */}
      {recordToAnalyze.findings.length > 0 && chartData.length > 0 ? (
      <section className="space-y-6 pt-8 border-t border-black/[0.05]">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold">Compare Reports Over Time</h2>
            <p className="text-text-secondary mt-1">Select metrics to compare across all reports.</p>
          </div>

          <div className="flex flex-wrap gap-2 flex-1 justify-end max-w-xl">
            {recordToAnalyze.findings.map(f => f.title).map(metric => (
              <button
                key={metric}
                onClick={() => toggleMetric(metric)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  selectedMetrics.includes(metric) 
                    ? "bg-text-primary text-white shadow-sm" 
                    : "bg-white border border-black/5 hover:bg-black/5 text-text-secondary hover:text-text-primary"
                )}
              >
                {metric}
              </button>
            ))}
          </div>
        </div>

        <Card className="h-[400px] p-6 bg-white/60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6F7782', fontSize: 14 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6F7782', fontSize: 14 }}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                  backgroundColor: '#ffffff'
                }}
                itemStyle={{ color: '#29313D', fontWeight: 600 }}
                labelStyle={{ color: '#6F7782', marginBottom: '8px' }}
              />
              {selectedMetrics.map((metric, index) => {
                 const colors = ['#29313D', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
                 const color = colors[index % colors.length];
                 return (
                  <Line 
                    key={metric}
                    type="monotone" 
                    dataKey={metric} 
                    name={metric}
                    stroke={color}
                    strokeWidth={3}
                    dot={{ r: 6, fill: '#FFFFFF', stroke: color, strokeWidth: 2 }}
                    activeDot={{ r: 8, fill: '#EAE4F8', stroke: color, strokeWidth: 2 }}
                    connectNulls
                  />
                 );
              })}
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </section>
      ) : recordToAnalyze.findings.length > 0 && (
        <section className="space-y-6 pt-8 border-t border-black/[0.05]">
          <h2 className="text-2xl font-bold">Compare Reports Over Time</h2>
          <Card className="p-8 text-center text-text-secondary bg-white/60">
            Not enough matching data to generate a comparison.
          </Card>
        </section>
      )}
    </div>
  );
}

function FindingCard({ title, value, reference, status, statusVariant, bgClass }: any) {
  return (
    <Card className={cn("p-5 border transition-all hover:shadow-md", bgClass)}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-2xl font-bold tracking-tight">{value}</span>
            <span className="text-sm font-mono text-text-secondary bg-white/50 px-2 py-1 rounded">Ref: {reference}</span>
          </div>
        </div>
        <div className="sm:text-right">
          <Badge variant={statusVariant} className="shadow-sm bg-white/80 backdrop-blur">{status}</Badge>
        </div>
      </div>
    </Card>
  );
}
