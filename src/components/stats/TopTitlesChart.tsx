import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SERVICE_COLORS } from '../../constants/services';
import type { StreamingService } from '../../types';

interface Props {
  topTitles: Array<{ title: string; count: number; service: StreamingService }>;
}

export function TopTitlesChart({ topTitles }: Props) {
  if (topTitles.length === 0) return null;

  const data = topTitles.map(t => ({ ...t, shortTitle: t.title.length > 25 ? t.title.slice(0, 22) + '…' : t.title }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Top 10 Titles</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10 }} />
          <YAxis type="category" dataKey="shortTitle" tick={{ fontSize: 11 }} width={110} />
          <Tooltip formatter={(v) => [v, 'Watches']} labelFormatter={(_, payload) => payload?.[0]?.payload?.title || ''} />
          <Bar dataKey="count" radius={[0, 3, 3, 0]} name="Watches">
            {data.map((entry, idx) => (
              <Cell key={idx} fill={SERVICE_COLORS[entry.service]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
