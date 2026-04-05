import { create } from 'zustand';

const ZONES = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];
const SENSOR_TYPES = ['piezo', 'temperature'];
const STATUSES = ['active', 'active', 'active', 'active', 'warning', 'fault'];

const generateSensors = () => {
  const sensors = [];
  let id = 100;
  for (const zone of ZONES) {
    for (let i = 0; i < 4; i++) {
      id++;
      sensors.push({
        sensorId: `PZ-${id}`,
        type: i < 2 ? 'piezo' : 'temperature',
        status: 'active',
        location: zone,
        energyGenerated: Math.random() * 10,
        temperature: 30 + Math.random() * 15,
        timestamp: Date.now(),
      });
    }
  }
  return sensors;
};

const useStore = create((set, get) => ({
  // Simulation
  isRunning: true,
  trafficDensity: 50,
  temperatureOffset: 0,
  sensorSensitivity: 75,
  simulationSpeed: 1,

  // Sensors
  sensors: generateSensors(),

  // Energy
  currentPower: 0,
  totalEnergyToday: 0,
  hourlyEnergy: Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    energy: Math.random() * 500 + 100,
  })),
  dailyEnergy: Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    energy: Math.random() * 5000 + 2000,
  })),

  // Temperature
  surfaceTemp: 42,
  midTemp: 38,
  baseTemp: 33,
  pcmActive: false,
  pcmThreshold: 45,
  heatAbsorbed: 0,
  heatReleased: 0,
  temperatureHistory: Array.from({ length: 30 }, (_, i) => ({
    time: i,
    surface: 35 + Math.random() * 15,
    mid: 30 + Math.random() * 10,
    base: 28 + Math.random() * 8,
  })),

  // Vehicles
  vehicles: [],
  vehicleCounts: { car: 0, bus: 0, truck: 0 },

  // AI Insights
  insights: [
    { id: 1, text: 'System initialized. All sensors operational.', type: 'info', time: Date.now() },
    { id: 2, text: 'PCM capsules on standby mode.', type: 'info', time: Date.now() },
  ],

  // Cost
  electricityCost: 8, // ₹ per kWh

  // Actions
  toggleSimulation: () => set((s) => ({ isRunning: !s.isRunning })),
  setTrafficDensity: (v) => set({ trafficDensity: v }),
  setTemperatureOffset: (v) => set({ temperatureOffset: v }),
  setSensorSensitivity: (v) => set({ sensorSensitivity: v }),

  addInsight: (text, type = 'info') =>
    set((s) => ({
      insights: [
        { id: Date.now(), text, type, time: Date.now() },
        ...s.insights,
      ].slice(0, 20),
    })),

  tick: () => {
    const state = get();
    if (!state.isRunning) return;

    const density = state.trafficDensity / 100;
    const newVehicleChance = density * 0.3;
    let newVehicles = [...state.vehicles];
    let counts = { ...state.vehicleCounts };
    let energySpike = 0;

    // Spawn vehicles
    if (Math.random() < newVehicleChance) {
      const types = ['car', 'car', 'car', 'bus', 'truck'];
      const type = types[Math.floor(Math.random() * types.length)];
      const energyMap = { car: 2 + Math.random() * 8, bus: 50 + Math.random() * 100, truck: 100 + Math.random() * 100 };
      newVehicles.push({
        id: Date.now() + Math.random(),
        type,
        position: -5,
        energy: energyMap[type],
        lane: Math.floor(Math.random() * 3),
      });
      counts[type] = (counts[type] || 0) + 1;
    }

    // Move vehicles
    newVehicles = newVehicles
      .map((v) => ({ ...v, position: v.position + 0.5 }))
      .filter((v) => {
        if (v.position > 30) {
          energySpike += v.energy;
          return false;
        }
        return true;
      });

    // Update sensors
    const newSensors = state.sensors.map((s) => {
      const isNearVehicle = newVehicles.some(
        (v) => v.position > 0 && v.position < 25
      );
      const statusRoll = Math.random();
      let status = s.status;
      if (statusRoll < 0.002) status = 'fault';
      else if (statusRoll < 0.01) status = 'warning';
      else if (statusRoll < 0.05) status = 'active';

      return {
        ...s,
        status,
        energyGenerated: isNearVehicle
          ? s.type === 'piezo'
            ? Math.random() * 10 * (state.sensorSensitivity / 100)
            : s.energyGenerated
          : s.energyGenerated * 0.95,
        temperature:
          s.type === 'temperature'
            ? 30 + Math.random() * 15 + state.temperatureOffset
            : s.temperature,
        timestamp: Date.now(),
      };
    });

    // Temperature
    const tempBase = 35 + state.temperatureOffset;
    const newSurfaceTemp = tempBase + Math.random() * 10 + density * 5;
    const newMidTemp = tempBase - 4 + Math.random() * 8;
    const newBaseTemp = tempBase - 8 + Math.random() * 5;
    const newPcmActive = newSurfaceTemp > state.pcmThreshold;

    // Temperature history
    const newTempHistory = [
      ...state.temperatureHistory.slice(1),
      {
        time: state.temperatureHistory.length,
        surface: newSurfaceTemp,
        mid: newMidTemp,
        base: newBaseTemp,
      },
    ];

    // Energy
    const newCurrentPower = energySpike + density * 50 + Math.random() * 20;
    const newTotalEnergy = state.totalEnergyToday + newCurrentPower / 3600;

    // AI Insights
    let newInsights = state.insights;
    if (newPcmActive && !state.pcmActive) {
      newInsights = [
        { id: Date.now(), text: 'PCM cooling activated — surface temperature exceeded threshold!', type: 'warning', time: Date.now() },
        ...newInsights,
      ].slice(0, 20);
    }
    if (newCurrentPower > 300 && Math.random() < 0.02) {
      newInsights = [
        { id: Date.now(), text: 'High energy generation due to traffic surge!', type: 'success', time: Date.now() },
        ...newInsights,
      ].slice(0, 20);
    }
    if (newSurfaceTemp > 50 && Math.random() < 0.05) {
      const zone = ZONES[Math.floor(Math.random() * ZONES.length)];
      newInsights = [
        { id: Date.now(), text: `Road overheating detected at ${zone}!`, type: 'danger', time: Date.now() },
        ...newInsights,
      ].slice(0, 20);
    }

    set({
      vehicles: newVehicles,
      vehicleCounts: counts,
      sensors: newSensors,
      surfaceTemp: newSurfaceTemp,
      midTemp: newMidTemp,
      baseTemp: newBaseTemp,
      pcmActive: newPcmActive,
      temperatureHistory: newTempHistory,
      currentPower: newCurrentPower,
      totalEnergyToday: newTotalEnergy,
      heatAbsorbed: newPcmActive ? state.heatAbsorbed + Math.random() * 2 : state.heatAbsorbed,
      heatReleased: newPcmActive ? state.heatReleased + Math.random() * 1.5 : state.heatReleased,
      insights: newInsights,
    });
  },
}));

export default useStore;
