import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  byDayOfWeek: Array<{ day: string; count: number }>;
}

export function WatchByDayChart({ byDayOfWeek }: Props) {
  if (byDayOfWeek.every(d => d.count === 0)) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Activity by Day of Week</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={byDayOfWeek} margin={{ left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Bar dataKey="count" fill="#6366F1" radius={[3, 3, 0, 0]} name="Watches" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
