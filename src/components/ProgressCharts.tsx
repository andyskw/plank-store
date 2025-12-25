import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Scatter,
} from 'recharts';
import type { DailyStat } from '../services/analytics';
import type { ExerciseType } from '../types';

interface ProgressChartsProps {
    data: DailyStat[];
    type: ExerciseType;
}

const CustomTooltip = ({ active, payload, label, type }: any) => {
    if (active && payload && payload.length) {
        const total = payload.find((p: any) => p.dataKey === 'totalValue')?.value;
        const count = payload.find((p: any) => p.dataKey === 'entryCount')?.value;
        const avg = payload.find((p: any) => p.dataKey === 'movingAverage')?.value;

        return (
            <div className="custom-tooltip" style={{
                backgroundColor: 'var(--surface-color)',
                padding: '1rem',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)'
            }}>
                <p className="label" style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{new Date(label).toLocaleDateString()}</p>
                <p style={{ color: 'var(--primary-color)' }}>
                    {type === 'plank' ? `Total: ${Math.floor(total / 60)}m ${total % 60}s` : `Total: ${total} reps`}
                </p>
                <p style={{ color: '#82ca9d' }}>
                    Moving Avg: {type === 'plank' ? `${Math.floor(avg / 60)}m ${avg % 60}s` : `${avg} reps`}
                </p>
                <p style={{ color: '#ffc658' }}>
                    Entries: {count}
                </p>
            </div>
        );
    }

    return null;
};

export default function ProgressCharts({ data, type }: ProgressChartsProps) {
    const yAxisLabel = type === 'plank' ? 'Seconds' : 'Reps';

    return (
        <div className="progress-charts" style={{ height: '300px', width: '100%', marginTop: '2rem' }}>
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 0,
                    }}
                >
                    <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        style={{ fontSize: '0.8rem', fill: 'var(--text-secondary)' }}
                    />
                    <YAxis
                        yAxisId="left"
                        label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', style: { fill: 'var(--text-secondary)' } }}
                        style={{ fontSize: '0.8rem', fill: 'var(--text-secondary)' }}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        label={{ value: 'Entries', angle: 90, position: 'insideRight', style: { fill: 'var(--text-secondary)' } }}
                        style={{ fontSize: '0.8rem', fill: 'var(--text-secondary)' }}
                    />
                    <Tooltip content={<CustomTooltip type={type} />} />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />

                    <Bar
                        yAxisId="left"
                        dataKey="totalValue"
                        name={type === 'plank' ? "Total Duration" : "Total Reps"}
                        barSize={20}
                        fill="var(--primary-color)"
                        radius={[4, 4, 0, 0]}
                    />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="movingAverage"
                        name="7-Day Avg"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        dot={false}
                    />
                    <Scatter
                        yAxisId="right"
                        dataKey="entryCount"
                        name="Entries Count"
                        fill="#ffc658"
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
