import { Loader2 } from 'lucide-react';

export function GlobalLoading() {
  return (
    <div 
      id="global-loading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      style={{ display: 'none' }}
    >
      <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-lg">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-lg font-medium">Yuklanmoqda...</p>
      </div>
    </div>
  );
}
