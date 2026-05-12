/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';
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
  BookOpen
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
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.04]">
        {/* Animated Spirals (Ni'o Goli) */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              opacity: 0 
            }}
            animate={{ 
              y: ["0%", "100%"],
              opacity: [0, 1, 0],
              rotate: [0, 360]
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: i * 2,
              ease: "linear"
            }}
            className="absolute"
          >
            <svg width="120" height="120" viewBox="0 0 100 100" className="text-stone-900 fill-none stroke-current stroke-3">
              <path d="M50 50 C 50 20, 80 20, 80 50 C 80 80, 20 80, 20 50 C 20 20, 60 20, 60 50 C 60 70, 40 70, 40 50" />
            </svg>
          </motion.div>
        ))}
        
        {/* Floating Geometric Shapes */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`geo-${i}`}
            animate={{ 
              x: ["-10%", "110%"],
              rotate: [0, 45, 0]
            }}
            transition={{
              duration: 20 + Math.random() * 15,
              repeat: Infinity,
              delay: i * 3,
              ease: "easeInOut"
            }}
            className="absolute top-1/4 opacity-30"
            style={{ top: (i * 12) + "%" }}
          >
            <div className="w-8 h-8 border-2 border-stone-800 rotate-45" />
          </motion.div>
        ))}
      </div>
      
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.15] mix-blend-multiply" 
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

function ProceduralNiasHouse({ isShaking, simulationResult }: { isShaking?: boolean, simulationResult?: 'steady' | 'collapsed' | null }) {
  const groupRef = useRef<THREE.Group>(null);
  const houseRef = useRef<THREE.Group>(null);

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
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -Math.PI * 0.1, 0.05);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -1.5, 0.05);
    } else {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.1);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 0.1);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Foundation Stones (Batu Umpak) */}
      <group position={[0, -2, 0]}>
        {[-2, 0, 2].map((x) => 
          [-1.5, 1.5].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, 0.1, z]} material={stoneMaterial} receiveShadow castShadow>
              <boxGeometry args={[0.8, 0.2, 0.8]} />
            </mesh>
          ))
        )}
      </group>

      {/* Main Structure Group */}
      <group ref={houseRef} position={[0, -2, 0]}>
        {/* Main Pillars */}
        {[-1.8, 1.8].map((x) => 
          [-1.2, 1.2].map((z) => (
            <mesh key={`p-${x}-${z}`} position={[x, 1.2, z]} material={woodMaterial} castShadow>
              <cylinderGeometry args={[0.1, 0.12, 2.4]} />
            </mesh>
          ))
        )}

        {/* Diwa (X-Pillars for stability) */}
        <group position={[0, 1.2, 0]}>
          <mesh rotation={[0, 0, Math.PI * 0.2]} material={woodMaterial} castShadow>
            <boxGeometry args={[0.08, 3.2, 0.08]} />
          </mesh>
          <mesh rotation={[0, 0, -Math.PI * 0.2]} material={woodMaterial} castShadow>
            <boxGeometry args={[0.08, 3.2, 0.08]} />
          </mesh>
        </group>

        {/* House Body */}
        <mesh position={[0, 2.8, 0]} material={darkWoodMaterial} castShadow receiveShadow>
          <boxGeometry args={[4.5, 1.2, 3]} />
        </mesh>

        {/* Massive Roof (Characteristic of Omo Hada) */}
        <mesh position={[0, 4.8, 0]} material={roofMaterial} castShadow rotation={[0, Math.PI * 0.25, 0]}>
          <coneGeometry args={[4.2, 3.8, 4]} />
        </mesh>
        
        {/* Roof Extensions (Ornaments / Ni'o Goli style) */}
        <mesh position={[0, 4.2, 1.6]} rotation={[Math.PI * 0.15, 0, 0]} material={darkWoodMaterial} castShadow>
           <boxGeometry args={[5, 0.15, 1.2]} />
        </mesh>
        <mesh position={[0, 4.2, -1.6]} rotation={[-Math.PI * 0.15, 0, 0]} material={darkWoodMaterial} castShadow>
           <boxGeometry args={[5, 0.15, 1.2]} />
        </mesh>

        {/* Decorative Front Door Area */}
        <mesh position={[0, 2.8, 1.51]} material={woodMaterial}>
          <boxGeometry args={[0.6, 0.8, 0.1]} />
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

function House3DViewer({ isShaking, simulationResult }: { isShaking?: boolean, simulationResult?: 'steady' | 'collapsed' | null }) {
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
        <PerspectiveCamera makeDefault position={[10, 6, 12]} fov={35} />
        <OrbitControls 
          enablePan={false} 
          minDistance={8} 
          maxDistance={25} 
          autoRotate={!isShaking && !simulationResult}
          autoRotateSpeed={0.5}
        />
        
        {/* Environment & Lighting */}
        <ambientLight intensity={1.5} />
        <directionalLight 
          position={[10, 20, 10]} 
          intensity={2.5} 
          castShadow 
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-10, 5, -10]} intensity={1} color="#ffe0b2" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Environment preset="park" />
        
        <Suspense fallback={null}>
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <ProceduralNiasHouse isShaking={isShaking} simulationResult={simulationResult} />
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

