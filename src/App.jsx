import { useEffect, Suspense, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from './store/useStore';
import RoadScene from './components/RoadScene';
import {
  TemperatureChart, EnergyLineChart, VehicleEnergyBar,
  EnergyPieChart, DailyEnergyChart,
} from './components/Charts';
import './index.css';

const tabs = [
  { id: 'overview', label: '📊 Overview' },
  { id: '3d', label: '🏗️ 3D Architecture' },
  { id: 'sensors', label: '🔌 Sensors' },
  { id: 'thermal', label: '🔥 Thermal' },
  { id: 'energy', label: '⚡ Energy' },
  { id: 'cost', label: '💰 Cost & Revenue' },
  { id: 'analytics', label: '📈 Analytics' },
  { id: 'controls', label: '🎛️ Controls' },
];

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const store = useStore();

  // Simulation tick
  useEffect(() => {
    const interval = setInterval(() => {
      useStore.getState().tick();
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const activeSensors = store.sensors.filter((s) => s.status === 'active').length;
  const warningSensors = store.sensors.filter((s) => s.status === 'warning').length;
  const faultSensors = store.sensors.filter((s) => s.status === 'fault').length;
  const totalSensors = store.sensors.length;

  // Cost calculations
  const annualEnergyKm = 77000; // kWh per km per year
  const electricityRate = 8; // ₹ per kWh
  const monthlySavings = ((annualEnergyKm / 12) * electricityRate);
  const yearlySavings = annualEnergyKm * electricityRate;
  const cityDemandPct = 2.3;

  return (
    <div className="app-layout">
      <div className="bg-grid" />
      
      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          <div className="app-logo-icon">AK</div>
          <div>
            <h1>AKTP MONITOR</h1>
            <span>Adaptive Kinetic Thermal Pavement System</span>
          </div>
        </div>
        <div className="header-right">
          <div className="live-badge">
            <div className="live-dot" />
            {store.isRunning ? 'LIVE' : 'PAUSED'}
          </div>
          <button
            className={`sim-btn ${store.isRunning ? 'stop' : ''}`}
            onClick={store.toggleSimulation}
          >
            {store.isRunning ? '⏸ Pause' : '▶ Start'}
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="tab-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <>
                {/* Stats Strip */}
                <div className="dashboard-grid">
                  <StatCard
                    title="Current Power"
                    value={store.currentPower.toFixed(1)}
                    unit="Watts"
                    color="blue"
                    icon="⚡"
                  />
                  <StatCard
                    title="Energy Today"
                    value={store.totalEnergyToday.toFixed(2)}
                    unit="kWh"
                    color="green"
                    icon="🔋"
                  />
                  <StatCard
                    title="Surface Temp"
                    value={store.surfaceTemp.toFixed(1)}
                    unit="°C"
                    color={store.surfaceTemp > 45 ? 'red' : 'orange'}
                    icon="🌡️"
                  />
                  <StatCard
                    title="Active Sensors"
                    value={`${activeSensors}/${totalSensors}`}
                    unit="Online"
                    color="purple"
                    icon="📡"
                  />
                </div>

                <div className="grid-2">
                  {/* Live Status Panel */}
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">🟢 Live Status Panel</span>
                    </div>
                    <div className="status-grid">
                      <div className="status-item">
                        <div className="status-dot green" />
                        <div className="status-info">
                          <div className="status-title">Sensors Active</div>
                          <div className="status-val" style={{ color: 'var(--neon-green)' }}>{activeSensors}</div>
                        </div>
                      </div>
                      <div className="status-item">
                        <div className={`status-dot ${faultSensors > 0 ? 'red' : 'green'}`} />
                        <div className="status-info">
                          <div className="status-title">Faulty Sensors</div>
                          <div className="status-val" style={{ color: faultSensors > 0 ? 'var(--neon-red)' : 'var(--neon-green)' }}>{faultSensors}</div>
                        </div>
                      </div>
                      <div className="status-item">
                        <div className={`status-dot ${store.surfaceTemp > 45 ? 'red' : store.surfaceTemp > 40 ? 'yellow' : 'green'}`} />
                        <div className="status-info">
                          <div className="status-title">Temp Alerts</div>
                          <div className="status-val" style={{ color: store.surfaceTemp > 45 ? 'var(--neon-red)' : 'var(--neon-orange)' }}>
                            {store.surfaceTemp > 45 ? 'HIGH' : store.surfaceTemp > 40 ? 'WARN' : 'OK'}
                          </div>
                        </div>
                      </div>
                      <div className="status-item">
                        <div className="status-dot green" />
                        <div className="status-info">
                          <div className="status-title">Energy Output</div>
                          <div className="status-val" style={{ color: 'var(--neon-blue)' }}>
                            {store.currentPower > 100 ? 'HIGH' : 'NORMAL'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Insights */}
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">🧠 AI Insights</span>
                    </div>
                    <div style={{ maxHeight: 200, overflow: 'auto' }}>
                      {store.insights.slice(0, 8).map((insight) => (
                        <div key={insight.id} className={`insight-item ${insight.type}`}>
                          <span className="insight-icon">
                            {insight.type === 'info' ? 'ℹ️' : insight.type === 'success' ? '✅' : insight.type === 'warning' ? '⚠️' : '🚨'}
                          </span>
                          <div>
                            <div className="insight-text">{insight.text}</div>
                            <div className="insight-time">
                              {new Date(insight.time).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Charts */}
                <div className="grid-2">
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">📈 Temperature Trend</span>
                    </div>
                    <TemperatureChart />
                  </div>
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">⚡ Hourly Energy</span>
                    </div>
                    <EnergyLineChart />
                  </div>
                </div>
              </>
            )}

            {/* 3D ARCHITECTURE TAB */}
            {activeTab === '3d' && (
              <>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-glass)' }}>
                    <span className="card-title">🏗️ Physical Architecture — 3D Layered Road Model</span>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      Drag to rotate • Scroll to zoom • Shows PCM capsules, piezoelectric sensors, wiring & data hub
                    </p>
                  </div>
                  <Suspense fallback={
                    <div style={{ height: 450, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon-blue)' }}>
                      Loading 3D Scene...
                    </div>
                  }>
                    <RoadScene />
                  </Suspense>
                </div>

                <div className="grid-3" style={{ marginTop: 16 }}>
                  <div className="card">
                    <div className="card-icon blue" style={{ marginBottom: 12 }}>❄</div>
                    <h3 style={{ fontSize: 14, marginBottom: 4 }}>Top Layer — PCM Cool Capsules</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Phase Change Material capsules absorb excess heat and regulate road surface temperature.</p>
                  </div>
                  <div className="card">
                    <div className="card-icon green" style={{ marginBottom: 12 }}>⚡</div>
                    <h3 style={{ fontSize: 14, marginBottom: 4 }}>Middle Layer — Piezoelectric Sensors</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Embedded at 5cm depth, these sensors convert vehicle pressure into electrical energy.</p>
                  </div>
                  <div className="card">
                    <div className="card-icon orange" style={{ marginBottom: 12 }}>🔌</div>
                    <h3 style={{ fontSize: 14, marginBottom: 4 }}>Base Layer — Wiring + Data Hub</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Central wiring network connects all sensors to the data hub for real-time monitoring.</p>
                  </div>
                </div>
              </>
            )}

            {/* SENSORS TAB */}
            {activeTab === 'sensors' && (
              <>
                <div className="dashboard-grid">
                  <StatCard title="Active" value={activeSensors} unit="sensors" color="green" icon="✅" />
                  <StatCard title="Warning" value={warningSensors} unit="sensors" color="orange" icon="⚠️" />
                  <StatCard title="Fault" value={faultSensors} unit="sensors" color="red" icon="❌" />
                  <StatCard title="Total" value={totalSensors} unit="deployed" color="blue" icon="📡" />
                </div>

                {['Zone A', 'Zone B', 'Zone C', 'Zone D'].map((zone) => (
                  <div key={zone} className="card" style={{ marginBottom: 16 }}>
                    <div className="card-header">
                      <span className={`zone-badge zone-${zone.split(' ')[1].toLowerCase()}`}>{zone}</span>
                    </div>
                    <div className="sensor-grid">
                      {store.sensors
                        .filter((s) => s.location === zone)
                        .map((sensor) => (
                          <motion.div
                            key={sensor.sensorId}
                            className={`sensor-item ${sensor.status}`}
                            whileHover={{ scale: 1.03 }}
                          >
                            <div className="sensor-id">{sensor.sensorId}</div>
                            <div className={`sensor-status ${sensor.status}`}>{sensor.status}</div>
                            <div className="sensor-value" style={{
                              color: sensor.type === 'piezo' ? 'var(--neon-green)' : 'var(--neon-orange)'
                            }}>
                              {sensor.type === 'piezo'
                                ? `${sensor.energyGenerated.toFixed(1)}W`
                                : `${sensor.temperature.toFixed(1)}°C`
                              }
                            </div>
                            <div className="sensor-type">{sensor.type === 'piezo' ? 'Piezoelectric' : 'Temperature'}</div>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* THERMAL TAB */}
            {activeTab === 'thermal' && (
              <>
                <div className="dashboard-grid">
                  <StatCard title="Surface Temp" value={store.surfaceTemp.toFixed(1)} unit="°C" color={store.surfaceTemp > 45 ? 'red' : 'orange'} icon="🌡️" />
                  <StatCard title="Mid Layer" value={store.midTemp.toFixed(1)} unit="°C" color="orange" icon="🔶" />
                  <StatCard title="Base Layer" value={store.baseTemp.toFixed(1)} unit="°C" color="blue" icon="🔷" />
                  <StatCard title="PCM Status" value={store.pcmActive ? 'ACTIVE' : 'STANDBY'} unit="" color={store.pcmActive ? 'blue' : 'purple'} icon="❄" />
                </div>

                <div className="grid-2">
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">🌡️ Live Temperature Graph</span>
                    </div>
                    <TemperatureChart />
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">❄ PCM Thermal Regulation</span>
                    </div>

                    <div className={`pcm-indicator ${store.pcmActive ? 'active' : 'standby'}`}>
                      {store.pcmActive ? '❄ PCM COOLING ACTIVE' : '⏸ PCM ON STANDBY'}
                    </div>

                    <div className="temp-bar-group">
                      <div className="temp-bar-label">
                        <span className="temp-bar-name">Surface Temperature</span>
                        <span className="temp-bar-value" style={{ color: store.surfaceTemp > 45 ? 'var(--neon-red)' : 'var(--neon-orange)' }}>
                          {store.surfaceTemp.toFixed(1)}°C
                        </span>
                      </div>
                      <div className="temp-bar">
                        <div className="temp-bar-fill" style={{
                          width: `${Math.min(100, (store.surfaceTemp / 60) * 100)}%`,
                          background: store.surfaceTemp > 45
                            ? 'linear-gradient(90deg, #ff6b35, #ff3b5c)'
                            : 'linear-gradient(90deg, #fbbf24, #ff6b35)',
                        }} />
                      </div>
                    </div>

                    <div className="temp-bar-group">
                      <div className="temp-bar-label">
                        <span className="temp-bar-name">PCM Threshold</span>
                        <span className="temp-bar-value" style={{ color: 'var(--neon-blue)' }}>{store.pcmThreshold}°C</span>
                      </div>
                      <div className="temp-bar">
                        <div className="temp-bar-fill" style={{
                          width: `${(store.pcmThreshold / 60) * 100}%`,
                          background: 'linear-gradient(90deg, #00d4ff, #a855f7)',
                        }} />
                      </div>
                    </div>

                    <div style={{ marginTop: 16 }}>
                      <div className="cost-item">
                        <span className="cost-label">Heat Absorbed</span>
                        <span className="cost-value" style={{ color: 'var(--neon-red)' }}>{store.heatAbsorbed.toFixed(1)} kJ</span>
                      </div>
                      <div className="cost-item">
                        <span className="cost-label">Heat Released</span>
                        <span className="cost-value" style={{ color: 'var(--neon-blue)' }}>{store.heatReleased.toFixed(1)} kJ</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ENERGY TAB */}
            {activeTab === 'energy' && (
              <>
                <div className="dashboard-grid">
                  <StatCard title="Current Power" value={store.currentPower.toFixed(1)} unit="Watts" color="blue" icon="⚡" />
                  <StatCard title="Energy Today" value={store.totalEnergyToday.toFixed(2)} unit="kWh" color="green" icon="🔋" />
                  <StatCard title="Cars Passed" value={store.vehicleCounts.car || 0} unit="vehicles" color="blue" icon="🚗" />
                  <StatCard title="Trucks Passed" value={store.vehicleCounts.truck || 0} unit="vehicles" color="orange" icon="🚛" />
                </div>

                <div className="grid-3">
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">🚗 Per Vehicle Energy</span>
                    </div>
                    <div className="cost-item">
                      <span className="cost-label">🚗 Car</span>
                      <span className="cost-value" style={{ color: 'var(--neon-blue)' }}>2W – 10W</span>
                    </div>
                    <div className="cost-item">
                      <span className="cost-label">🚌 Bus</span>
                      <span className="cost-value" style={{ color: 'var(--neon-green)' }}>50W – 150W</span>
                    </div>
                    <div className="cost-item">
                      <span className="cost-label">🚛 Truck</span>
                      <span className="cost-value" style={{ color: 'var(--neon-orange)' }}>100W – 200W</span>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">📊 Vehicle vs Energy</span>
                    </div>
                    <VehicleEnergyBar />
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">🥧 Energy Contribution</span>
                    </div>
                    <EnergyPieChart />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">📈 Hourly Production</span>
                    </div>
                    <EnergyLineChart />
                  </div>
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">📊 Daily Production</span>
                    </div>
                    <DailyEnergyChart />
                  </div>
                </div>
              </>
            )}

            {/* COST & REVENUE TAB */}
            {activeTab === 'cost' && (
              <>
                <div className="dashboard-grid">
                  <StatCard title="Electricity Generated" value={store.totalEnergyToday.toFixed(2)} unit="kWh today" color="green" icon="⚡" />
                  <StatCard title="Cost Saved Today" value={`₹${(store.totalEnergyToday * electricityRate).toFixed(0)}`} unit="" color="blue" icon="💰" />
                  <StatCard title="Monthly Savings" value={`₹${(monthlySavings / 1000).toFixed(0)}K`} unit="estimated" color="orange" icon="📅" />
                  <StatCard title="Yearly Savings" value={`₹${(yearlySavings / 100000).toFixed(1)}L`} unit="estimated" color="purple" icon="🏆" />
                </div>

                <div className="grid-2">
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">💰 Revenue Breakdown (per km)</span>
                    </div>
                    <div className="cost-item">
                      <span className="cost-label">Annual Energy / km</span>
                      <span className="cost-value" style={{ color: 'var(--neon-green)' }}>77,000 kWh</span>
                    </div>
                    <div className="cost-item">
                      <span className="cost-label">Electricity Rate</span>
                      <span className="cost-value" style={{ color: 'var(--neon-blue)' }}>₹{electricityRate}/kWh</span>
                    </div>
                    <div className="cost-item">
                      <span className="cost-label">Monthly Revenue / km</span>
                      <span className="cost-value" style={{ color: 'var(--neon-orange)' }}>₹{monthlySavings.toLocaleString()}</span>
                    </div>
                    <div className="cost-item">
                      <span className="cost-label">Yearly Revenue / km</span>
                      <span className="cost-value" style={{ color: 'var(--neon-purple)' }}>₹{yearlySavings.toLocaleString()}</span>
                    </div>
                    <div className="cost-item">
                      <span className="cost-label">City Demand Contribution</span>
                      <span className="cost-value" style={{ color: 'var(--neon-green)' }}>{cityDemandPct}%</span>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">📊 Daily Energy Revenue</span>
                    </div>
                    <DailyEnergyChart />
                  </div>
                </div>
              </>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <>
                <div className="grid-2">
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">📈 Energy Over Time</span>
                    </div>
                    <EnergyLineChart />
                  </div>
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">📊 Vehicle vs Energy</span>
                    </div>
                    <VehicleEnergyBar />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">🌡️ Temperature Distribution</span>
                    </div>
                    <TemperatureChart />
                  </div>
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">🥧 Energy Contribution</span>
                    </div>
                    <EnergyPieChart />
                  </div>
                </div>

                {/* Location-Based Analytics */}
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">📍 Zone-Based Analytics</span>
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Zone</th>
                        <th>Sensors</th>
                        <th>Avg Temp</th>
                        <th>Energy</th>
                        <th>Type</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['Zone A', 'Zone B', 'Zone C', 'Zone D'].map((zone) => {
                        const zoneSensors = store.sensors.filter((s) => s.location === zone);
                        const avgTemp = zoneSensors.filter(s => s.type === 'temperature').reduce((a, s) => a + s.temperature, 0) / Math.max(1, zoneSensors.filter(s => s.type === 'temperature').length);
                        const totalEnergy = zoneSensors.filter(s => s.type === 'piezo').reduce((a, s) => a + s.energyGenerated, 0);
                        return (
                          <tr key={zone}>
                            <td><span className={`zone-badge zone-${zone.split(' ')[1].toLowerCase()}`}>{zone}</span></td>
                            <td>{zoneSensors.length}</td>
                            <td style={{ color: avgTemp > 45 ? 'var(--neon-red)' : 'var(--neon-orange)' }}>{avgTemp.toFixed(1)}°C</td>
                            <td style={{ color: 'var(--neon-green)' }}>{totalEnergy.toFixed(1)}W</td>
                            <td>{avgTemp > 42 ? '🔥 High Impact' : '🛑 Braking Zone'}</td>
                            <td>
                              <span className={`sensor-status ${zoneSensors.some(s => s.status === 'fault') ? 'fault' : 'active'}`}>
                                {zoneSensors.some(s => s.status === 'fault') ? 'ALERT' : 'NORMAL'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* CONTROLS TAB */}
            {activeTab === 'controls' && (
              <div className="grid-2">
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">🎛️ Simulation Controls</span>
                  </div>

                  <div className="control-group">
                    <div className="control-label">
                      <span>Traffic Density</span>
                      <span className="control-value">{store.trafficDensity}%</span>
                    </div>
                    <input
                      type="range"
                      className="slider"
                      min="0"
                      max="100"
                      value={store.trafficDensity}
                      onChange={(e) => store.setTrafficDensity(Number(e.target.value))}
                    />
                  </div>

                  <div className="control-group">
                    <div className="control-label">
                      <span>Temperature Offset</span>
                      <span className="control-value">{store.temperatureOffset > 0 ? '+' : ''}{store.temperatureOffset}°C</span>
                    </div>
                    <input
                      type="range"
                      className="slider"
                      min="-10"
                      max="20"
                      value={store.temperatureOffset}
                      onChange={(e) => store.setTemperatureOffset(Number(e.target.value))}
                    />
                  </div>

                  <div className="control-group">
                    <div className="control-label">
                      <span>Sensor Sensitivity</span>
                      <span className="control-value">{store.sensorSensitivity}%</span>
                    </div>
                    <input
                      type="range"
                      className="slider"
                      min="10"
                      max="100"
                      value={store.sensorSensitivity}
                      onChange={(e) => store.setSensorSensitivity(Number(e.target.value))}
                    />
                  </div>

                  <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                    <button
                      className={`sim-btn ${store.isRunning ? 'stop' : ''}`}
                      onClick={store.toggleSimulation}
                      style={{ flex: 1 }}
                    >
                      {store.isRunning ? '⏸ Pause Simulation' : '▶ Start Simulation'}
                    </button>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <span className="card-title">🧠 AI Insights Feed</span>
                  </div>
                  <div style={{ maxHeight: 400, overflow: 'auto' }}>
                    {store.insights.map((insight) => (
                      <div key={insight.id} className={`insight-item ${insight.type}`}>
                        <span className="insight-icon">
                          {insight.type === 'info' ? 'ℹ️' : insight.type === 'success' ? '✅' : insight.type === 'warning' ? '⚠️' : '🚨'}
                        </span>
                        <div>
                          <div className="insight-text">{insight.text}</div>
                          <div className="insight-time">{new Date(insight.time).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data Model Preview */}
                <div className="card col-span-2">
                  <div className="card-header">
                    <span className="card-title">📦 Sample Sensor Data Model</span>
                  </div>
                  <pre style={{
                    background: 'rgba(0,0,0,0.3)',
                    padding: 16,
                    borderRadius: 10,
                    fontSize: 13,
                    color: 'var(--neon-green)',
                    overflow: 'auto',
                    fontFamily: 'monospace',
                  }}>
{JSON.stringify({
  sensorId: store.sensors[0]?.sensorId || 'PZ-101',
  type: store.sensors[0]?.type || 'piezo',
  status: store.sensors[0]?.status || 'active',
  location: store.sensors[0]?.location || 'Zone A',
  energyGenerated: Number((store.sensors[0]?.energyGenerated || 5.2).toFixed(2)),
  temperature: Number((store.sensors[0]?.temperature || 38.5).toFixed(1)),
  timestamp: new Date().toISOString(),
}, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function StatCard({ title, value, unit, color, icon }) {
  return (
    <motion.div
      className={`card stat-card ${color}`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="card-header">
        <span className="card-title">{title}</span>
        <div className={`card-icon ${color}`}>{icon}</div>
      </div>
      <div className={`stat-value ${color}`}>{value}</div>
      <div className="stat-unit">{unit}</div>
    </motion.div>
  );
}

export default App;
