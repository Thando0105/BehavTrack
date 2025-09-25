'use client';

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { importStudentData } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface ImportDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const requiredHeaders = 'StudentName,Grade,IncidentDate,Severity,Description';

export function ImportDataDialog({ open, onOpenChange }: ImportDataDialogProps) {
  const [csvData, setCsvData] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleImport = () => {
    if (!csvData.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Pasted data cannot be empty.',
      });
      return;
    }

    startTransition(async () => {
      const result = await importStudentData(csvData);

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Import Failed',
          description: result.error,
        });
      } else {
        toast({
          title: 'Import Successful',
          description: `Processed ${result.processedRows} rows. ${result.createdStudents} new students and ${result.createdIncidents} new incidents added.`,
        });
        setCsvData('');
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Import Student & Incident Data</DialogTitle>
          <DialogDescription>
            Paste data from a spreadsheet (e.g., Excel, Google Sheets). The first row must contain the exact headers.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Alert>
            <AlertTitle>Required Headers</AlertTitle>
            <AlertDescription className="font-mono text-xs">
              {requiredHeaders}
            </AlertDescription>
          </Alert>
          <div className="grid w-full gap-1.5">
            <Label htmlFor="csv-data">Paste Data Here</Label>
            <Textarea
              id="csv-data"
              placeholder="StudentName,Grade,IncidentDate,Severity,Description..."
              className="min-h-[200px] font-mono text-xs"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Import Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
