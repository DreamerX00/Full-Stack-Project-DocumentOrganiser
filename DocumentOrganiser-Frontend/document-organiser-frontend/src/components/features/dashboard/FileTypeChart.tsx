'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from 'lucide-react';

interface FileTypeChartProps {
    data: Record<string, number>;
}

const COLORS = [
    'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500',
    'bg-pink-500', 'bg-orange-500', 'bg-teal-500', 'bg-red-500',
];

export function FileTypeChart({ data }: FileTypeChartProps) {
    const entries = Object.entries(data).sort(([, a], [, b]) => b - a);
    const total = entries.reduce((sum, [, count]) => sum + count, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">File Types</CardTitle>
            </CardHeader>
            <CardContent>
                {entries.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
                        <PieChart className="h-8 w-8" />
                        <p className="text-sm">No data yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {entries.map(([category, count], idx) => {
                            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                            return (
                                <div key={category} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="capitalize">{category.toLowerCase().replace('_', ' ')}</span>
                                        <span className="text-muted-foreground">{count} ({pct}%)</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-muted">
                                        <div
                                            className={`h-full rounded-full ${COLORS[idx % COLORS.length]}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
