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
      scene.fog = new THREE.FogExp2(0xf5f6f8, 0.04);

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
      renderer.setClearColor(0xf5f6f8, 1);

      // 2. Clean Grid Floor
      const gridHelper = new THREE.GridHelper(10, 16, 0xff8a1f, 0xe8ecf2);
      gridHelper.position.y = -0.5;
      scene.add(gridHelper);

      // 3. Workshop Pedestal Platform
      const pedestalGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.2, 32);
      const pedestalMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.2,
      });
      const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
      pedestal.position.y = -0.4;
      scene.add(pedestal);

      // Orange Accent Rim Ring under robot
      const ringGeo = new THREE.TorusGeometry(1.65, 0.04, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xff8a1f });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.3;
      scene.add(ring);

      // 4. Studio Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
      dirLight.position.set(4, 8, 5);
      scene.add(dirLight);

      const orangeAccentLight = new THREE.PointLight(0xff8a1f, 1.2, 8);
      orangeAccentLight.position.set(0, 2, 2);
      scene.add(orangeAccentLight);

      // 5. Build 6-DOF Articulated Robot Arm Hierarchy
      const robotArmGroup = new THREE.Group();
      scene.add(robotArmGroup);

      // Materials
      const whiteChassisMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.2,
      });
      const darkJointMat = new THREE.MeshStandardMaterial({
        color: 0x1b2559,
        roughness: 0.5,
        metalness: 0.6,
      });
      const orangeAccentMat = new THREE.MeshStandardMaterial({
        color: 0xff8a1f,
        roughness: 0.2,
        metalness: 0.3,
      });

      // Base Turntable
      const baseGeo = new THREE.CylinderGeometry(0.7, 0.9, 0.4, 24);
      const baseMesh = new THREE.Mesh(baseGeo, darkJointMat);
      baseMesh.position.y = -0.1;
      robotArmGroup.add(baseMesh);

      // Shoulder Joint
      const shoulderJointGeo = new THREE.SphereGeometry(0.38, 20, 20);
      const shoulderMesh = new THREE.Mesh(shoulderJointGeo, orangeAccentMat);
      shoulderMesh.position.y = 0.3;
      robotArmGroup.add(shoulderMesh);

      // Lower Arm Link
      const lowerArmPivot = new THREE.Group();
      lowerArmPivot.position.set(0, 0.3, 0);
      robotArmGroup.add(lowerArmPivot);

      const lowerArmGeo = new THREE.BoxGeometry(0.24, 1.1, 0.24);
      const lowerArmMesh = new THREE.Mesh(lowerArmGeo, whiteChassisMat);
      lowerArmMesh.position.set(0, 0.55, 0);
      lowerArmPivot.add(lowerArmMesh);

      // Elbow Joint
      const elbowPivot = new THREE.Group();
      elbowPivot.position.set(0, 1.1, 0);
      lowerArmPivot.add(elbowPivot);

      const elbowMesh = new THREE.Mesh(shoulderJointGeo, darkJointMat);
      elbowPivot.add(elbowMesh);

      // Forearm Link
      const forearmGeo = new THREE.BoxGeometry(0.2, 0.9, 0.2);
      const forearmMesh = new THREE.Mesh(forearmGeo, whiteChassisMat);
      forearmMesh.position.set(0, 0.45, 0);
      elbowPivot.add(forearmMesh);

      // Wrist Joint & End-Effector Gripper
      const wristPivot = new THREE.Group();
      wristPivot.position.set(0, 0.9, 0);
      elbowPivot.add(wristPivot);

      const wristMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 0.2, 16),
        orangeAccentMat
      );
      wristPivot.add(wristMesh);

      // Dual-Finger Gripper
      const fingerGeo = new THREE.BoxGeometry(0.06, 0.28, 0.06);
      const finger1 = new THREE.Mesh(fingerGeo, darkJointMat);
      finger1.position.set(0.1, 0.22, 0);
      wristPivot.add(finger1);

      const finger2 = new THREE.Mesh(fingerGeo, darkJointMat);
      finger2.position.set(-0.1, 0.22, 0);
      wristPivot.add(finger2);

      setLoading(false);

      // Animation Loop
      let clock = new THREE.Clock();

      const render = () => {
        animFrameRef.current = requestAnimationFrame(render);

        const t = clock.getElapsedTime();

        // Kinematics Wave Animation
        lowerArmPivot.rotation.z = Math.sin(t * 1.5) * 0.25;
        elbowPivot.rotation.z = -Math.cos(t * 1.5) * 0.4 - 0.2;
        wristPivot.rotation.y = t * 2.0;

        // Interactive Touch Orbit Interpolation
        robotArmGroup.rotation.y = rotYRef.current + (interactive ? 0 : t * 0.2);
        robotArmGroup.rotation.x = rotXRef.current;

        renderer.render(scene, camera);
        gl.endFrameEXP();
      };

      render();
    } catch (e) {
      console.warn('Robot 3D scene error:', e);
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { height }]} {...panResponder.panHandlers}>
      <GLView style={styles.glView} onContextCreate={onContextCreate} />

      {/* Floating Reference A HUD */}
      <View style={styles.hudOverlay} pointerEvents="none">
        <View style={styles.hudBadge}>
          <View style={styles.greenDot} />
          <Text style={styles.hudBadgeText}>6-DOF ROBOT ARM // CALIBRATED</Text>
        </View>

        <View style={styles.hudDragHint}>
          <Text style={styles.hudHintText}>DRAG TO ORBIT 360°</Text>
        </View>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
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
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
    marginRight: 6,
  },
  hudBadgeText: {
    color: COLORS.navy,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  hudDragHint: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  hudHintText: {
    color: COLORS.textMuted,
    fontSize: 9,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.bgBase,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 8,
  },
});
