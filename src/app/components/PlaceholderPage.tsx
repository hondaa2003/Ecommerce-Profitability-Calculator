import { Card } from '../components/ui/card';
import { Sparkles } from 'lucide-react';

interface Props { label?: string; }

export function PlaceholderPage({ label }: Props) {
  return (
    <Card className="p-12 text-center border-dashed border-2 border-slate-200 rounded-2xl">
      <Sparkles className="w-10 h-10 mx-auto text-slate-300 mb-4" />
      <h2 className="text-xl font-semibold text-slate-700 mb-2">Coming Soon — {label}</h2>
      <p className="text-sm text-slate-400">This feature is under active development.</p>
    </Card>
  );
}