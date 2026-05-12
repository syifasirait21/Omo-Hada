/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Float, Stars, useGLTF, Center } from '@react-three/drei';
import * as THREE from 'three';
import { toPng } from 'html-to-image';
import { 
  Heart, 
  Lightbulb, 
  Gamepad2, 
  ShieldAlert, 
  Play, 
  Info,
  ChevronRight,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  Volume2,
  LayoutGrid,
  Zap,
  ShieldCheck,
  Building2,
  Waves,
  AlertTriangle,
  Rotate3d,
  Box,
  RotateCcw,
  VolumeX,
  Table,
  DoorOpen,
  EyeOff,
  Home,
  Grab,
  MousePointer2,
  Lightbulb as LightbulbIcon,
  BookOpen,
  Check,
  Download,
  Award
} from 'lucide-react';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Nias Atmosphere Decor ---

function NiasAtmosphere() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Repeating Nias Geometric Pattern Layer */}
      <div className="absolute inset-0 opacity-[0.02]" 
           style={{ 
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30-30-30z' fill='%23000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
             backgroundSize: '40px 40px'
           }} 
      />

      <div className="absolute top-0 left-0 w-full h-full">
        {/* Animated Spirals (Ni'o Goli) */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`niogoli-${i}`}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              opacity: 0,
              scale: 0.5 + Math.random()
            }}
            animate={{ 
              y: ["0%", "100%"],
              opacity: [0, 0.05, 0],
              rotate: [0, 360]
            }}
            transition={{
              duration: 25 + Math.random() * 15,
              repeat: Infinity,
              delay: i * 2.5,
              ease: "linear"
            }}
            className="absolute"
          >
            <svg width="100" height="100" viewBox="0 0 100 100" className="text-stone-900 fill-none stroke-current stroke-[1.5]">
              <path d="M50 50 C 50 20, 80 20, 80 50 C 80 80, 20 80, 20 50 C 20 20, 60 20, 60 50 C 60 70, 40 70, 40 50" />
            </svg>
          </motion.div>
        ))}
        
        {/* Ni'o Talingawö Symbols (Earrings) */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`talinga-${i}`}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              opacity: 0
            }}
            animate={{ 
              opacity: [0, 0.04, 0],
              scale: [0.8, 1.1, 0.8]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: i * 4,
              ease: "easeInOut"
            }}
            className="absolute"
          >
            <svg width="80" height="80" viewBox="0 0 100 100" className="text-stone-900 fill-current">
              <path d="M50 10 C 30 10, 15 25, 15 45 C 15 65, 30 85, 50 90 C 70 85, 85 65, 85 45 C 85 25, 70 10, 50 10 M50 25 C 60 25, 70 35, 70 45 C 70 55, 60 65, 50 65 C 40 65, 30 55, 30 45 C 30 35, 40 25, 50 25 Z" />
            </svg>
          </motion.div>
        ))}

        {/* Floating Large Omo Hada Silhouettes */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-[0.012] pointer-events-none">
           <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" className="fill-stone-900">
             <path d="M50 180 L50 140 L30 140 L100 60 L170 140 L150 140 L150 180 Z M250 180 L250 150 L230 150 L300 80 L370 150 L350 150 L350 180 Z" />
           </svg>
        </div>
      </div>
      
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.06] mix-blend-multiply" 
           style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/natural-paper.png")` }} />
    </div>
  );
}


// --- 3D Components ---

// --- Procedural 3D Nias House ---

// Colors & Materials moved outside to avoid re-creation on every render
const woodMaterial = new THREE.MeshStandardMaterial({ color: '#5d4037', roughness: 0.8 });
const darkWoodMaterial = new THREE.MeshStandardMaterial({ color: '#3e2723', roughness: 0.9 });
const stoneMaterial = new THREE.MeshStandardMaterial({ color: '#757575', roughness: 0.6 });
const roofMaterial = new THREE.MeshStandardMaterial({ color: '#4e342e', roughness: 1 });

function ProceduralNiasHouse({ isShaking, simulationResult, onPartClick }: { 
  isShaking?: boolean, 
  simulationResult?: 'steady' | 'collapsed' | null,
  onPartClick?: (part: 'ehomo' | 'diwa' | 'paku') => void
}) {
  const groupRef = useRef<THREE.Group>(null);
  const roofRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const pillarsRef = useRef<THREE.Group>(null);
  const xPillarsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    if (isShaking) {
      const shakeIntensity = 0.15;
      const speed = 50;
      groupRef.current.position.x = Math.sin(state.clock.elapsedTime * speed) * shakeIntensity;
      groupRef.current.position.z = Math.cos(state.clock.elapsedTime * speed * 0.9) * shakeIntensity;
      
      // Horizontal torsion
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * speed * 0.5) * 0.02;
    } else {
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, 0, 0.1);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, 0, 0.1);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.1);
    }

    if (simulationResult === 'collapsed') {
      // DRAMATIC COLLAPSE - Parts fall and tilt independently in a chaotic manner
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -Math.PI * 0.15, 0.02);
      
      if (roofRef.current) {
        // Roof slides and tilts heavily
        roofRef.current.position.y = THREE.MathUtils.lerp(roofRef.current.position.y, -1.8, 0.04);
        roofRef.current.position.z = THREE.MathUtils.lerp(roofRef.current.position.z, 2.5, 0.035);
        roofRef.current.rotation.x = THREE.MathUtils.lerp(roofRef.current.rotation.x, Math.PI * 0.4, 0.04);
        roofRef.current.rotation.z = THREE.MathUtils.lerp(roofRef.current.rotation.z, -Math.PI * 0.25, 0.03);
      }
      
      if (bodyRef.current) {
        // Body collapses and pan-cakes
        bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, -2.5, 0.06);
        bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, -Math.PI * 0.2, 0.05);
        bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, Math.PI * 0.15, 0.03);
        bodyRef.current.scale.y = THREE.MathUtils.lerp(bodyRef.current.scale.y, 0.4, 0.05);
      }
      
      if (pillarsRef.current) {
        // Pillars fall apart
        pillarsRef.current.position.y = THREE.MathUtils.lerp(pillarsRef.current.position.y, -3.2, 0.04);
        pillarsRef.current.rotation.z = THREE.MathUtils.lerp(pillarsRef.current.rotation.z, Math.PI * 0.6, 0.05);
        pillarsRef.current.rotation.x = THREE.MathUtils.lerp(pillarsRef.current.rotation.x, Math.PI * 0.1, 0.04);
      }

      if (xPillarsRef.current) {
        xPillarsRef.current.position.y = THREE.MathUtils.lerp(xPillarsRef.current.position.y, -2.8, 0.08);
        xPillarsRef.current.rotation.x = THREE.MathUtils.lerp(xPillarsRef.current.rotation.x, -Math.PI * 0.5, 0.05);
      }
    } else {
      // RESET TO STEADY
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.1);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 0.1);

      if (roofRef.current) {
        roofRef.current.position.y = THREE.MathUtils.lerp(roofRef.current.position.y, 1.4, 0.1);
        roofRef.current.position.z = THREE.MathUtils.lerp(roofRef.current.position.z, 0, 0.1);
        roofRef.current.rotation.x = THREE.MathUtils.lerp(roofRef.current.rotation.x, 0, 0.1);
        roofRef.current.rotation.z = THREE.MathUtils.lerp(roofRef.current.rotation.z, 0, 0.1);
      }
      
      if (bodyRef.current) {
        bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, 0.8, 0.1);
        bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0, 0.1);
        bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, 0, 0.1);
        bodyRef.current.scale.y = THREE.MathUtils.lerp(bodyRef.current.scale.y, 1, 0.1);
      }
      
      if (pillarsRef.current) {
        pillarsRef.current.position.y = THREE.MathUtils.lerp(pillarsRef.current.position.y, -0.8, 0.1);
        pillarsRef.current.rotation.z = THREE.MathUtils.lerp(pillarsRef.current.rotation.z, 0, 0.1);
        pillarsRef.current.rotation.x = THREE.MathUtils.lerp(pillarsRef.current.rotation.x, 0, 0.1);
      }

      if (xPillarsRef.current) {
        xPillarsRef.current.position.y = THREE.MathUtils.lerp(xPillarsRef.current.position.y, -0.8, 0.1);
        xPillarsRef.current.rotation.x = THREE.MathUtils.lerp(xPillarsRef.current.rotation.x, 0, 0.1);
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Foundation Stones (Batu Umpak) - Stay put */}
      <group 
        position={[0, -2, 0]} 
        onClick={(e) => {
          e.stopPropagation();
          onPartClick?.('ehomo');
        }}
      >
        {[-2, 0, 2].map((x) => 
          [-1.5, 1.5].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, 0.1, z]} material={stoneMaterial} receiveShadow castShadow>
              <boxGeometry args={[0.8, 0.2, 0.8]} />
            </mesh>
          ))
        )}
      </group>

      {/* Pillars Group */}
      <group 
        ref={pillarsRef} 
        position={[0, -0.8, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onPartClick?.('diwa');
        }}
      >
        {[-1.8, 1.8].map((x) => 
          [-1.2, 1.2].map((z) => (
            <mesh key={`p-${x}-${z}`} position={[x, 0, z]} material={woodMaterial} castShadow>
              <cylinderGeometry args={[0.1, 0.12, 2.4]} />
            </mesh>
          ))
        )}
      </group>

      {/* Diwa (X-Pillars for stability) */}
      <group 
        ref={xPillarsRef} 
        position={[0, -0.8, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onPartClick?.('diwa');
        }}
      >
        <mesh rotation={[0, 0, Math.PI * 0.2]} material={woodMaterial} castShadow>
          <boxGeometry args={[0.08, 3.2, 0.08]} />
        </mesh>
        <mesh rotation={[0, 0, -Math.PI * 0.2]} material={woodMaterial} castShadow>
          <boxGeometry args={[0.08, 3.2, 0.08]} />
        </mesh>
      </group>

      {/* House Body */}
      <group 
        ref={bodyRef} 
        position={[0, 0.8, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onPartClick?.('paku');
        }}
      >
        <mesh material={darkWoodMaterial} castShadow receiveShadow>
          <boxGeometry args={[4.5, 1.2, 3]} />
        </mesh>
        {/* Decorative Front Door */}
        <mesh position={[0, 0, 1.51]} material={woodMaterial}>
          <boxGeometry args={[0.6, 0.8, 0.1]} />
        </mesh>
      </group>

      {/* Massive Roof Group */}
      <group 
        ref={roofRef} 
        position={[0, 1.4, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onPartClick?.('paku');
        }}
      >
        <mesh position={[0, 1.9, 0]} material={roofMaterial} castShadow rotation={[0, Math.PI * 0.25, 0]}>
          <coneGeometry args={[4.2, 3.8, 4]} />
        </mesh>
        
        {/* Roof Extensions (Ornaments / Ni'o Goli style) */}
        <mesh position={[0, 1.3, 1.6]} rotation={[Math.PI * 0.15, 0, 0]} material={darkWoodMaterial} castShadow>
           <boxGeometry args={[5, 0.15, 1.2]} />
        </mesh>
        <mesh position={[0, 1.3, -1.6]} rotation={[-Math.PI * 0.15, 0, 0]} material={darkWoodMaterial} castShadow>
           <boxGeometry args={[5, 0.15, 1.2]} />
        </mesh>
      </group>
    </group>
  );
}

