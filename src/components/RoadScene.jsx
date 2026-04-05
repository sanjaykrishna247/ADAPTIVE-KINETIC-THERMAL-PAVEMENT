import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';
import useStore from '../store/useStore';

function RoadLayer({ position, size, color, opacity = 0.8, label }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.emissiveIntensity = 0.1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={opacity} 
          emissive={color}
          emissiveIntensity={0.1}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(...size)]} />
        <lineBasicMaterial color={color} transparent opacity={0.5} />
      </lineSegments>
    </group>
  );
}

function PiezoSensor({ position, isActive }) {
  const meshRef = useRef();
  const glowRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
    }
    if (glowRef.current && isActive) {
      glowRef.current.material.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <cylinderGeometry args={[0.15, 0.15, 0.08, 16]} />
        <meshStandardMaterial 
          color={isActive ? '#00ff88' : '#333'}
          emissive={isActive ? '#00ff88' : '#000'}
          emissiveIntensity={isActive ? 0.5 : 0}
        />
      </mesh>
      {isActive && (
        <mesh ref={glowRef}>
          <cylinderGeometry args={[0.25, 0.25, 0.02, 16]} />
          <meshStandardMaterial 
            color="#00ff88"
            transparent
            opacity={0.2}
            emissive="#00ff88"
            emissiveIntensity={1}
          />
        </mesh>
      )}
    </group>
  );
}

