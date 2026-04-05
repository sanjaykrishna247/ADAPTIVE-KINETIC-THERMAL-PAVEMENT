import { useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import useStore from '../store/useStore';

const COLORS = ['#00d4ff', '#00ff88', '#ff6b35', '#a855f7', '#fbbf24', '#ff3b5c'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div style={{
      background: 'rgba(17, 24, 39, 0.95)',
      border: '1px solid rgba(0, 212, 255, 0.3)',
      borderRadius: '10px',
      padding: '10px 14px',
      fontSize: '12px',
      color: '#e2e8f0',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
    }}>
      <p style={{ color: '#94a3b8', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  );
};

const chartStyle = {
  fontSize: 11,
  fill: '#64748b',
  fontFamily: 'Inter',
};

export function TemperatureChart() {
  const data = useStore((s) => s.temperatureHistory);
  return (
    <div className="chart-container">
      <ResponsiveContainer>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="surfGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff3b5c" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ff3b5c" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="midGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="time" tick={chartStyle} axisLine={false} tickLine={false} />
          <YAxis tick={chartStyle} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
          <Area type="monotone" dataKey="surface" stroke="#ff3b5c" fill="url(#surfGrad)" strokeWidth={2} name="Surface" dot={false} />
          <Area type="monotone" dataKey="mid" stroke="#fbbf24" fill="url(#midGrad)" strokeWidth={2} name="Mid Layer" dot={false} />
          <Area type="monotone" dataKey="base" stroke="#00d4ff" fill="url(#baseGrad)" strokeWidth={2} name="Base" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EnergyLineChart() {
  const data = useStore((s) => s.hourlyEnergy);
  return (
    <div className="chart-container">
      <ResponsiveContainer>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="hour" tick={chartStyle} axisLine={false} tickLine={false} interval={3} />
          <YAxis tick={chartStyle} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="energy" stroke="#00ff88" fill="url(#energyGrad)" strokeWidth={2} name="Energy (Wh)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function VehicleEnergyBar() {
  const data = useMemo(() => [
    { type: 'Car', min: 2, max: 10, avg: 6 },
    { type: 'Bus', min: 50, max: 150, avg: 100 },
    { type: 'Truck', min: 100, max: 200, avg: 150 },
  ], []);

  return (
    <div className="chart-container">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="type" tick={chartStyle} axisLine={false} tickLine={false} />
          <YAxis tick={chartStyle} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="min" fill="#00d4ff" name="Min (W)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="avg" fill="#00ff88" name="Avg (W)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="max" fill="#ff6b35" name="Max (W)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EnergyPieChart() {
  const counts = useStore((s) => s.vehicleCounts);
  const data = useMemo(() => [
    { name: 'Cars', value: Math.max(1, (counts.car || 0) * 6) },
    { name: 'Buses', value: Math.max(1, (counts.bus || 0) * 100) },
    { name: 'Trucks', value: Math.max(1, (counts.truck || 0) * 150) },
  ], [counts]);

  return (
    <div className="chart-container">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
          <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DailyEnergyChart() {
  const data = useStore((s) => s.dailyEnergy);
  return (
    <div className="chart-container">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="day" tick={chartStyle} axisLine={false} tickLine={false} />
          <YAxis tick={chartStyle} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="energy" name="Energy (Wh)" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
