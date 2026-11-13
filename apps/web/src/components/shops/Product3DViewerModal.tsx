'use client';

import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { X, RotateCcw, Box, Check, ShieldCheck, Zap, ShoppingCart } from 'lucide-react';

interface Product3DViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    sku: string;
    priceInr: number;
    categoryName: string;
    specs?: Record<string, any>;
    description: string;
    ageRestricted?: boolean;
    componentId?: string;
  };
  onAddToCart: () => void;
}

function Product3DModel({ productId, category, isWireframe }: { productId: string; category: string; isWireframe: boolean }) {
  const meshGroupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (meshGroupRef.current) {
      meshGroupRef.current.rotation.y += delta * 0.4;
    }
  });

  // Render category-specific realistic 3D representations
  if (productId.includes('uno') || category.includes('Microcontrollers')) {
    return (
      <group ref={meshGroupRef}>
        {/* PCB Board (Blue/Green Solder-mask) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[6.8, 0.2, 5.3]} />
          <meshStandardMaterial
            color="#005C8A"
            roughness={0.3}
            metalness={0.1}
            wireframe={isWireframe}
          />
        </mesh>
        {/* ATmega328P DIP IC */}
        <mesh position={[0.5, 0.25, 0.8]}>
          <boxGeometry args={[3.2, 0.35, 0.9]} />
          <meshStandardMaterial color="#111111" roughness={0.7} metalness={0.1} wireframe={isWireframe} />
        </mesh>
        {/* USB Type-B Port */}
        <mesh position={[-3.0, 0.45, -1.5]}>
          <boxGeometry args={[1.6, 1.1, 1.2]} />
          <meshStandardMaterial color="#D1D5DB" roughness={0.2} metalness={0.9} wireframe={isWireframe} />
        </mesh>
        {/* DC Barrel Jack */}
        <mesh position={[-2.8, 0.45, 1.6]}>
          <boxGeometry args={[1.5, 1.0, 1.0]} />
          <meshStandardMaterial color="#1F2937" roughness={0.6} wireframe={isWireframe} />
        </mesh>
        {/* 16MHz Crystal Oscillator */}
        <mesh position={[-1.2, 0.2, -0.6]}>
          <boxGeometry args={[0.5, 0.2, 1.0]} />
          <meshStandardMaterial color="#9CA3AF" roughness={0.1} metalness={0.9} wireframe={isWireframe} />
        </mesh>
        {/* Female Header Strips (Digital & Analog) */}
        <mesh position={[0, 0.3, -2.4]}>
          <boxGeometry args={[5.2, 0.4, 0.3]} />
          <meshStandardMaterial color="#18181B" roughness={0.5} wireframe={isWireframe} />
        </mesh>
        <mesh position={[0.6, 0.3, 2.4]}>
          <boxGeometry args={[4.2, 0.4, 0.3]} />
          <meshStandardMaterial color="#18181B" roughness={0.5} wireframe={isWireframe} />
        </mesh>
        {/* Onboard LEDs (Green + Orange) */}
        <mesh position={[-0.8, 0.15, -1.2]}>
          <boxGeometry args={[0.2, 0.1, 0.2]} />
          <meshStandardMaterial color="#39FF6A" emissive="#39FF6A" emissiveIntensity={0.8} />
        </mesh>
      </group>
    );
  }

  if (productId.includes('servo') || category.includes('Motors')) {
    return (
      <group ref={meshGroupRef}>
        {/* SG90 Translucent Blue Casing */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.3, 2.2, 1.2]} />
          <meshPhysicalMaterial
            color="#0066CC"
            transmission={0.4}
            opacity={0.85}
            roughness={0.2}
            transparent
            wireframe={isWireframe}
          />
        </mesh>
        {/* Top Output Gear Tower */}
        <mesh position={[0.6, 1.3, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.4, 16]} />
          <meshStandardMaterial color="#E0E7FF" roughness={0.3} metalness={0.5} wireframe={isWireframe} />
        </mesh>
        {/* White Horn Cross */}
        <mesh position={[0.6, 1.55, 0]}>
          <boxGeometry args={[1.8, 0.1, 0.4]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.4} wireframe={isWireframe} />
        </mesh>
        {/* Mounting Tabs */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[3.2, 0.2, 1.2]} />
          <meshPhysicalMaterial color="#0066CC" opacity={0.85} transparent wireframe={isWireframe} />
        </mesh>
      </group>
    );
  }

  if (productId.includes('hc_sr04') || productId.includes('ultrasonic') || category.includes('Sensors')) {
    return (
      <group ref={meshGroupRef}>
        {/* Blue PCB */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4.5, 2.0, 0.2]} />
          <meshStandardMaterial color="#0055AA" roughness={0.3} wireframe={isWireframe} />
        </mesh>
        {/* Left Ultrasonic Transducer Cylinder */}
        <mesh position={[-1.2, 0, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.75, 0.75, 1.4, 32]} />
          <meshStandardMaterial color="#CCCCCC" metalness={0.8} roughness={0.2} wireframe={isWireframe} />
        </mesh>
        {/* Right Ultrasonic Transducer Cylinder */}
        <mesh position={[1.2, 0, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.75, 0.75, 1.4, 32]} />
          <meshStandardMaterial color="#CCCCCC" metalness={0.8} roughness={0.2} wireframe={isWireframe} />
        </mesh>
        {/* 4 Header Pins */}
        <mesh position={[0, -0.9, -0.3]}>
          <boxGeometry args={[1.2, 0.2, 0.4]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    );
  }

  if (productId.includes('drone') || productId.includes('quadcopter') || category.includes('Drones')) {
    return (
      <group ref={meshGroupRef}>
        {/* Center Frame Plate */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.5, 0.2, 2.5]} />
          <meshStandardMaterial color="#18181B" roughness={0.4} metalness={0.3} wireframe={isWireframe} />
        </mesh>
        {/* Red & White Arms */}
        {[-1, 1].map((x) =>
          [-1, 1].map((z) => (
            <group key={`${x}-${z}`} position={[x * 1.8, 0, z * 1.8]}>
              <mesh position={[-x * 0.9, 0, -z * 0.9]} rotation={[0, (x * z * Math.PI) / 4, 0]}>
                <boxGeometry args={[2.0, 0.3, 0.3]} />
                <meshStandardMaterial
                  color={z > 0 ? '#EF4444' : '#F4F4F5'}
                  roughness={0.5}
                  wireframe={isWireframe}
                />
              </mesh>
              {/* Brushless Motor */}
              <mesh position={[0, 0.4, 0]}>
                <cylinderGeometry args={[0.45, 0.45, 0.5, 16]} />
                <meshStandardMaterial color="#27272A" metalness={0.8} roughness={0.2} />
              </mesh>
              {/* Propeller Blade */}
              <mesh position={[0, 0.7, 0]} rotation={[0, Math.random() * Math.PI, 0]}>
                <boxGeometry args={[2.2, 0.05, 0.25]} />
                <meshStandardMaterial color="#39FF6A" roughness={0.3} />
              </mesh>
            </group>
          ))
        )}
      </group>
    );
  }

  // Default Electronic Module Box
  return (
    <group ref={meshGroupRef}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.0, 1.2, 2.2]} />
        <meshStandardMaterial
          color="#064E3B"
          roughness={0.4}
          metalness={0.2}
          wireframe={isWireframe}
        />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[2.4, 0.1, 1.6]} />
        <meshStandardMaterial color="#39FF6A" roughness={0.5} wireframe={isWireframe} />
      </mesh>
    </group>
  );
}

