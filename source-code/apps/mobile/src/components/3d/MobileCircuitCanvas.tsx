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
      scene.fog = new THREE.FogExp2(0x07110d, 0.06);

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
      renderer.setClearColor(0x07110d, 1);

      // Floor grid
      const grid = new THREE.GridHelper(10, 20, 0x39ff6a, 0x0e3a28);
      grid.position.y = -0.5;
      scene.add(grid);

      // 3D Breadboard & Circuit Group
      const circuitGroup = new THREE.Group();
      scene.add(circuitGroup);

      // 1. White Half-Size Breadboard
      const bbGeo = new THREE.BoxGeometry(3.2, 0.25, 2.0);
      const bbMat = new THREE.MeshStandardMaterial({
        color: 0xefefef,
        roughness: 0.8,
        metalness: 0.1,
      });
      const breadboard = new THREE.Mesh(bbGeo, bbMat);
      breadboard.position.set(0.6, -0.2, 0);
      circuitGroup.add(breadboard);

      // Power rails (red & blue stripes)
      const redRailGeo = new THREE.BoxGeometry(3.1, 0.02, 0.06);
      const redRailMat = new THREE.MeshBasicMaterial({ color: 0xff3b30 });
      const redRail = new THREE.Mesh(redRailGeo, redRailMat);
      redRail.position.set(0.6, -0.06, 0.85);
      circuitGroup.add(redRail);

      const blueRailMat = new THREE.MeshBasicMaterial({ color: 0x007aff });
      const blueRail = new THREE.Mesh(redRailGeo, blueRailMat);
      blueRail.position.set(0.6, -0.06, 0.75);
      circuitGroup.add(blueRail);

      // 2. Arduino Uno PCB
      const unoGeo = new THREE.BoxGeometry(2.4, 0.15, 1.8);
      const unoMat = new THREE.MeshStandardMaterial({
        color: 0x005b66, // Classic Teal/Dark Blue Uno PCB
        roughness: 0.3,
        metalness: 0.4,
      });
      const arduino = new THREE.Mesh(unoGeo, unoMat);
      arduino.position.set(-2.0, -0.2, 0);
      circuitGroup.add(arduino);

      // USB Port
      const usbGeo = new THREE.BoxGeometry(0.5, 0.3, 0.45);
      const usbMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.9, roughness: 0.2 });
      const usb = new THREE.Mesh(usbGeo, usbMat);
      usb.position.set(-3.1, -0.1, -0.4);
      circuitGroup.add(usb);

      // ATmega328P DIP IC
      const icGeo = new THREE.BoxGeometry(1.2, 0.12, 0.35);
      const icMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.7 });
      const ic = new THREE.Mesh(icGeo, icMat);
      ic.position.set(-1.8, -0.08, 0.1);
      circuitGroup.add(ic);

      // 3. 5mm LED Component (Interactive Glowing Bulb)
      const ledBulbGeo = new THREE.SphereGeometry(0.14, 16, 16);
      const ledBulbMat = new THREE.MeshStandardMaterial({
        color: 0x39ff6a,
        emissive: 0x39ff6a,
        emissiveIntensity: 0.8,
        roughness: 0.1,
      });
      const ledBulb = new THREE.Mesh(ledBulbGeo, ledBulbMat);
      ledBulb.position.set(0.8, 0.18, 0);
      circuitGroup.add(ledBulb);

      // LED Light emission
      const ledLight = new THREE.PointLight(0x39ff6a, 2.0, 3);
      ledLight.position.set(0.8, 0.25, 0);
      circuitGroup.add(ledLight);

      // Resistor
      const resGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 12);
      const resMat = new THREE.MeshStandardMaterial({ color: 0xdbc48b, roughness: 0.5 });
      const resistor = new THREE.Mesh(resGeo, resMat);
      resistor.rotation.z = Math.PI / 2;
      resistor.position.set(0.4, 0.05, 0);
      circuitGroup.add(resistor);

      // 4. Curved 3D Jumper Wire from Arduino Pin 13 to Breadboard
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-1.0, 0.0, 0.7),
        new THREE.Vector3(-0.3, 1.0, 0.5),
        new THREE.Vector3(0.4, 0.0, 0.0)
      );
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.04, 8, false);
      const wireMat = new THREE.MeshStandardMaterial({ color: 0xff9a1f, roughness: 0.4 });
      const wire = new THREE.Mesh(tubeGeo, wireMat);
      circuitGroup.add(wire);

      // Ground wire (Green)
      const gndCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-1.0, 0.0, 0.5),
        new THREE.Vector3(-0.1, 0.8, 0.2),
        new THREE.Vector3(0.8, 0.0, 0.0)
      );
      const gndTubeGeo = new THREE.TubeGeometry(gndCurve, 20, 0.04, 8, false);
      const gndWireMat = new THREE.MeshStandardMaterial({ color: 0x39ff6a, roughness: 0.4 });
      const gndWire = new THREE.Mesh(gndTubeGeo, gndWireMat);
      circuitGroup.add(gndWire);

      // Lights
      const ambLight = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambLight);

      const dLight = new THREE.DirectionalLight(0xffffff, 1.2);
      dLight.position.set(3, 6, 4);
      scene.add(dLight);

      setLoading(false);

      const clock = new THREE.Clock();

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
              { backgroundColor: isSimulating ? COLORS.neon : COLORS.warning },
            ]}
          />
          <Text style={styles.statusText}>
            {isSimulating ? 'SIMULATION ACTIVE // 5.0V DC' : 'CIRCUIT STANDBY // READY'}
          </Text>
        </View>

        <View style={styles.touchHint}>
          <Text style={styles.hintText}>PINCH TO ZOOM • DRAG TO ROTATE</Text>
        </View>
      </View>

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color={COLORS.neon} />
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
    backgroundColor: 'rgba(4, 11, 8, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 106, 0.3)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  touchHint: {
    alignSelf: 'center',
    backgroundColor: 'rgba(4, 11, 8, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  hintText: {
    color: COLORS.textMuted,
    fontSize: 9,
    letterSpacing: 1,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.bgBase,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 8,
  },
});