export default function App() {
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
    <div className="flex flex-col h-screen max-w-md mx-auto bg-cream-bg overflow-hidden border-x border-stone-200">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 relative z-10">
        <NiasAtmosphere />
        <AnimatePresence mode="wait">
          {currentPage === 'dashboard' && <DashboardPage key="dashboard" onSelect={(p) => setCurrentPage(p)} />}
          {currentPage === 'mindful' && <MindfulPage key="mindful" onNext={() => setCurrentPage('meaningful')} />}
          {currentPage === 'meaningful' && <MeaningfulPage key="meaningful" />}
          {currentPage === 'joyful' && <JoyfulPage key="joyful" isShaking={isShaking} setIsShaking={setIsShaking} />}
          {currentPage === 'mitigasi' && <MitigasiPage key="mitigasi" />}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
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
    iconColor?: string;
  }

  const modules: ModuleItem[] = [
    { id: 'mindful', title: 'Mindful', subtitle: 'Sejarah & Tragedi', icon: Heart, color: 'bg-brick-red', des: 'Pahami luka masa lalu & kearifan lokal.' },
    { id: 'meaningful', title: 'Meaningful', subtitle: 'Anatomi Omo Hada', icon: Lightbulb, color: 'bg-nias-gold', des: 'Rahasia struktur tahan gempa Omo Hada.' },
    { id: 'joyful', title: 'Joyful', subtitle: 'Simulasi Gempa', icon: Gamepad2, color: 'bg-wood-dark', des: 'Uji ketahanan desainmu secara interaktif.' },
    { id: 'mitigasi', title: 'Mitigasi', subtitle: 'Aksi Penyelamatan', icon: ShieldAlert, color: 'bg-stone-600', des: 'Pelajari langkah siaga saat darurat.' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 space-y-8"
    >
      <header className="space-y-2 mt-4">
        <h1 className="text-4xl font-black text-wood-dark tracking-tighter leading-none">
          Ya'ahowu, <br/>
          <span className="text-brick-red">Nono Niha!</span>
        </h1>
        <p className="text-stone-600 text-sm font-bold leading-tight">
          Mari belajar ketangguhan dari leluhur Nias melalui 4 fase penting.
        </p>
      </header>

      <div className="grid gap-4">
        {modules.map((m, idx) => {
          const Icon = m.icon;
          return (
            <motion.button
              key={m.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => onSelect(m.id as Page)}
              className="group flex flex-col items-start p-6 bg-white rounded-[32px] shadow-sm hover:shadow-xl transition-all border border-stone-100 text-left relative overflow-hidden"
            >
              <div className={`${m.color} p-3 rounded-2xl ${m.id === 'meaningful' ? 'text-stone-900' : 'text-white'} mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-widest text-stone-400">{m.subtitle}</span>
                <h3 className="text-xl font-black text-stone-800">{m.title}</h3>
                <p className="text-xs text-stone-500 font-bold leading-relaxed">{m.des}</p>
              </div>
              <div className="absolute top-6 right-6 text-stone-200 group-hover:text-brick-red/20 transition-colors">
                <ChevronRight size={32} />
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="bg-brick-red/5 p-6 rounded-[32px] border-2 border-brick-red/10 border-dashed text-center">
        <p className="text-xs font-bold text-brick-red/60 uppercase tracking-tighter">
          "Kearifan lokal adalah tameng kita di masa depan."
        </p>
      </div>
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

  useEffect(() => {
    if (activeModal) {
      localStorage.setItem('nias_meaningful_modal', activeModal);
    }
  }, [activeModal]);

  const playKnock = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch (e) {
      console.warn("Audio play failed", e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-cream-bg min-h-[600px] font-sans">
      <header className="p-6 text-center relative border-b border-stone-200/50">
        <h2 className="text-xl font-black text-stone-900 tracking-tighter uppercase italic">
          Anatomi Omo Hada<br/>
          <span className="text-xs font-bold block text-brick-red tracking-widest">(Rahasia Struktur)</span>
        </h2>
        <div className="absolute top-6 right-6">
          <button onClick={playKnock} className="bg-white p-3 rounded-full shadow-lg text-brick-red active:scale-95 transition-transform border border-stone-100">
            <Volume2 size={24} />
          </button>
        </div>
      </header>

      <div className="flex-1 relative flex flex-col items-center pb-8 px-6 pt-6 overflow-y-auto">
        <div className="w-full max-w-md flex flex-col gap-6">
          {/* Main 3D Viewer Area */}
          <div className="relative w-full aspect-[4/3] bg-stone-900 rounded-[40px] overflow-hidden border-2 border-white shadow-2xl group ring-1 ring-stone-200">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center text-white font-black text-xs uppercase tracking-widest animate-pulse">
                Memuat Model 3D...
              </div>
            }>
              <House3DViewer />
            </Suspense>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full border border-stone-200 text-[10px] font-black text-stone-500 uppercase tracking-widest pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              Slide putar • Zoom detail
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
                <div className="flex p-2 bg-stone-100 m-4 rounded-[32px]">
                  <button 
                    onClick={() => setActiveTab('etno')}
                    className={`flex-1 py-3.5 rounded-[28px] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'etno' ? 'bg-white text-brick-red shadow-md' : 'text-stone-400'
                    }`}
                  >
                    <BookOpen size={16} />
                    Etnosains
                  </button>
                  <button 
                    onClick={() => setActiveTab('science')}
                    className={`flex-1 py-3.5 rounded-[28px] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'science' ? 'bg-stone-900 text-nias-gold shadow-md' : 'text-stone-400'
                    }`}
                  >
                    <Zap size={16} />
                    Sains Modern
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
                          <h3 className="text-2xl font-black text-stone-900 tracking-tighter uppercase italic">{anatomyDetails[activeModal].title}</h3>
                        </div>
                        <div className="space-y-1">
                          <p className="text-brick-red font-black text-[10px] uppercase tracking-[0.2em] opacity-40">Filosofi Tradisional</p>
                          <p className="text-stone-800 text-lg leading-snug font-bold">
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
                            <h3 className="text-xl font-black text-stone-900 tracking-tight uppercase">Technical Deep Dive</h3>
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

      <div className="relative w-full flex flex-col items-center">
        <HouseSVGViewer isShaking={isShaking} simulationResult={simulationResult} />
        <div className="w-[85%] h-6 bg-stone-200 rounded-full mt-4 shadow-inner overflow-hidden relative border-4 border-white">
          <div className="absolute inset-0 bg-stone-400/20" />
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
                    {simulationResult === 'steady' ? 'AMAN!' : 'RUNTUH!'}
                  </h3>
                  <p className="text-stone-600 font-bold text-[10px] uppercase tracking-wider mt-1 opacity-60">Resultat Simulasi Berakhir</p>
                </div>
              </div>
              
              <p className="text-stone-600 font-bold text-xs leading-relaxed text-left border-y border-stone-100 py-3 mb-4">
                {simulationResult === 'steady' 
                  ? 'Kombinasi Etnosainsmu terbukti tangguh melindungi dari ancaman gempa.' 
                  : 'Struktur runtuh. Kaku & rapuh menjadi penyebab utama kegagalan.'}
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
  detail: string;
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
              <p className="text-[10px] font-black leading-tight">{item.text}</p>
              {showFeedback && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-1 pt-1 border-t border-current/10 text-[8px] font-bold opacity-80"
                >
                  {item.detail}
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
    { id: '1', text: "Berlindung di bawah meja", isCorrect: true, detail: "Melindungi kepala dari reruntuhan." },
    { id: '2', text: "Lari ke arah lift & tangga", isCorrect: false, detail: "Bahaya terjebak jika listrik mati." },
    { id: '3', text: "Jauhi kaca & lemari besar", isCorrect: true, detail: "Menghindari pecahan kaca tajam." },
    { id: '4', text: "Tetap di gedung beton retak", isCorrect: false, detail: "Resiko runtuh saat gempa susulan." },
    { id: '5', text: "Gunakan tangga darurat", isCorrect: true, detail: "Akses aman saat evakuasi." },
    { id: '6', text: "Gunakan lift saat gempa", isCorrect: false, detail: "Rawan terjebak macet/rusak." },
  ]);

  const [pool, setPool] = useState<MitigationItem[]>(initialItems);
  const [benar, setBenar] = useState<MitigationItem[]>([]);
  const [salah, setSalah] = useState<MitigationItem[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isBadgeClaimed, setIsBadgeClaimed] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveItemId(null);

    if (!over) return;

    const itemId = active.id;
    const overId = over.id;

    // Find the item in pool
    const item = pool.find(i => i.id === itemId);
    if (!item) return;

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
  };

  const activeItemData = initialItems.find(i => i.id === activeItemId);

  return (
    <div className="p-6 space-y-6 bg-cream-bg min-h-[700px] flex flex-col items-center pb-40">
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
            if (isAllCorrect) setIsFinished(true);
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
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full p-8 bg-nias-gold rounded-[40px] border-4 border-white text-center space-y-4 shadow-2xl shadow-nias-gold/30 mt-4"
          >
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert size={40} className="text-stone-900" />
            </div>
            <h3 className="text-2xl font-black text-stone-900 uppercase italic tracking-tighter">Ahli Mitigasi!</h3>
            <p className="text-stone-900 font-bold text-xs leading-relaxed uppercase tracking-widest opacity-90">Kamu layak mendapatkan lencana kesiapsiagaan.</p>
            <button 
              onClick={() => setIsBadgeClaimed(true)}
              disabled={isBadgeClaimed}
              className={`w-full py-4 rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-transform border-b-4 ${
                isBadgeClaimed ? 'bg-green-600 text-white border-green-900' : 'bg-brick-red text-white border-red-900'
              }`}
            >
              {isBadgeClaimed ? 'LENCANA BERHASIL DIKLAIM! 🏅' : 'KLAIM LENCANA SAYA'}
            </button>
            {isBadgeClaimed && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-stone-900 font-bold text-[10px] uppercase tracking-widest bg-white/40 p-2 rounded-xl"
              >
                Lencana disimpan di profil Anda.
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}