function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-stone-100/50 backdrop-blur-sm z-10">
      <div className="flex flex-col items-center">
        <RefreshCcw className="text-nias-gold animate-spin mb-2" size={24} />
        <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Membangun Struktur...</span>
      </div>
    </div>
  );
}

function OmoHadaModel({ onPartClick }: { onPartClick?: (part: 'ehomo' | 'diwa' | 'paku') => void }) {
  const { scene } = useGLTF('/omo-hada.glb');
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);
  
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          // Ensure textures/colors are bright
          if ('emissive' in child.material) {
             (child.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
          }
        }
      }
    });
  }, [clonedScene]);

  return (
    <Center>
      <primitive 
        object={clonedScene} 
        scale={4.0} // Robust scale for visibility
        onClick={(e: any) => {
          e.stopPropagation();
          const name = (e.object?.name || '').toLowerCase();
          let part: 'ehomo' | 'diwa' | 'paku' | undefined;
          
          if (name.includes('roof') || name.includes('atap') || name.includes('paku')) part = 'paku';
          else if (name.includes('pillar') || name.includes('tiang') || name.includes('diwa')) part = 'diwa';
          else if (name.includes('base') || name.includes('stone') || name.includes('ehomo')) part = 'ehomo';
          
          onPartClick?.(part as any);
        }}
      />
    </Center>
  );
}

useGLTF.preload('/omo-hada.glb');

function House3DViewer({ isShaking, simulationResult, onPartClick, useModel = false }: { 
  isShaking?: boolean, 
  simulationResult?: 'steady' | 'collapsed' | null,
  onPartClick?: (part: 'ehomo' | 'diwa' | 'paku') => void,
  useModel?: boolean
}) {
  return (
    <div className="w-full h-full bg-stone-100 rounded-3xl overflow-hidden relative shadow-inner">
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-stone-200 text-stone-500 shadow-sm pointer-events-none">
        <Rotate3d size={16} />
        <span className="text-[10px] font-bold uppercase tracking-wider">Model 3D Interaktif</span>
      </div>
      
      <Canvas 
        shadows 
        dpr={[1, 2]} 
        className="w-full h-full"
        gl={{ antialias: true }}
      >
        <PerspectiveCamera makeDefault position={[0, 4, 12]} fov={35} />
        <OrbitControls 
          enablePan={true} 
          minDistance={3} 
          maxDistance={20} 
          autoRotate={!isShaking && !simulationResult}
          autoRotateSpeed={0.5}
        />
        
        {/* Enhanced Environment & Lighting for Student Clarity */}
        <Environment preset="apartment" />
        <ambientLight intensity={1.5} />
        <directionalLight 
          position={[15, 25, 15]} 
          intensity={2.5} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-15, 10, -15]} intensity={2} color="#ffffff" />
        <spotLight position={[0, 20, 0]} intensity={3} angle={0.5} penumbra={1} castShadow />
        <Stars radius={150} depth={60} count={1000} factor={4} saturation={0} fade speed={1} />
        
        <Suspense fallback={null}>
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            {useModel ? (
              <OmoHadaModel onPartClick={onPartClick} />
            ) : (
              <ProceduralNiasHouse 
                isShaking={isShaking} 
                simulationResult={simulationResult} 
                onPartClick={onPartClick}
              />
            )}
          </Float>
          <ContactShadows 
            position={[0, -2, 0]} 
            opacity={0.4} 
            scale={20} 
            blur={2} 
            far={4.5} 
          />
        </Suspense>
      </Canvas>

      {isShaking && (
        <div className="absolute inset-0 bg-brick-red/5 pointer-events-none animate-pulse z-20" />
      )}
      
      {!isShaking && simulationResult !== 'collapsed' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-stone-900/60 backdrop-blur-sm rounded-full pointer-events-none">
          <p className="text-white text-[9px] font-bold uppercase tracking-widest text-center">
            Gunakan Jari untuk Mengeksplorasi
          </p>
        </div>
      )}
    </div>
  );
}

// --- Main Application ---

type Page = 'dashboard' | 'mindful' | 'meaningful' | 'joyful' | 'mitigasi';

