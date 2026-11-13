import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, Text, ActivityIndicator } from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import { COLORS } from '../../theme/colors';

interface MobileCircuitCanvasProps {
  height?: number;
  isSimulating?: boolean;
}

export function MobileCircuitCanvas({ height = 260, isSimulating = false }: MobileCircuitCanvasProps) {
  const [loading, setLoading] = useState(true);
  const animFrameRef = useRef<number | null>(null);

  // Interaction refs
  const rotYRef = useRef(0.4);
  const rotXRef = useRef(0.5);
  const isDraggingRef = useRef(false);
  const lastTouchRef = useRef({ x: 0, y: 0 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        isDraggingRef.current = true;
        lastTouchRef.current = {
          x: evt.nativeEvent.pageX,
          y: evt.nativeEvent.pageY,
        };
      },
      onPanResponderMove: (evt) => {
        if (!isDraggingRef.current) return;
        const dx = evt.nativeEvent.pageX - lastTouchRef.current.x;
        const dy = evt.nativeEvent.pageY - lastTouchRef.current.y;
        lastTouchRef.current = {
          x: evt.nativeEvent.pageX,
          y: evt.nativeEvent.pageY,
        };

        rotYRef.current += dx * 0.01;
        rotXRef.current = Math.max(0.1, Math.min(1.2, rotXRef.current + dy * 0.01));
      },
      onPanResponderRelease: () => {
        isDraggingRef.current = false;
      },
    })
  ).current;

  const onContextCreate = async (gl: any) => {
    try {
      const width = gl.drawingBufferWidth;
      const height = gl.drawingBufferHeight;

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0xf5f6f8, 0.04);

      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
      camera.position.set(0, 3.2, 5.0);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({
        canvas: {
          width,
          height,
          style: {},
          addEventListener: () => {},
          removeEventListener: () => {},
          clientHeight: height,
          clientWidth: width,
        } as any,
        context: gl,
        antialias: true,
      });
      renderer.setSize(width, height);
      renderer.setClearColor(0xf5f6f8, 1);

      // Floor grid
      const grid = new THREE.GridHelper(10, 20, 0xff8a1f, 0xe8ecf2);
      grid.position.y = -0.5;
      scene.add(grid);

      // 3D Breadboard & Circuit Group
      const circuitGroup = new THREE.Group();
      scene.add(circuitGroup);

      // 1. White Half-Size Breadboard
      const bbGeo = new THREE.BoxGeometry(3.2, 0.25, 2.0);
      const bbMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.8,
        metalness: 0.1,
      });
      const breadboard = new THREE.Mesh(bbGeo, bbMat);
      breadboard.position.set(0.6, -0.2, 0);
      circuitGroup.add(breadboard);

      // Power rails (red & blue stripes)
      const redRailGeo = new THREE.BoxGeometry(3.1, 0.02, 0.06);
      const redRailMat = new THREE.MeshBasicMaterial({ color: 0xff4d4d });
      const redRail = new THREE.Mesh(redRailGeo, redRailMat);
      redRail.position.set(0.6, -0.07, 0.85);
      circuitGroup.add(redRail);

      const blueRailGeo = new THREE.BoxGeometry(3.1, 0.02, 0.06);
      const blueRailMat = new THREE.MeshBasicMaterial({ color: 0x4c8dff });
      const blueRail = new THREE.Mesh(blueRailGeo, blueRailMat);
      blueRail.position.set(0.6, -0.07, -0.85);
      circuitGroup.add(blueRail);

      // 2. Arduino Uno R3 Blue PCB
      const unoGeo = new THREE.BoxGeometry(2.4, 0.1, 1.8);
      const unoMat = new THREE.MeshStandardMaterial({
        color: 0x007897,
        roughness: 0.4,
        metalness: 0.2,
      });
      const uno = new THREE.Mesh(unoGeo, unoMat);
      uno.position.set(-1.8, -0.2, 0);
      circuitGroup.add(uno);

      // Silver USB Port on Arduino
      const usbGeo = new THREE.BoxGeometry(0.5, 0.35, 0.45);
      const usbMat = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        metalness: 0.9,
        roughness: 0.2,
      });
      const usbPort = new THREE.Mesh(usbGeo, usbMat);
      usbPort.position.set(-2.8, -0.05, -0.4);
      circuitGroup.add(usbPort);

      // Black ATmega328P MCU Chip
      const chipGeo = new THREE.BoxGeometry(1.2, 0.15, 0.35);
      const chipMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
      const chip = new THREE.Mesh(chipGeo, chipMat);
      chip.position.set(-1.6, -0.08, 0.2);
      circuitGroup.add(chip);

      // 3. 5mm Red LED Component on Breadboard
      const ledBulbGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const ledBulbMat = new THREE.MeshStandardMaterial({
        color: 0xff3b30,
        emissive: 0xff3b30,
        emissiveIntensity: 0.8,
        roughness: 0.1,
      });
      const ledBulb = new THREE.Mesh(ledBulbGeo, ledBulbMat);
      ledBulb.position.set(0.4, 0.2, 0.2);
      circuitGroup.add(ledBulb);

      const ledBaseGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.2, 16);
      const ledBase = new THREE.Mesh(ledBaseGeo, ledBulbMat);
      ledBase.position.set(0.4, 0.05, 0.2);
      circuitGroup.add(ledBase);

      const ledLight = new THREE.PointLight(0xff3b30, 2, 4);
      ledLight.position.set(0.4, 0.3, 0.2);
      circuitGroup.add(ledLight);

      // 4. Resistor Component (220 Ohm with Color Bands)
      const resBodyGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 16);
      const resMat = new THREE.MeshStandardMaterial({ color: 0xd9b382, roughness: 0.6 });
      const resistor = new THREE.Mesh(resBodyGeo, resMat);
      resistor.rotation.z = Math.PI / 2;
      resistor.position.set(0.4, 0.05, -0.2);
      circuitGroup.add(resistor);

      // Resistor Color Bands (Red, Red, Brown, Gold)
      const bandMatRed = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const bandMatBrown = new THREE.MeshBasicMaterial({ color: 0x8b4513 });
      const bandMatGold = new THREE.MeshBasicMaterial({ color: 0xffd700 });

      const bandGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.05, 16);
      const band1 = new THREE.Mesh(bandGeo, bandMatRed);
      band1.rotation.z = Math.PI / 2;
      band1.position.set(0.28, 0.05, -0.2);
      circuitGroup.add(band1);

      const band2 = new THREE.Mesh(bandGeo, bandMatRed);
      band2.rotation.z = Math.PI / 2;
      band2.position.set(0.36, 0.05, -0.2);
      circuitGroup.add(band2);

      const band3 = new THREE.Mesh(bandGeo, bandMatBrown);
      band3.rotation.z = Math.PI / 2;
      band3.position.set(0.44, 0.05, -0.2);
      circuitGroup.add(band3);

      const band4 = new THREE.Mesh(bandGeo, bandMatGold);
      band4.rotation.z = Math.PI / 2;
      band4.position.set(0.52, 0.05, -0.2);
      circuitGroup.add(band4);

      // 5. Jumper Wires connecting Arduino to Breadboard
      const createWire = (p1: THREE.Vector3, p2: THREE.Vector3, colorHex: number) => {
        const mid = new THREE.Vector3(
          (p1.x + p2.x) / 2,
          Math.max(p1.y, p2.y) + 0.6,
          (p1.z + p2.z) / 2
        );
        const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
        const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.025, 8, false);
        const tubeMat = new THREE.MeshStandardMaterial({
          color: colorHex,
          roughness: 0.3,
        });
        return new THREE.Mesh(tubeGeo, tubeMat);
      };

      // Red Wire: Uno 5V -> Breadboard Power Rail
      const redWire = createWire(
        new THREE.Vector3(-1.0, 0.0, 0.6),
        new THREE.Vector3(-0.6, 0.0, 0.85),
        0xff3b30
      );
      circuitGroup.add(redWire);

      // Black Wire: Uno GND -> Breadboard GND Rail
      const blackWire = createWire(
        new THREE.Vector3(-0.8, 0.0, 0.6),
        new THREE.Vector3(-0.4, 0.0, -0.85),
        0x111111
      );
      circuitGroup.add(blackWire);

      // Orange Wire: Uno Pin 13 -> Resistor -> LED
      const orangeWire = createWire(
        new THREE.Vector3(-1.0, 0.0, -0.6),
        new THREE.Vector3(0.15, 0.0, -0.2),
        0xff8a1f
      );
      circuitGroup.add(orangeWire);

      // Lighting
      const ambLight = new THREE.AmbientLight(0xffffff, 1.3);
      scene.add(ambLight);

      const dLight = new THREE.DirectionalLight(0xffffff, 1.2);
      dLight.position.set(5, 10, 7);
      scene.add(dLight);

      setLoading(false);

      // Animation Loop
      let clock = new THREE.Clock();

      const render = () => {
        animFrameRef.current = requestAnimationFrame(render);
        const t = clock.getElapsedTime();

        circuitGroup.rotation.y = rotYRef.current;
        circuitGroup.rotation.x = rotXRef.current;

        // LED Blinking Simulation if simulating or heartbeat
        const isBlinking = isSimulating || Math.sin(t * 4) > 0;
        if (isBlinking) {
          ledBulbMat.emissiveIntensity = 1.0;
          ledLight.intensity = 2.5;
        } else {
          ledBulbMat.emissiveIntensity = 0.1;
          ledLight.intensity = 0.2;
        }

        renderer.render(scene, camera);
        gl.endFrameEXP();
      };

      render();
    } catch (e) {
      console.warn('Circuit canvas error:', e);
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { height }]} {...panResponder.panHandlers}>
      <GLView style={styles.glView} onContextCreate={onContextCreate} />

      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.simStatusPill}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isSimulating ? COLORS.green : COLORS.coral },
            ]}
          />
          <Text style={styles.statusText}>
            {isSimulating ? 'SIMULATION RUNNING • 5.0V DC' : 'CIRCUIT READY • SIM HALTED'}
          </Text>
        </View>

        <View style={styles.touchHint}>
          <Text style={styles.hintText}>PINCH TO ZOOM • DRAG TO ROTATE</Text>
        </View>
      </View>

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loaderText}>Mounting 3D Breadboard...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: COLORS.bgBase,
    position: 'relative',
    overflow: 'hidden',
  },
  glView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 12,
    justifyContent: 'space-between',
  },
  simStatusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    shadowColor: 'rgba(20, 30, 60, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  statusText: {
    color: COLORS.navy,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  touchHint: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  hintText: {
    color: COLORS.textMuted,
    fontSize: 9,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.bgBase,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 8,
  },
});
