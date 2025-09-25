import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Incident, IncidentSeverity } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface IncidentLogProps {
  incidents: Incident[];
}

const severityStyles: Record<IncidentSeverity, string> = {
  low: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800',
  high: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800',
};

export function IncidentLog({ incidents }: IncidentLogProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Incident History</CardTitle>
        <CardDescription>A chronological log of all recorded incidents.</CardDescription>
      </CardHeader>
      <CardContent>
        {incidents.length > 0 ? (
          <ul className="space-y-4">
            {incidents.map(incident => (
              <li key={incident.id} className="flex gap-4">
                <div className="flex-shrink-0">
                    <div className="text-sm font-medium">{format(new Date(incident.dateTime), 'MMM d')}</div>
                    <div className="text-xs text-muted-foreground">{format(new Date(incident.dateTime), 'h:mm a')}</div>
                </div>
                <div className="relative w-full">
                    <div className="absolute left-[-24px] top-[4px] h-full border-l-2 border-border border-dashed"></div>
                    <div className="absolute left-[-28px] top-[4px] h-4 w-4 rounded-full bg-primary/20 border-4 border-background"></div>
                    <div className="flex items-start justify-between">
                        <p className="text-sm text-foreground">{incident.description}</p>
                        <Badge variant="outline" className={cn('capitalize', severityStyles[incident.severity])}>
                            {incident.severity}
                        </Badge>
                    </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>No incidents recorded yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
