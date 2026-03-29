import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SERVICE_COLORS } from '../../constants/services';

interface Props {
  byMonth: Array<{ month: string; netflix: number; amazon: number; hulu: number; plex: number; unknown: number }>;
  hasNetflix: boolean;
  hasAmazon: boolean;
  hasHulu: boolean;
  hasPlex: boolean;
}

export function WatchByMonthChart({ byMonth, hasNetflix, hasAmazon, hasHulu, hasPlex }: Props) {
  if (byMonth.length === 0) return null;

  // Show last 24 months max to keep chart readable
  const data = byMonth.slice(-24);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Activity by Month</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis dataKey="month" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {hasNetflix && <Bar dataKey="netflix" stackId="a" fill={SERVICE_COLORS.netflix} name="Netflix" />}
          {hasAmazon && <Bar dataKey="amazon" stackId="a" fill={SERVICE_COLORS.amazon} name="Prime Video" />}
          {hasHulu && <Bar dataKey="hulu" stackId="a" fill={SERVICE_COLORS.hulu} name="Hulu" />}
          {hasPlex && <Bar dataKey="plex" stackId="a" fill={SERVICE_COLORS.plex} name="Plex" />}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