function PCMCapsule({ position }) {
  const meshRef = useRef();
  const pcmActive = useStore((s) => s.pcmActive);
  
  useFrame((state) => {
    if (meshRef.current) {
      const intensity = pcmActive ? 0.6 : 0.1;
      meshRef.current.material.emissiveIntensity = intensity + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial 
        color={pcmActive ? '#00d4ff' : '#1a365d'}
        emissive={pcmActive ? '#00d4ff' : '#0a1929'}
        emissiveIntensity={0.2}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

function Vehicle({ type, position, lane }) {
  const meshRef = useRef();
  const colors = { car: '#00d4ff', bus: '#fbbf24', truck: '#ff6b35' };
  const sizes = { car: [0.6, 0.3, 0.35], bus: [1.2, 0.4, 0.4], truck: [1.0, 0.45, 0.45] };
  
  return (
    <group position={[position - 12, 0.85, (lane - 1) * 1.2]}>
      <mesh ref={meshRef}>
        <boxGeometry args={sizes[type]} />
        <meshStandardMaterial 
          color={colors[type]}
          emissive={colors[type]}
          emissiveIntensity={0.3}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>
      {/* Wheels */}
      {[-0.2, 0.2].map((x, i) => (
        <mesh key={i} position={[x, -0.15, sizes[type][2] / 2 + 0.02]}>
          <cylinderGeometry args={[0.06, 0.06, 0.04, 8]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      ))}
    </group>
  );
}

function EnergyParticles() {
  const ref = useRef();
  const count = 50;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = Math.random() * 0.6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      const pos = ref.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] -= 0.01;
        if (pos[i * 3 + 1] < -0.5) {
          pos[i * 3 + 1] = 0.8;
          pos[i * 3] = (Math.random() - 0.5) * 20;
        }
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
      ref.current.material.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.06} 
        color="#00ff88" 
        transparent 
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

function WiringNetwork() {
  const points = useMemo(() => {
    const lines = [];
    for (let x = -8; x <= 8; x += 2) {
      lines.push([
        new THREE.Vector3(x, -0.45, -1.5),
        new THREE.Vector3(x, -0.45, 1.5),
      ]);
    }
    lines.push([
      new THREE.Vector3(-8, -0.45, 0),
      new THREE.Vector3(8, -0.45, 0),
    ]);
    return lines;
  }, []);

  return (
    <>
      {points.map((line, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array(line.flatMap(v => [v.x, v.y, v.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#ff6b35" transparent opacity={0.4} />
        </line>
      ))}
    </>
  );
}

function DataHub() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -0.5, 2.5]}>
      <boxGeometry args={[1.5, 0.3, 0.8]} />
      <meshStandardMaterial 
        color="#a855f7"
        emissive="#a855f7"
        emissiveIntensity={0.3}
        metalness={0.7}
        roughness={0.2}
      />
    </mesh>
  );
}

function RoadMarkings() {
  const markings = [];
  for (let x = -10; x <= 10; x += 2) {
    markings.push(
      <mesh key={x} position={[x, 0.71, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.8, 0.08]} />
        <meshStandardMaterial color="#ffff88" emissive="#ffff44" emissiveIntensity={0.2} />
      </mesh>
    );
  }
  return <>{markings}</>;
}

export default function RoadScene() {
  const vehicles = useStore((s) => s.vehicles);
  const pcmActive = useStore((s) => s.pcmActive);

  const piezoPositions = useMemo(() => {
    const arr = [];
    for (let x = -8; x <= 8; x += 2) {
      for (let z = -1; z <= 1; z += 1) {
        arr.push([x, 0.35, z]);
      }
    }
    return arr;
  }, []);

  const pcmPositions = useMemo(() => {
    const arr = [];
    for (let x = -9; x <= 9; x += 1.2) {
      for (let z = -1.2; z <= 1.2; z += 0.8) {
        arr.push([x, 0.62, z]);
      }
    }
    return arr;
  }, []);

  return (
    <div className="canvas-container" style={{ position: 'relative' }}>
      <Canvas
        camera={{ position: [12, 8, 12], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#050810']} />
        <fog attach="fog" args={['#050810', 20, 40]} />
        
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <pointLight position={[0, 3, 0]} color="#00d4ff" intensity={0.5} />
        {pcmActive && <pointLight position={[0, 2, 0]} color="#00d4ff" intensity={1} />}
        
        {/* Base Layer - Wiring */}
        <RoadLayer 
          position={[0, -0.5, 0]} 
          size={[22, 0.3, 4.5]} 
          color="#1a1a2e"
          opacity={0.9}
          label="Base Layer"
        />
        
        {/* Middle Layer - Piezo */}
        <RoadLayer 
          position={[0, 0.1, 0]} 
          size={[22, 0.5, 4]} 
          color="#16213e"
          opacity={0.85}
          label="Piezoelectric Layer"
        />
        
        {/* Top Layer - PCM + Road Surface */}
        <RoadLayer 
          position={[0, 0.7, 0]} 
          size={[22, 0.3, 3.5]} 
          color="#2a2a3e"
          opacity={0.9}
          label="PCM + Surface"
        />

        {/* Piezo sensors */}
        {piezoPositions.map((pos, i) => (
          <PiezoSensor key={i} position={pos} isActive={vehicles.length > 0} />
        ))}

        {/* PCM capsules */}
        {pcmPositions.map((pos, i) => (
          <PCMCapsule key={i} position={pos} />
        ))}

        {/* Road markings */}
        <RoadMarkings />

        {/* Vehicles */}
        {vehicles.map((v) => (
          <Vehicle key={v.id} type={v.type} position={v.position} lane={v.lane} />
        ))}

        {/* Energy particles */}
        <EnergyParticles />

        {/* Wiring */}
        <WiringNetwork />

        {/* Data Hub */}
        <DataHub />
        
        {/* Grid helper */}
        <gridHelper args={[40, 40, '#0a1929', '#0a1929']} position={[0, -0.7, 0]} />
        
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05} 
          minDistance={5} 
          maxDistance={30}
          maxPolarAngle={Math.PI / 2.2}
        />
      </Canvas>
      
      <div className="scene-label">
        <span className="layer-tag" style={{ background: 'rgba(0,212,255,0.2)', color: '#00d4ff' }}>
          ❄ PCM Layer
        </span>
        <span className="layer-tag" style={{ background: 'rgba(0,255,136,0.2)', color: '#00ff88' }}>
          ⚡ Piezo Layer
        </span>
        <span className="layer-tag" style={{ background: 'rgba(255,107,53,0.2)', color: '#ff6b35' }}>
          🔌 Wiring + Hub
        </span>
      </div>
    </div>
  );
}
