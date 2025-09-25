'use client';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { Incident, IncidentSeverity } from '@/lib/types';
import { useMemo } from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';

interface IncidentChartsProps {
  incidents: Incident[];
}

export function IncidentCharts({ incidents }: IncidentChartsProps) {
  const severityData = useMemo(() => {
    const counts = incidents.reduce(
      (acc, incident) => {
        acc[incident.severity]++;
        return acc;
      },
      { low: 0, medium: 0, high: 0 } as Record<IncidentSeverity, number>
    );

    return [
      { name: 'Low', count: counts.low, fill: 'var(--color-low)' },
      { name: 'Medium', count: counts.medium, fill: 'var(--color-medium)' },
      { name: 'High', count: counts.high, fill: 'var(--color-high)' },
    ];
  }, [incidents]);

  const dailyData = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    });

    const dailyCounts = last7Days.map(day => ({
      date: format(day, 'MMM d'),
      count: 0,
    }));

    incidents.forEach(incident => {
      const incidentDate = new Date(incident.dateTime);
      const dayString = format(incidentDate, 'MMM d');
      const dayData = dailyCounts.find(d => d.date === dayString);
      if (dayData) {
        dayData.count++;
      }
    });

    return dailyCounts;
  }, [incidents]);

  const severityChartConfig = {
    low: { label: 'Low', color: 'hsl(var(--chart-2))' },
    medium: { label: 'Medium', color: 'hsl(var(--chart-3))' },
    high: { label: 'High', color: 'hsl(var(--chart-4))' },
  };
  
  const dailyChartConfig = {
    count: { label: 'Incidents', color: 'hsl(var(--chart-1))' },
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Incidents by Severity</CardTitle>
          <CardDescription>A breakdown of all recorded incidents by severity level.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={severityChartConfig} className="h-64 w-full">
            <BarChart accessibilityLayer data={severityData} margin={{ top: 20 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis allowDecimals={false} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="count" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Incident Trend</CardTitle>
          <CardDescription>Total number of incidents over the last 7 days.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={dailyChartConfig} className="h-64 w-full">
            <LineChart accessibilityLayer data={dailyData} margin={{ left: 12, right: 12, top: 20 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis allowDecimals={false} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Line
                dataKey="count"
                type="monotone"
                stroke="var(--color-count)"
                strokeWidth={2}
                dot={{
                  fill: 'var(--color-count)',
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
