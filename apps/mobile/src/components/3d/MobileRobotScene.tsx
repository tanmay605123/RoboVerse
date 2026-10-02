import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, Text, ActivityIndicator } from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import { COLORS } from '../../theme/colors';

interface MobileRobotSceneProps {
  height?: number;
  interactive?: boolean;
}

export function MobileRobotScene({ height = 240, interactive = true }: MobileRobotSceneProps) {
  const [loading, setLoading] = useState(true);
  const animFrameRef = useRef<number | null>(null);

  // Interaction refs
  const rotYRef = useRef(0);
  const rotXRef = useRef(0.2);
  const isDraggingRef = useRef(false);
  const lastTouchRef = useRef({ x: 0, y: 0 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => interactive,
      onMoveShouldSetPanResponder: () => interactive,
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
        rotXRef.current = Math.max(-0.4, Math.min(0.8, rotXRef.current + dy * 0.01));
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

      // 1. Three.js Scene, Camera, Renderer
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x07110d, 0.08);

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 2.4, 5.5);
      camera.lookAt(0, 0.6, 0);

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
        alpha: true,
      });
      renderer.setSize(width, height);
      renderer.setClearColor(0x07110d, 1);

      // 2. Neon Grid Floor
      const gridHelper = new THREE.GridHelper(10, 16, 0x39ff6a, 0x0e3a28);
      gridHelper.position.y = -0.5;
      scene.add(gridHelper);

      // 3. Glowing Pedestal Platform
      const pedestalGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.2, 32);
      const pedestalMat = new THREE.MeshStandardMaterial({
        color: 0x091a14,
        roughness: 0.3,
        metalness: 0.8,
      });
      const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
      pedestal.position.y = -0.4;
      scene.add(pedestal);

      // Neon Rim Ring under active object
      const ringGeo = new THREE.TorusGeometry(1.65, 0.04, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x39ff6a });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.38;
      scene.add(ring);

      // 4. Robotic Arm Robot Group
      const robotGroup = new THREE.Group();
      scene.add(robotGroup);

      // Base
      const baseGeo = new THREE.CylinderGeometry(0.7, 0.9, 0.4, 24);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x1a2e26,
        roughness: 0.4,
        metalness: 0.6,
      });
      const robotBase = new THREE.Mesh(baseGeo, baseMat);
      robotBase.position.y = -0.1;
      robotGroup.add(robotBase);

      // Torso / Pivot Joint
      const jointGeo = new THREE.SphereGeometry(0.4, 16, 16);
      const jointMat = new THREE.MeshStandardMaterial({
        color: 0x7fe7d6,
        metalness: 0.8,
        roughness: 0.2,
      });
      const joint1 = new THREE.Mesh(jointGeo, jointMat);
      joint1.position.y = 0.3;
      robotGroup.add(joint1);

      // Arm Link 1
      const armGeo1 = new THREE.BoxGeometry(0.25, 1.2, 0.25);
      const armMat1 = new THREE.MeshStandardMaterial({
        color: 0x0f291e,
        metalness: 0.5,
        roughness: 0.3,
      });
      const arm1 = new THREE.Mesh(armGeo1, armMat1);
      arm1.position.set(0, 0.9, 0);
      arm1.rotation.z = -0.2;
      robotGroup.add(arm1);

      // Elbow Joint with Neon Accent
      const elbow = new THREE.Mesh(jointGeo, jointMat);
      elbow.position.set(-0.25, 1.5, 0);
      robotGroup.add(elbow);

      // Forearm Link 2
      const arm2 = new THREE.Mesh(armGeo1, armMat1);
      arm2.position.set(0.2, 2.0, 0);
      arm2.rotation.z = 0.4;
      robotGroup.add(arm2);

      // Robotic Gripper Tool (Teal & Neon)
      const gripperGeo = new THREE.ConeGeometry(0.2, 0.4, 4);
      const gripperMat = new THREE.MeshStandardMaterial({
        color: 0x39ff6a,
        emissive: 0x39ff6a,
        emissiveIntensity: 0.4,
      });
      const gripper = new THREE.Mesh(gripperGeo, gripperMat);
      gripper.position.set(0.65, 2.4, 0);
      gripper.rotation.z = -Math.PI / 2;
      robotGroup.add(gripper);

      // 5. Lighting Setup
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0x7fe7d6, 1.5);
      dirLight.position.set(4, 8, 4);
      scene.add(dirLight);

      const neonPointLight = new THREE.PointLight(0x39ff6a, 2.5, 6);
      neonPointLight.position.set(0, 1.2, 1);
      scene.add(neonPointLight);

      setLoading(false);

      // 6. Animation Loop
      let clock = new THREE.Clock();

      const render = () => {
        animFrameRef.current = requestAnimationFrame(render);
        const elapsedTime = clock.getElapsedTime();

        // Idle floating & rotation if not being dragged
        if (!isDraggingRef.current) {
          rotYRef.current += 0.008;
        }

        robotGroup.rotation.y = rotYRef.current;
        robotGroup.rotation.x = rotXRef.current;

        // Subtle robotic breathing / inverse kinematics pulsation
        arm1.rotation.z = -0.2 + Math.sin(elapsedTime * 1.5) * 0.08;
        arm2.rotation.z = 0.4 - Math.sin(elapsedTime * 1.5) * 0.1;
        gripper.position.y = 2.4 + Math.cos(elapsedTime * 1.5) * 0.05;

        // Pedestal glow ring breathing
        ringMat.color.setHex(Math.sin(elapsedTime * 2) > 0 ? 0x39ff6a : 0x2bd95b);

        renderer.render(scene, camera);
        gl.endFrameEXP();
      };

      render();
    } catch (e) {
      console.warn('Three.js mobile GL error:', e);
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { height }]} {...panResponder.panHandlers}>
      <GLView style={styles.glView} onContextCreate={onContextCreate} />

      {/* Floating HUD Badges on 3D Scene */}
      <View style={styles.hudOverlay} pointerEvents="none">
        <View style={styles.hudBadge}>
          <View style={styles.neonDot} />
          <Text style={styles.hudBadgeText}>6-DOF ROBOT ARM // ONLINE</Text>
        </View>

        <View style={styles.hudDragHint}>
          <Text style={styles.hudHintText}>DRAG TO ORBIT 360°</Text>
        </View>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.neon} />
          <Text style={styles.loadingText}>Initializing 3D Control Core...</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  glView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  hudOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 12,
    justifyContent: 'space-between',
  },
  hudBadge: {
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
  neonDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.neon,
    marginRight: 6,
  },
  hudBadgeText: {
    color: COLORS.neon,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  hudDragHint: {
    alignSelf: 'center',
    backgroundColor: 'rgba(4, 11, 8, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  hudHintText: {
    color: COLORS.textMuted,
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: '600',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.bgBase,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 8,
  },
});