function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Preload intro images to ensure snappy transitions
    const imageUrls = [
      "/Splash1.png", 
      "/splash2.png", 
      "/splash3.png"
    ];
    imageUrls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }, []);
  
  const steps = [
    {
      title: "Nias, Maret 2005",
      desc: "Gempa dahsyat melanda. Banyak bangunan hancur rata dengan tanah.",
      image: "/Splash1.png", 
      fallback: "https://images.unsplash.com/photo-1547841022-b558accc7ef8?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Omo Hada, Tetap Tegak!",
      desc: "Namun, rumah adat Omo Hada justru tetap kokoh berdiri tanpa kerusakan berarti.",
      image: "/splash2.png",
      fallback: "https://images.unsplash.com/photo-1596422846543-75c6fc18a5ce?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Apa Rahasianya?",
      desc: "Mari selidiki bagaimana kearifan lokal leluhur Nias bisa menaklukkan kekuatan gempa bumi!",
      image: "/splash3.png",
      fallback: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800",
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[100] bg-[#dfc9b0] flex flex-col items-center overflow-hidden"
    >
      {/* Nias Pattern for Splash Background */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
           style={{ 
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30-30-30z' fill='%23000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
             backgroundSize: '30px 30px'
           }} 
      />

      {/* --- Persistent Background Elements --- */}
      {/* Header Pill */}
      <motion.div 
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="absolute top-5 left-1/2 -translate-x-1/2 bg-white rounded-full w-[200px] h-[46px] flex items-center justify-center gap-3 shadow-xl border-2 border-white/80 z-50"
      >
        <div className="w-8 h-8 flex items-center justify-center shrink-0">
          <img 
            src="/Lambang_Universitas_Negeri_Medan.png" 
            alt="UNIMED" 
            className="w-full h-full object-contain"
          />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-black leading-none text-stone-900 uppercase tracking-tighter">ILMU PENGETAHUAN ALAM</p>
          <p className="text-[8px] font-bold text-stone-500 uppercase tracking-tight mt-0.5">UNIVERSITAS NEGERI MEDAN</p>
        </div>
      </motion.div>

      {/* Decorative Clouds */}
      <motion.div 
        animate={{ x: [-10, 10] }}
        transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', ease: "easeInOut" }}
        className="absolute top-24 -right-10 opacity-60 z-10"
      >
        <svg width="140" height="80" viewBox="0 0 120 70" fill="white">
          <path d="M30 60c-12 0-22-8-22-20s10-20 22-20c4-8 12-12 20-12s16 4 20 12c8-4 20-4 28 8 8 12 4 32-16 32H30z" />
        </svg>
      </motion.div>
      <motion.div 
        animate={{ x: [10, -10] }}
        transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse', ease: "easeInOut" }}
        className="absolute top-[45%] -left-12 opacity-50 z-10"
      >
        <svg width="120" height="70" viewBox="0 0 100 60" fill="white">
          <path d="M25 50c-10 0-18-6-18-16s8-16 18-16c3-6 10-10 16-10s13 4 16 10c6-3 16-3 22 6 6 9 3 26-12 26H25z" />
        </svg>
      </motion.div>

      {/* --- Main Content (Animated) --- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full h-full flex flex-col items-center"
        >
          {/* Text Content */}
          <div className="pt-[20vh] px-8 text-center space-y-3 z-20">
            <h1 className="text-[32px] font-black text-stone-900 tracking-tighter leading-[1.1] max-w-[300px] mx-auto">
              {steps[step].title}
            </h1>
            <p className="text-stone-800/80 font-bold text-base leading-relaxed px-2 max-w-[320px] mx-auto">
              {steps[step].desc}
            </p>
          </div>

          {/* Illustration Section */}
          <div className="mt-auto w-full relative">
            <div className="w-full relative h-[60vh] flex items-end">
              <img 
                src={steps[step].image} 
                onError={(e) => {
                  if (steps[step].fallback) {
                    (e.target as HTMLImageElement).src = steps[step].fallback!;
                  }
                }}
                alt="Illustration"
                className="w-full h-full object-cover object-bottom"
              />
              {/* Soft overlay to blend image with background at the top */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#dfc9b0] via-transparent to-transparent h-32 pointer-events-none" />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* --- Fixed Controls (Non-Animated Bottom Elements) --- */}
      {/* Pagination Dots */}
      <div className="absolute bottom-[112px] left-1/2 -translate-x-1/2 flex gap-3 z-50">
        {steps.map((_, i) => (
          <motion.div 
            key={i} 
            animate={{ 
              scale: step === i ? 1.2 : 1,
              opacity: step === i ? 1 : 0.4
            }}
            className={`h-2.5 rounded-full shadow-sm transition-all duration-300 ${step === i ? 'w-8 bg-[#94d1f2]' : 'w-2.5 bg-white'}`} 
          />
        ))}
      </div>

      {/* Bottom Button Area */}
      <div className="absolute bottom-0 w-full px-8 pb-10 z-50 flex justify-center">
        <button
          onClick={() => {
            if (step < steps.length - 1) {
              setStep(step + 1);
            } else {
              onComplete();
            }
          }}
          className="w-[200px] h-10 bg-stone-900 text-white rounded-full font-black text-[10px] tracking-[0.2rem] shadow-2xl active:scale-[0.98] transition-all uppercase flex items-center justify-center gap-2"
        >
          {step === steps.length - 1 ? (
            <>
              Mulai Eksplorasi
              <ChevronRight size={14} strokeWidth={3} />
            </>
          ) : (
            <>
              Lanjutkan
              <ChevronRight size={12} strokeWidth={2.5} />
            </>
          )}
        </button>
      </div>

      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.08] mix-blend-multiply pointer-events-none" 
           style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/natural-paper.png")` }} />
    </motion.div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const saved = localStorage.getItem('nias_current_page');
    // Validate that the saved value is a valid Page
    const validPages: Page[] = ['dashboard', 'mindful', 'meaningful', 'joyful', 'mitigasi'];
    if (saved && validPages.includes(saved as Page)) {
      return saved as Page;
    }
    return 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('nias_current_page', currentPage);
  }, [currentPage]);

  const [isShaking, setIsShaking] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutGrid },
    { id: 'mindful', label: 'Mindful', icon: Heart },
    { id: 'meaningful', label: 'Meaningful', icon: Lightbulb },
    { id: 'joyful', label: 'Joyful', icon: Gamepad2 },
    { id: 'mitigasi', label: 'Mitigasi', icon: ShieldAlert },
  ];

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-cream-bg overflow-hidden border-x border-stone-200 relative">
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 overflow-y-auto no-scrollbar pb-20 relative z-10"
          >
            <NiasAtmosphere />
            <AnimatePresence mode="wait">
              {currentPage === 'dashboard' && <DashboardPage key="dashboard" onSelect={(p) => setCurrentPage(p)} />}
              {currentPage === 'mindful' && <MindfulPage key="mindful" onNext={() => setCurrentPage('meaningful')} />}
              {currentPage === 'meaningful' && <MeaningfulPage key="meaningful" />}
              {currentPage === 'joyful' && <JoyfulPage key="joyful" isShaking={isShaking} setIsShaking={setIsShaking} />}
              {currentPage === 'mitigasi' && <MitigasiPage key="mitigasi" />}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      {!showSplash && (
        <nav className="bg-cream-bg/95 backdrop-blur-md border-t border-stone-200 h-16 flex items-center justify-around fixed bottom-0 w-full max-w-md z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id as Page)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
                  isActive ? 'text-brick-red' : 'text-stone-400'
                }`}
              >
                <Icon size={20} className={isActive ? 'fill-brick-red/10' : ''} />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 w-8 h-1 bg-brick-red rounded-t-full"
                  />
                )}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}

function DashboardPage({ onSelect }: { onSelect: (p: Page) => void }) {
  interface ModuleItem {
    id: Page;
    title: string;
    subtitle: string;
    icon: any;
    color: string;
    des: string;
    size: 'large' | 'small';
    pattern?: string;
  }

  const modules: ModuleItem[] = [
    { 
      id: 'mindful', 
      title: 'Mindful', 
      subtitle: 'Sejarah & Tragedi', 
      icon: Heart, 
      color: 'bg-brick-red', 
      des: 'Pahami luka masa lalu & kearifan lokal masyarakat Nias.',
      size: 'large'
    },
    { 
      id: 'meaningful', 
      title: 'Pemahaman Mendalam', 
      subtitle: 'Struktur', 
      icon: Lightbulb, 
      color: 'bg-nias-gold', 
      des: 'Anatomi Omo Hada.',
      size: 'small' 
    },
    { 
      id: 'joyful', 
      title: 'Joyful', 
      subtitle: 'Simulasi', 
      icon: Gamepad2, 
      color: 'bg-wood-dark', 
      des: 'Uji kekuatan desain.',
      size: 'small'
    },
    { 
      id: 'mitigasi', 
      title: 'Mitigasi', 
      subtitle: 'Aksi Penyelamatan', 
      icon: ShieldAlert, 
      color: 'bg-stone-800', 
      des: 'Langkah siaga darurat & evakuasi.',
      size: 'large'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-8 min-h-screen bg-cream-bg relative overflow-hidden"
    >
      {/* Dynamic Nias Pattern Background */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 - 50 + "%", 
              y: Math.random() * 100 - 50 + "%",
              rotate: Math.random() * 360,
              opacity: 0.03
            }}
            animate={{ 
              x: [
                Math.random() * 100 - 50 + "%", 
                "50%", 
                Math.random() * 100 - 50 + "%"
              ],
              y: [
                Math.random() * 100 - 50 + "%", 
                "50%", 
                Math.random() * 100 - 50 + "%"
              ],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 40 + Math.random() * 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute w-64 h-64 border-[1px] border-stone-400"
            style={{ 
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              borderWidth: i % 2 === 0 ? '1px' : '4px'
            }}
          />
        ))}
      </div>

      <header className="relative mt-4 space-y-1">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute -top-6 -left-6 w-32 h-32 bg-brick-red/5 rounded-full blur-3xl -z-10"
        />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brick-red/60">Ayo Belajar</p>
        <h1 className="text-4xl font-black text-wood-dark tracking-tighter leading-none">
          Ya'ahowu, <br/>
          <span className="text-brick-red">Nono Niha!</span>
        </h1>
        <div className="flex items-center gap-2 mt-4">
          <div className="h-1 w-12 bg-nias-gold rounded-full" />
          <p className="text-stone-500 text-[11px] font-bold uppercase tracking-widest">Pilih Jalur Belajar Anda</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {modules.map((m, idx) => {
          const Icon = m.icon;
          const isLarge = m.size === 'large';
          
          return (
            <motion.button
              key={m.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileHover={{ 
                y: -8, 
                scale: 1.02,
                transition: { type: "spring", stiffness: 400, damping: 25 }
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ delay: idx * 0.1, type: "spring", stiffness: 300, damping: 24 }}
              onClick={() => onSelect(m.id as Page)}
              className={`group relative flex flex-col items-start p-5 bg-white rounded-[32px] border border-stone-100 text-left overflow-hidden transition-all duration-300
                ${isLarge ? 'col-span-2 shadow-sm hover:shadow-2xl hover:border-brick-red/20' : 'col-span-1 shadow-sm hover:shadow-xl hover:border-nias-gold/30'}
              `}
            >
              {/* Decorative Pattern Background */}
              <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none z-0">
                <Icon size={isLarge ? 120 : 60} strokeWidth={1} />
              </div>

              <div className={`${m.color} p-2.5 rounded-2xl ${m.id === 'meaningful' ? 'text-stone-900' : 'text-white'} mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg`}>
                <Icon size={20} />
              </div>

              <div className="space-y-1 relative z-10">
                <span className="text-[9px] uppercase font-black tracking-widest text-stone-400 group-hover:text-brick-red underline decoration-nias-gold/30 underline-offset-4 transition-colors">
                  {m.subtitle}
                </span>
                <h3 className={`font-black text-stone-800 tracking-tight leading-tight transition-all ${isLarge ? 'text-2xl' : 'text-lg'}`}>
                  {m.title}
                </h3>
                <p className={`text-stone-500 font-bold leading-relaxed opacity-70 transition-opacity group-hover:opacity-100 ${isLarge ? 'text-[11px] mt-1 pr-12' : 'text-[9px] line-clamp-2'}`}>
                  {m.des}
                </p>
              </div>

              {isLarge && (
                <div className="absolute bottom-5 right-5 w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center text-stone-300 group-hover:bg-brick-red group-hover:text-white transition-all shadow-inner">
                  <ChevronRight size={20} />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-stone-900 p-6 rounded-[32px] shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-nias-gold/10 rounded-full blur-2xl -mr-12 -mt-12" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-nias-gold/20 rounded-2xl flex items-center justify-center text-nias-gold shrink-0">
            <ShieldAlert size={24} />
          </div>
          <div className="space-y-1">
            <p className="text-white font-black text-sm tracking-tight capitalize italic">"Kearifan lokal adalah tameng kita di masa depan."</p>
            <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">- Pesan Leluhur Nias</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MindfulPage({ onNext }: { onNext: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 space-y-6"
    >
      <header className="space-y-2">
        <div className="flex border-b-2 border-dashed border-stone-200 pb-2 mb-4">
          <span className="text-brick-red font-black text-[10px] uppercase tracking-[0.2em] italic">Sejarah & Tragedi</span>
        </div>
        <h1 className="text-3xl font-black text-stone-900 tracking-tighter leading-none uppercase italic">Maret 2005,<br />Nias Berguncang</h1>
      </header>

      <div className="relative aspect-video bg-stone-900 rounded-[32px] overflow-hidden shadow-2xl border-4 border-white">
        <iframe 
          className="w-full h-full"
          src="https://www.youtube.com/embed/9xHnjrmA6No"
          title="Nias Earthquake Documentary"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>

      <div className="space-y-4 text-stone-800 leading-relaxed text-sm font-medium">
        <p>
          Bumi berguncang hebat di tengah malam. Di pusat kota, bangunan beton tinggi runtuh menjadi puing dalam sekejap. Isak tangis terdengar di mana-mana.
        </p>
        <div className="bg-brick-red/5 p-5 rounded-[24px] border-2 border-brick-red/10 border-dashed">
          <p className="italic font-black text-brick-red uppercase tracking-tight text-xs">
            "Namun di pelosok desa, rumah-rumah panggung tua dari kayu justru tetap berdiri tegak, seolah menari mengikuti irama gempa."
          </p>
        </div>
        <p>
          Rumah itu adalah <strong>Omo Hada</strong>. Bagaimana mungkin bangunan kayu tanpa paku bisa lebih kuat dari beton bertulang?
        </p>
      </div>

      <button 
        onClick={onNext}
        className="w-full bg-brick-red text-white font-black py-5 rounded-[24px] flex items-center justify-center gap-3 shadow-2xl shadow-brick-red/30 active:scale-95 transition-transform uppercase tracking-widest text-xs border-b-4 border-red-900"
      >
        Selidiki Rahasianya
        <ChevronRight size={18} />
      </button>
    </motion.div>
  );
}

function MeaningfulPage() {
  const anatomyDetails = {
    ehomo: {
      title: "Ehomo (Pondasi Batu)",
      desc: "Tiang kayu tidak ditanam di tanah, tapi diletakkan di atas batu datar (Pondasi Terapung).",
      science: "Konsep Inersia (Hukum I Newton): Karena rumah tidak 'diikat' ke tanah, saat tanah bergerak gempa mendatar, rumah cenderung mempertahankan posisinya. Rumah hanya 'bergeser' di atas batu, bukan patah."
    },
    diwa: {
      title: "Diwa (Tiang Menyilang)",
      desc: "Kayu dipasang menyilang membentuk huruf 'X' yang saling mengunci.",
      science: "Konsep Elastisitas: Tiang menyilang (Diwa) bersifat elastis. Saat energi gempa masuk, sambungan ini bergerak fleksibel untuk menyerap energi (Disipasi Energi), mendistribusikan beban secara merata."
    },
    paku: {
      title: "Tanpa Paku",
      desc: "Seluruh sambungan menggunakan sistem pasak (lubang dan pengunci).",
      science: "Sistem Sambungan Fleksibel: Mengurangi tegangan kaku. Berdasarkan rumus F = m × a, percepatan gempa menghasilkan gaya besar, namun diredam oleh fleksibilitas sambungan kayu."
    }
  };

  const [activeModal, setActiveModal] = useState<keyof typeof anatomyDetails | null>(() => {
    const saved = localStorage.getItem('nias_meaningful_modal');
    if (saved && Object.keys(anatomyDetails).includes(saved)) {
      return saved as keyof typeof anatomyDetails;
    }
    return 'ehomo';
  });
  const [activeTab, setActiveTab] = useState<'etno' | 'science'>('etno');
  const [viewedParts, setViewedParts] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('nias_meaningful_viewed');
    return saved ? new Set(JSON.parse(saved)) : new Set(['ehomo']);
  });

  useEffect(() => {
    if (activeModal) {
      setViewedParts(prev => {
        const next = new Set([...prev, activeModal]);
        localStorage.setItem('nias_meaningful_viewed', JSON.stringify([...next]));
        return next;
      });
    }
  }, [activeModal]);

  const explorationMode = viewedParts.size >= 3;

  const playKnock = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch (e) {
      console.warn("Audio play failed", e);
    }
  };

  const handleModelClick = (part?: string) => {
    if (!explorationMode) return;
    
    playKnock();
    
    const validParts: (keyof typeof anatomyDetails)[] = ['ehomo', 'diwa', 'paku'];
    
    if (part && validParts.includes(part as any)) {
      setActiveModal(part as any);
    } else if (activeModal) {
      // Cycle through parts if target is ambiguous
      const currentIndex = validParts.indexOf(activeModal);
      const nextIndex = (currentIndex + 1) % validParts.length;
      setActiveModal(validParts[nextIndex]);
    }
  };

  return (
    <div className="flex flex-col bg-cream-bg font-sans">
      <header className="pt-4 pb-3 text-center relative border-b border-stone-200/50">
        <h2 className="text-xl font-black text-stone-900 tracking-tighter uppercase italic">
          Anatomi Omo Hada<br/>
          <span className="text-xs font-bold block text-brick-red tracking-widest">(Rahasia Struktur)</span>
        </h2>
        <div className="absolute top-4 right-6">
          <button onClick={playKnock} className="bg-white p-2.5 rounded-full shadow-lg text-brick-red active:scale-95 transition-transform border border-stone-100">
            <Volume2 size={20} />
          </button>
        </div>
      </header>

      <div className="relative flex flex-col items-center pb-8 px-6 pt-6">
        <div className="w-full max-w-md flex flex-col gap-6">
          {/* Main 3D Viewer Area */}
          <div className="relative w-full aspect-[4/3] bg-stone-100 rounded-[40px] overflow-hidden border-2 border-white shadow-2xl group ring-1 ring-stone-200">
            <Suspense fallback={<Loader />}>
              <House3DViewer useModel={true} onPartClick={handleModelClick} />
            </Suspense>
            
            <div className={`absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full border border-stone-200 text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2 ${
              explorationMode ? 'text-brick-red border-brick-red/30 shadow-lg scale-110 z-20' : 'text-stone-500 opacity-0 group-hover:opacity-100'
            }`}>
              {explorationMode ? (
                <>
                  <div className="w-1.5 h-1.5 bg-brick-red rounded-full animate-ping" />
                  Mode Eksplorasi: Ketuk Rumah
                </>
              ) : (
                'Slide putar • Zoom detail'
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'ehomo', label: 'Ehomo', point: 'Poin 1' },
              { id: 'diwa', label: 'Diwa', point: 'Poin 2' },
              { id: 'paku', label: 'Tanpa Paku', point: 'Poin 3' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { playKnock(); setActiveModal(item.id as any); }}
                className={`py-4 px-2 rounded-[24px] flex flex-col items-center transition-all border-2 ${
                  activeModal === item.id 
                    ? 'bg-brick-red border-brick-red text-white shadow-xl scale-105 ring-4 ring-brick-red/20' 
                    : 'bg-white border-stone-100 text-stone-400 hover:border-stone-200 active:scale-95'
                }`}
              >
                <span className="text-[10px] font-black uppercase mb-1 opacity-60 tracking-wider">{item.point}</span>
                <span className="text-xs font-black tracking-tight leading-tight text-center">{item.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeModal && (
              <motion.div 
                key={activeModal}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[40px] shadow-2xl relative border-2 border-stone-100 mb-8 overflow-hidden"
              >
                {/* Tab Controller */}
                <div className="flex p-1.5 bg-stone-100 mx-4 mt-4 mb-2 rounded-[32px] items-center">
                  <button 
                    onClick={() => setActiveTab('etno')}
                    className={`h-[35px] w-[149px] rounded-[28px] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'etno' ? 'bg-white text-brick-red shadow-md' : 'text-stone-400'
                    }`}
                  >
                    <BookOpen size={14} />
                    etno
                  </button>
                  <button 
                    onClick={() => setActiveTab('science')}
                    className={`h-[35px] flex-1 rounded-[28px] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'science' ? 'bg-stone-900 text-nias-gold shadow-md' : 'text-stone-400'
                    }`}
                  >
                    <Zap size={14} />
                    Sains
                  </button>
                </div>

                <div className="p-8 pt-4">
                  <AnimatePresence mode="wait">
                    {activeTab === 'etno' ? (
                      <motion.div
                        key="etno"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full bg-brick-red" />
                          <h3 className="text-[20px] font-black text-stone-900 tracking-tighter uppercase italic">{anatomyDetails[activeModal].title}</h3>
                        </div>
                        <div className="space-y-1">
                          <p className="text-brick-red font-black text-[10px] uppercase tracking-[0.2em] opacity-40">Filosofi Tradisional</p>
                          <p className="text-stone-800 text-[15px] text-left leading-snug font-bold">
                            {anatomyDetails[activeModal].desc}
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="science"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-nias-gold rounded-full" />
                            <h3 className="text-xl font-black text-stone-900 tracking-tight uppercase">Mari memahami</h3>
                          </div>
                          {activeModal === 'paku' && (
                            <div className="bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-700">
                              <span className="font-mono font-black text-nias-gold text-xs tracking-widest">F = m × a</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-stone-900 rounded-[32px] p-6 shadow-xl border border-stone-800 group h-full">
                          <p className="text-stone-300 text-xs leading-relaxed font-medium italic">
                            {anatomyDetails[activeModal].science}
                          </p>
                          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                            <span className="text-white/20 text-[9px] font-black uppercase tracking-widest">Structural Engineering</span>
                            <div className="flex gap-1">
                              <div className="w-1 h-1 bg-nias-gold/40 rounded-full" />
                              <div className="w-1 h-1 bg-nias-gold/60 rounded-full" />
                              <div className="w-1 h-1 bg-nias-gold/80 rounded-full" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function HouseSVGViewer({ isShaking, simulationResult }: { isShaking?: boolean, simulationResult?: 'steady' | 'collapsed' | null }) {
  return (
    <div className="w-full h-64 relative flex items-center justify-center overflow-hidden bg-stone-50/50 rounded-3xl border-2 border-dashed border-stone-200 shadow-inner">
      <motion.svg 
        viewBox="0 0 400 300" 
        className="w-full h-full drop-shadow-2xl"
        initial={false}
        animate={isShaking ? { 
          x: [0, -8, 8, -8, 0],
          y: [0, -2, 2, -2, 0],
          rotate: [0, -1, 1, -1, 0]
        } : (simulationResult === 'collapsed' ? {
          rotate: -15,
          y: 40,
          opacity: 0.8
        } : { rotate: 0, y: 0, opacity: 1 })}
        transition={isShaking ? { repeat: Infinity, duration: 0.1 } : { type: 'spring', damping: 10 }}
      >
        {/* Ground */}
        <line x1="50" y1="260" x2="350" y2="260" stroke="#78716c" strokeWidth="4" strokeLinecap="round" />
        
        {/* Foundation Pillars */}
        <g stroke="#57534e" strokeWidth="8" strokeLinecap="round">
          <line x1="120" y1="260" x2="140" y2="200" />
          <line x1="280" y1="260" x2="260" y2="200" />
          <line x1="200" y1="260" x2="200" y2="200" />
          
          {/* Diwa (X-Pillars) */}
          <line x1="140" y1="260" x2="260" y2="200" opacity="0.4" />
          <line x1="260" y1="260" x2="140" y2="200" opacity="0.4" />
        </g>

        {/* Main Structure Base */}
        <motion.rect 
          x="100" y="140" width="200" height="60" rx="8" 
          fill="#a8a29e" 
          stroke="#57534e" strokeWidth="4"
        />

        {/* Roof */}
        <motion.path 
          d="M80 150 L200 40 L320 150 Z" 
          fill="#7c2d12" 
          stroke="#451a03" strokeWidth="4" strokeLinejoin="round" 
        />
        
        {/* Windows */}
        <rect x="130" y="160" width="30" height="30" rx="4" fill="#e7e5e4" stroke="#57534e" strokeWidth="2" />
        <rect x="240" y="160" width="30" height="30" rx="4" fill="#e7e5e4" stroke="#57534e" strokeWidth="2" />

        {/* Dynamic Cracks or Effects */}
        {simulationResult === 'collapsed' && !isShaking && (
          <g stroke="#ef4444" strokeWidth="3" opacity="0.6">
            <path d="M150 140 L160 170 L145 190" fill="none" />
            <path d="M250 145 L240 175 L255 200" fill="none" />
          </g>
        )}
      </motion.svg>

      {/* Decorative environment elements */}
      {!isShaking && (
        <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-stone-200 text-[10px] font-black text-stone-400 uppercase tracking-widest">
          Simulasi Visual Dasar
        </div>
      )}
    </div>
  );
}

function JoyfulPage({ isShaking, setIsShaking }: { isShaking: boolean, setIsShaking: (v: boolean) => void }) {
  const [pondasi, setPondasi] = useState<string>(() => localStorage.getItem('nias_joyful_pondasi') || '');
  const [sambungan, setSambungan] = useState<string>(() => localStorage.getItem('nias_joyful_sambungan') || '');
  const [simulationResult, setSimulationResult] = useState<'steady' | 'collapsed' | null>(() => {
    const saved = localStorage.getItem('nias_joyful_result');
    return (saved === 'steady' || saved === 'collapsed') ? saved : null;
  });

  // Pre-load audio elements
  const audioRefs = useRef({
    earthquake: new Audio('https://assets.mixkit.co/active_storage/sfx/2567/2567-preview.mp3'),
    success: new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'),
    failure: new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3')
  });

  useEffect(() => {
    // Set volumes
    audioRefs.current.earthquake.volume = 0.5;
    audioRefs.current.success.volume = 0.5;
    audioRefs.current.failure.volume = 0.5;
  }, []);

  useEffect(() => { localStorage.setItem('nias_joyful_pondasi', pondasi); }, [pondasi]);
  useEffect(() => { localStorage.setItem('nias_joyful_sambungan', sambungan); }, [sambungan]);
  useEffect(() => { localStorage.setItem('nias_joyful_result', simulationResult || ''); }, [simulationResult]);

  const handleSimulate = () => {
    if (!pondasi || !sambungan) return;

    const { earthquake, success, failure } = audioRefs.current;
    
    earthquake.currentTime = 0;
    earthquake.play().catch(() => {});

    setSimulationResult(null);
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
      earthquake.pause();
      earthquake.currentTime = 0;

      if (pondasi === 'umpak' && sambungan === 'pasak') {
        setSimulationResult('steady');
        success.currentTime = 0;
        success.play().catch(() => {});
      } else {
        setSimulationResult('collapsed');
        failure.currentTime = 0;
        failure.play().catch(() => {});
      }
    }, 3000);
  };

  const getOptionStyle = (type: 'pondasi' | 'sambungan', value: string) => {
    const isSelected = type === 'pondasi' ? pondasi === value : sambungan === value;
    if (!isSelected) return 'border-white bg-white/50 text-stone-400';
    
    // Heritage gold for selection
    return 'border-nias-gold bg-nias-gold text-stone-900 shadow-xl scale-[1.05] ring-4 ring-nias-gold/20';
  };

  return (
    <div className={`p-6 space-y-8 flex flex-col items-center min-h-[600px] bg-cream-bg ${isShaking ? 'animate-earthquake' : ''}`}>
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-brick-red tracking-tighter uppercase italic drop-shadow-sm">Guncang Nias!</h2>
        <p className="text-brick-red/60 text-[10px] font-black uppercase tracking-[0.2em]">Uji rahasia bangunan anti-gempa.</p>
      </div>

      <div className="w-full space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-brick-red/40 tracking-wider px-2">A. Pilih Jenis Pondasi</label>
          <div className="flex gap-2">
            <button 
              onClick={() => { if(!isShaking) { setPondasi('semen'); setSimulationResult(null); }}}
              className={`flex-1 p-4 rounded-3xl border-4 transition-all ${getOptionStyle('pondasi', 'semen')}`}
            >
              <div className="text-xs font-black uppercase mb-1">Semen Tanam</div>
              <div className="text-[10px] opacity-60 font-bold">Kaku & Statis</div>
            </button>
            <button 
              onClick={() => { if(!isShaking) { setPondasi('umpak'); setSimulationResult(null); }}}
              className={`flex-1 p-4 rounded-3xl border-4 transition-all ${getOptionStyle('pondasi', 'umpak')}`}
            >
              <div className="text-xs font-black uppercase mb-1">Umpak Batu</div>
              <div className="text-[10px] opacity-60 font-bold">Lentur & Bebas</div>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-brick-red/50 tracking-wider px-2">B. Pilih Teknik Sambungan</label>
          <div className="flex gap-2">
            <button 
              onClick={() => { if(!isShaking) { setSambungan('paku'); setSimulationResult(null); }}}
              className={`flex-1 p-4 rounded-3xl border-4 transition-all ${getOptionStyle('sambungan', 'paku')}`}
            >
              <div className="text-xs font-black uppercase mb-1">Paku Besi</div>
              <div className="text-[10px] opacity-60 font-bold">Resiko Rapuh</div>
            </button>
            <button 
              onClick={() => { if(!isShaking) { setSambungan('pasak'); setSimulationResult(null); }}}
              className={`flex-1 p-4 rounded-3xl border-4 transition-all ${getOptionStyle('sambungan', 'pasak')}`}
            >
              <div className="text-xs font-black uppercase mb-1">Pasak Kayu</div>
              <div className="text-[10px] opacity-60 font-bold">Kunci Alami</div>
            </button>
          </div>
        </div>
      </div>

      <div className="relative w-full aspect-[4/3] flex flex-col items-center bg-stone-100 rounded-[40px] overflow-hidden border-2 border-white shadow-2xl group ring-1 ring-stone-200">
        <Suspense fallback={<Loader />}>
          <House3DViewer isShaking={isShaking} simulationResult={simulationResult} />
        </Suspense>
        <div className="w-[85%] h-4 bg-stone-200/50 rounded-full mt-auto mb-6 shadow-inner relative border-2 border-white pointer-events-none">
          <div className="absolute inset-0 bg-stone-400/10" />
        </div>
      </div>

      <button 
        onClick={handleSimulate}
        disabled={isShaking || !pondasi || !sambungan}
        className={`w-full py-5 rounded-[32px] font-black text-xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${
          isShaking || !pondasi || !sambungan
            ? 'bg-stone-200 text-stone-400 cursor-not-allowed opacity-50' 
            : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-orange-500/30'
        }`}
      >
        {isShaking ? <RefreshCcw size={28} className="animate-spin" /> : (
          <>
            <Zap size={24} className="fill-white" />
            GUNCANG SEKARANG!
          </>
        )}
      </button>

      <AnimatePresence>
        {simulationResult && !isShaking && (
          <div className="fixed inset-x-0 top-16 z-[100] flex items-start justify-center p-6 pointer-events-none">
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className={`w-full max-w-sm p-6 bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl text-center border-[4px] pointer-events-auto flex flex-col items-center ${
                simulationResult === 'steady' ? 'border-green-500 shadow-green-500/20' : 'border-red-500 shadow-red-500/20'
              }`}
            >
              <div className="flex items-center gap-4 w-full mb-3">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-inner ${
                  simulationResult === 'steady' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {simulationResult === 'steady' ? <CheckCircle2 size={32} strokeWidth={3} /> : <XCircle size={32} strokeWidth={3} />}
                </div>
                <div className="text-left">
                  <h3 className={`text-2xl font-black italic tracking-tighter uppercase leading-none ${simulationResult === 'steady' ? 'text-green-700' : 'text-red-700'}`}>
                    {simulationResult === 'steady' ? 'AMAN!' : 'HANCUR TOTAL!'}
                  </h3>
                  <p className="text-stone-600 font-bold text-[10px] uppercase tracking-wider mt-1 opacity-60">Resultat Simulasi Berakhir</p>
                </div>
              </div>
              
              <p className="text-stone-600 font-bold text-xs leading-relaxed text-left border-y border-stone-100 py-3 mb-4">
                {simulationResult === 'steady' 
                  ? 'Kombinasi Etnosainsmu terbukti tangguh melindungi dari ancaman gempa.' 
                  : 'Hancur seluruhnya! Sambungan kaku dan pondasi tanam gagal menyerap energi guncangan gempa.'}
              </p>

              <button 
                onClick={() => setSimulationResult(null)}
                className={`w-full py-4 rounded-2xl font-black text-white shadow-lg transition-transform active:scale-95 ${
                  simulationResult === 'steady' ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                {simulationResult === 'steady' ? 'COBA LAGI' : 'PERBAIKI DESAIN'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Mitigation Components ---

interface MitigationItem {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

function DraggableItem({ item, disabled }: { item: MitigationItem, disabled?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id, disabled });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 bg-white rounded-2xl border-2 border-stone-100 shadow-sm flex items-center gap-3 transition-all hover:border-blue-200 active:scale-105 ${disabled ? 'cursor-default opacity-50' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${disabled ? 'bg-stone-100 text-stone-300' : 'bg-blue-50 text-blue-500'}`}>
        <Grab size={14} />
      </div>
      <span className="text-[10px] font-black text-stone-700 leading-tight">{item.text}</span>
    </div>
  );
}

function DropZone({ id, items, title, icon, color, showFeedback }: { 
  id: string, 
  items: MitigationItem[], 
  title: string, 
  icon: any, 
  color: string,
  showFeedback: boolean
}) {
  const { setNodeRef, isOver } = useSortable({ id });

  return (
    <div className="flex-1 flex flex-col gap-3">
      <div className={`p-4 rounded-[28px] border-4 flex items-center justify-center gap-2 shadow-sm ${color} transition-transform duration-300 ${isOver ? 'scale-105' : ''}`}>
        {icon}
        <span className="font-black italic uppercase tracking-tighter text-[10px]">{title}</span>
      </div>
      
      <div 
        ref={setNodeRef}
        className={`flex-1 min-h-[320px] p-2 rounded-[32px] border-4 border-dashed transition-all duration-300 flex flex-col gap-2 ${
          isOver ? 'bg-blue-50 border-blue-400 scale-[1.02] shadow-xl' : 'bg-stone-50/50 border-stone-200'
        } ${items.length === 0 ? 'items-center justify-center' : ''}`}
      >
        {items.length === 0 ? (
          <div className="text-center space-y-1 opacity-20 pointer-events-none">
            <Grab size={24} className="mx-auto mb-2" />
            <p className="text-[8px] font-black uppercase tracking-[0.2em]">Tarik Ke Sini</p>
          </div>
        ) : (
          items.map(item => (
            <motion.div 
              key={item.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`p-3 rounded-2xl border-2 shadow-sm text-center relative overflow-hidden transition-all ${
                showFeedback 
                  ? (id === 'benar' && item.isCorrect) || (id === 'salah' && !item.isCorrect)
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-red-500 bg-red-50 text-red-700'
                  : 'border-white bg-white text-stone-800'
              }`}
            >
              <p className="text-[10px] font-black leading-tight mb-1">{item.text}</p>
              {showFeedback && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-1 pt-1.5 border-t border-current/10 text-left"
                >
                  <p className="text-[8px] font-black uppercase tracking-tighter opacity-70 mb-0.5">Penjelasan:</p>
                  <p className="text-[9px] font-bold leading-tight opacity-90">
                    {item.explanation}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function MitigasiPage() {
  const [initialItems] = useState<MitigationItem[]>([
    { 
      id: '1', 
      text: "Berlindung di bawah meja", 
      isCorrect: true, 
      explanation: "Meja yang kokoh melindungi kepala dan tubuh Anda dari kejatuhan benda-benda berat atau plafon yang runtuh." 
    },
    { 
      id: '2', 
      text: "Lari ke arah lift saat gempa", 
      isCorrect: false, 
      explanation: "Listrik bisa mati kapan saja, menyebabkan lift macet dan Anda bisa terjebak di dalamnya tanpa udara yang cukup." 
    },
    { 
      id: '3', 
      text: "Jauhi jendela kaca", 
      isCorrect: true, 
      explanation: "Guncangan gempa bisa memecahkan kaca jendela, yang serpihannya sangat tajam dan berbahaya bagi tubuh Anda." 
    },
    { 
      id: '4', 
      text: "Tetap di dalam gedung retak", 
      isCorrect: false, 
      explanation: "Gedung yang sudah retak memiliki struktur yang sudah tidak stabil dan sangat berisiko runtuh jika terjadi gempa susulan." 
    },
    { 
      id: '5', 
      text: "Gunakan tangga darurat", 
      isCorrect: true, 
      explanation: "Tangga darurat dirancang khusus untuk evakuasi aman dan tidak bergantung pada sistem kelistrikan gedung." 
    },
    { 
      id: '6', 
      text: "Menyalakan api/korek saat gas bocor", 
      isCorrect: false, 
      explanation: "Gempa sering merusak pipa gas. Api sekecil apa pun bisa memicu ledakan besar jika ada kebocoran gas di sekitar Anda." 
    },
  ]);

  const [pool, setPool] = useState<MitigationItem[]>(initialItems);
  const [benar, setBenar] = useState<MitigationItem[]>([]);
  const [salah, setSalah] = useState<MitigationItem[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isBadgeClaimed, setIsBadgeClaimed] = useState(false);
  const [showSuccessBadge, setShowSuccessBadge] = useState(false);

  const badgeRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const playDropSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/600/600-preview.mp3');
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch (e) { console.warn(e); }
  };

  const playWinSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) { console.warn(e); }
  };

  const playFailSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2658/2658-preview.mp3');
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch (e) { console.warn(e); }
  };

  const downloadBadge = async () => {
    if (badgeRef.current === null) return;
    
    try {
      const dataUrl = await toPng(badgeRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `Lencana-Mitigasi-Nias-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('oops, something went wrong!', err);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveItemId(null);

    if (!over) return;

    const itemId = active.id;
    const overId = over.id;

    // Find the item in pool
    const item = pool.find(i => i.id === itemId);
    if (!item) return;

    // Unified Audio Feedback for action
    playDropSound();

    if (overId === 'benar') {
      setBenar(prev => [...prev, item]);
      setPool(prev => prev.filter(i => i.id !== itemId));
    } else if (overId === 'salah') {
      setSalah(prev => [...prev, item]);
      setPool(prev => prev.filter(i => i.id !== itemId));
    }
  };

  const resetGame = () => {
    setPool(initialItems);
    setBenar([]);
    setSalah([]);
    setShowFeedback(false);
    setIsFinished(false);
    setShowSuccessBadge(false);
  };

  const activeItemData = initialItems.find(i => i.id === activeItemId);

  return (
    <div className="p-6 space-y-6 bg-cream-bg min-h-[700px] flex flex-col items-center pb-40 relative">
      {/* Floating Success Badge & Confetti */}
      <AnimatePresence>
        {showSuccessBadge && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] pointer-events-none overflow-hidden bg-white/40 backdrop-blur-sm"
            >
              {Array.from({ length: 80 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    top: "50%", 
                    left: "50%", 
                    scale: 0,
                    opacity: 1
                  }}
                  animate={{ 
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    scale: Math.random() * 2 + 0.5,
                    rotate: Math.random() * 720,
                    opacity: [1, 1, 0]
                  }}
                  transition={{ 
                    duration: 3.5, 
                    ease: "circOut",
                    delay: Math.random() * 0.3
                  }}
                  className="absolute w-4 h-4 rounded-full shadow-lg"
                  style={{ 
                    backgroundColor: ['#D4AF37', '#8B0000', '#F5F5DC', '#22C55E', '#3B82F6'][Math.floor(Math.random() * 5)] 
                  }}
                />
              ))}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.3, y: 100, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, scale: 1.2, y: -100 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] pointer-events-none"
            >
              <div className="bg-white p-2 rounded-[48px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)]">
                <div className="bg-nias-gold text-stone-900 px-10 py-10 rounded-[40px] flex flex-col items-center gap-4 border-4 border-white">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="bg-white p-6 rounded-full shadow-2xl"
                  >
                    <Award size={80} className="text-stone-900 stroke-[2px]" aria-hidden="true" />
                  </motion.div>
                  <div className="text-center space-y-1">
                    <motion.span 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="font-black text-4xl uppercase tracking-tighter italic block leading-none"
                    >
                      Hebat!
                    </motion.span>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="font-bold text-sm uppercase tracking-[0.2em] opacity-80"
                    >
                      Misi Mitigasi Selesai
                    </motion.p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <div className="text-center space-y-2 w-full">
        <div className="flex justify-center gap-2 mb-2">
          <span className="px-3 py-1 bg-brick-red text-white text-[10px] font-black rounded-full uppercase tracking-tighter shadow-sm">Fase Mitigasi</span>
        </div>
        <h2 className="text-3xl font-black text-stone-900 tracking-tighter uppercase leading-none italic drop-shadow-sm">Siaga Gempa</h2>
        <p className="text-brick-red/60 text-[10px] font-black uppercase tracking-widest leading-relaxed px-4">Tarik aksi ke kolom yang tepat!</p>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={({active}) => setActiveItemId(active.id as string)}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 w-full">
          <DropZone 
            id="benar" 
            title="Benar (✓)" 
            items={benar} 
            icon={<CheckCircle2 size={18} strokeWidth={3} />} 
            color="border-green-500 bg-green-500 text-white" 
            showFeedback={showFeedback}
          />
          <DropZone 
            id="salah" 
            title="Salah (×)" 
            items={salah} 
            icon={<XCircle size={18} strokeWidth={3} />} 
            color="border-red-500 bg-red-500 text-white" 
            showFeedback={showFeedback}
          />
        </div>

        <div className="w-full space-y-4 pt-4 border-t-2 border-stone-200/50 mt-2">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
              <MousePointer2 size={12} /> Daftar Aksi
            </h3>
            {pool.length > 0 && (
              <span className="text-[10px] font-black text-brick-red bg-brick-red/5 px-2 py-0.5 rounded-full animate-pulse">{pool.length} Tersisa</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <SortableContext items={pool.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {pool.map((item) => (
                <DraggableItem key={item.id} item={item} disabled={showFeedback} />
              ))}
            </SortableContext>
          </div>
          
          {pool.length === 0 && !showFeedback && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-6 bg-brick-red/5 rounded-[32px] border-2 border-brick-red/20 border-dashed text-center shadow-inner"
            >
              <p className="text-xs font-black text-brick-red uppercase italic">Semua aksi sudah dipilah!</p>
              <p className="text-[10px] font-bold text-brick-red/50 mt-1 uppercase tracking-widest">Silahkan cek jawabanmu.</p>
            </motion.div>
          )}
        </div>

        <DragOverlay zIndex={1000}>
          {activeItemData ? (
            <div className="p-3 bg-white rounded-2xl border-4 border-brick-red shadow-2xl flex items-center gap-3 cursor-grabbing scale-110 rotate-3 ring-4 ring-brick-red/20">
              <div className="w-8 h-8 rounded-lg bg-brick-red text-white flex items-center justify-center shrink-0">
                <Grab size={14} />
              </div>
              <span className="text-[10px] font-black text-stone-900 leading-tight">{activeItemData.text}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="flex gap-3 w-full pt-4">
        <button 
          onClick={resetGame}
          className="flex-1 py-4 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-[24px] font-black text-xs transition-all flex items-center justify-center gap-2 active:scale-95 border-b-4 border-stone-200"
        >
          <RefreshCcw size={16} /> ULANGI
        </button>
        <button 
          onClick={() => {
            setShowFeedback(true);
            const isAllCorrect = benar.every(i => i.isCorrect) && salah.every(i => !i.isCorrect) && benar.length + salah.length === initialItems.length;
            if (isAllCorrect) {
              setIsFinished(true);
              setShowSuccessBadge(true);
              playWinSound();
              setTimeout(() => setShowSuccessBadge(false), 4000);
            } else {
              playFailSound();
            }
          }}
          disabled={pool.length > 0 || showFeedback}
          className={`flex-[2] py-4 rounded-[24px] font-black text-xs shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 ${
            pool.length > 0 || showFeedback
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed opacity-50' 
              : 'bg-brick-red text-white hover:bg-red-700 shadow-red-200 border-b-4 border-red-900'
          }`}
        >
          {showFeedback ? <LightbulbIcon size={16} /> : <Zap size={16} />} 
          {showFeedback ? 'HASIL SIMULASI' : 'CEK JAWABAN'}
        </button>
      </div>

      <AnimatePresence>
        {isFinished && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="w-full flex flex-col items-center gap-6 mt-4"
          >
            {/* The Badge to Capture */}
            <div 
              ref={badgeRef}
              className="w-full bg-white rounded-[40px] p-10 border-[10px] border-nias-gold shadow-2xl space-y-6 relative overflow-hidden"
            >
              {/* Nias Decoration Pattern inside badge */}
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                   style={{ 
                     backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30-30-30z' fill='%23000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                     backgroundSize: '20px 20px'
                   }} 
              />

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-28 h-28 bg-gradient-to-br from-nias-gold to-yellow-600 rounded-full flex items-center justify-center mb-6 shadow-2xl relative">
                  <div className="absolute inset-2 border-2 border-white/40 rounded-full" />
                  <ShieldAlert size={56} className="text-stone-900 drop-shadow-lg" />
                </div>
                
                <div className="space-y-1 text-center">
                  <p className="text-stone-400 font-black text-[10px] uppercase tracking-[0.4em] mb-2">SERTIFIKAT DIGITAL</p>
                  <h3 className="text-4xl font-black text-stone-900 uppercase italic tracking-tighter leading-none">Ahli Mitigasi!</h3>
                  <div className="h-1 w-16 bg-brick-red mx-auto my-4 rounded-full" />
                  <p className="text-stone-600 font-bold text-sm leading-relaxed px-4">Telah berhasil menyelesaikan simulasi aksi penyelamatan dini gempa bumi di Nias.</p>
                </div>

                <div className="mt-8 pt-6 border-t border-stone-100 w-full flex justify-between items-center opacity-60">
                   <div className="flex flex-col items-start">
                     <p className="text-[8px] font-black uppercase text-stone-400">Penerbit</p>
                     <p className="text-[10px] font-bold text-stone-800 tracking-tighter">MODUL IPA UNIMED</p>
                   </div>
                   <div className="w-10 h-10">
                     <img src="/Lambang_Universitas_Negeri_Medan.png" className="w-full h-full object-contain grayscale" alt="Logo" />
                   </div>
                </div>
              </div>

              {/* Holographic shine effect */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 via-transparent to-black/[0.02] pointer-events-none" />
            </div>

            <div className="flex flex-col w-full gap-3">
              <button 
                onClick={() => {
                  downloadBadge();
                  setIsBadgeClaimed(true);
                }}
                className={`w-full py-5 rounded-[28px] font-black text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 ${
                  isBadgeClaimed 
                    ? 'bg-nias-gold text-stone-900 border-yellow-700' 
                    : 'bg-stone-900 text-white border-stone-700'
                }`}
              >
                {isBadgeClaimed ? (
                  <>
                    <CheckCircle2 size={18} />
                    SIMPAN KE GALERI BERHASIL!
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    SIMPAN LENCANA KE GALERI
                  </>
                )}
              </button>
              
              <button 
                onClick={resetGame}
                className="w-full py-4 text-stone-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-brick-red transition-colors"
              >
                Mulai Ulang Simulasi
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}