export const Product3DViewerModal: React.FC<Product3DViewerModalProps> = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
}) => {
  const [isWireframe, setIsWireframe] = useState(false);
  const [added, setAdded] = useState(false);

  if (!isOpen) return null;

  const handleAdd = () => {
    onAddToCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#07110D] border border-[#39FF6A]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        {/* 3D Canvas Viewport */}
        <div className="relative w-full md:w-3/5 h-80 md:h-[520px] bg-gradient-to-b from-[#0A1813] to-[#040907] flex items-center justify-center">
          <Canvas
            camera={{ position: [5, 4, 6], fov: 45 }}
            style={{ width: '100%', height: '100%' }}
          >
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} />
            <directionalLight position={[-10, 5, -10]} intensity={0.5} color="#7FE7D6" />
            <pointLight position={[0, 5, 0]} intensity={0.8} color="#39FF6A" />

            <Suspense fallback={null}>
              <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
                <Product3DModel
                  productId={product.id}
                  category={product.categoryName}
                  isWireframe={isWireframe}
                />
              </Float>
              <Grid
                position={[0, -2, 0]}
                args={[15, 15]}
                cellSize={0.8}
                cellThickness={1}
                cellColor="#103E2B"
                sectionSize={2.4}
                sectionThickness={1.5}
                sectionColor="#39FF6A"
                fadeDistance={12}
                fadeStrength={1}
              />
            </Suspense>

            <OrbitControls enableZoom={true} enablePan={false} minDistance={3} maxDistance={12} />
          </Canvas>

          {/* Controls Overlay */}
          <div className="absolute top-4 left-4 flex gap-2">
            <button
              onClick={() => setIsWireframe(!isWireframe)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition ${
                isWireframe
                  ? 'bg-[#39FF6A] text-black border-[#39FF6A]'
                  : 'bg-black/60 text-gray-300 border-gray-700 hover:border-[#39FF6A]'
              }`}
            >
              <Box className="w-3.5 h-3.5 inline mr-1" />
              {isWireframe ? 'PBR Shaded' : 'Wireframe'}
            </button>
          </div>

          <div className="absolute bottom-4 left-4 text-[11px] font-mono text-gray-400 bg-black/60 px-2.5 py-1 rounded border border-gray-800">
            Click & drag to rotate • Scroll to zoom
          </div>
        </div>

        {/* Product Details & Specs Sidebar */}
        <div className="w-full md:w-2/5 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-800 bg-[#07110D]/95">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#7FE7D6] bg-[#7FE7D6]/10 px-2 py-0.5 rounded border border-[#7FE7D6]/20">
                  {product.categoryName}
                </span>
                <span className="ml-2 text-[10px] font-mono text-gray-400">
                  {product.sku}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-xl font-bold text-white mt-3 font-sans leading-tight">
              {product.title}
            </h3>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-[#39FF6A]">
                ₹{product.priceInr}
              </span>
              <span className="text-xs text-gray-400">GST 18% Inclusive</span>
            </div>

            {product.ageRestricted && (
              <div className="mt-3 p-2.5 bg-[#FF9A1F]/10 border border-[#FF9A1F]/30 rounded-xl flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FF9A1F] flex-shrink-0" />
                <span className="text-xs text-[#FF9A1F] font-medium">
                  18+ Adult Consent Required for Minors
                </span>
              </div>
            )}

            <p className="mt-4 text-xs text-gray-300 leading-relaxed">
              {product.description}
            </p>

            {/* Technical Specs List */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="mt-5">
                <h4 className="text-xs font-mono uppercase text-gray-400 tracking-wider mb-2">
                  Technical Specifications
                </h4>
                <div className="space-y-1.5 bg-black/40 p-3 rounded-xl border border-gray-800/80">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-xs font-mono">
                      <span className="text-gray-400 capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="text-gray-200 font-semibold">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="mt-6 pt-4 border-t border-gray-800 flex gap-3">
            <button
              onClick={handleAdd}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
                added
                  ? 'bg-emerald-500 text-black'
                  : 'bg-[#39FF6A] hover:bg-[#32e55e] text-black shadow-lg shadow-[#39FF6A]/20'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart • ₹{product.priceInr}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
