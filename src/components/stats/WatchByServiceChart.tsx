import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { SERVICE_COLORS, SERVICE_LABELS } from '../../constants/services';
import type { StreamingService } from '../../types';

interface Props {
  byService: Record<StreamingService, number>;
}

export function WatchByServiceChart({ byService }: Props) {
  const data = (Object.entries(byService) as [StreamingService, number][])
    .filter(([, v]) => v > 0)
    .map(([service, value]) => ({ name: SERVICE_LABELS[service], value, service }));

  if (data.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">By Service</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
            {data.map((entry) => (
              <Cell key={entry.service} fill={SERVICE_COLORS[entry.service]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => typeof value === 'number' ? value.toLocaleString() : value} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
