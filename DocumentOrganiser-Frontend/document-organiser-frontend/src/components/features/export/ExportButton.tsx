'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { exportApi } from '@/lib/api/ai';
import { Button } from '@/components/ui/button';

export function ExportButton() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const blob = await exportApi.downloadAll();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document-export.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Export downloaded successfully');
    } catch {
      toast.error('Export failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" className="gap-2" onClick={handleExport} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      Export All Documents
    </Button>
  );
}
