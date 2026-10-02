# 🤖 RoboVerse — Verified Free-License 3D Models & Assets Guide

This guide curates open-source, CC-BY (Creative Commons Attribution), CC0 (Public Domain), and MIT-licensed 3D glTF/GLB models for use across the RoboVerse 3D Circuit Simulator, 3D Robot Builder, and Landing Page.

---

## 🔌 1. Microcontrollers & Development Boards

| Component | License | Recommended Source / Repositories | Direct glTF / STEP Links |
| :--- | :--- | :--- | :--- |
| **Arduino Uno R3** | CC-BY-SA 4.0 / MIT | Arduino Official Hardware Repository & GrabCAD | [Arduino Hardware Open Assets](https://github.com/arduino/ArduinoCore-avr), [GrabCAD Arduino Uno R3](https://grabcad.com/library/arduino-uno-r3-1) |
| **Arduino Nano 33 IoT** | CC-BY-SA 4.0 | Arduino GitHub Hardware CAD | [Arduino Nano Open Model](https://github.com/arduino/ArduinoCore-samd) |
| **Arduino Mega 2560** | CC-BY-SA 4.0 | GrabCAD Community Open Source | [GrabCAD Arduino Mega 2560](https://grabcad.com/library/arduino-mega-2560-reference-design) |
| **ESP32 NodeMCU WROOM-32** | CC-BY 4.0 | Espressif Open Hardware / Sketchfab | [Sketchfab ESP32 Free Asset](https://sketchfab.com/3d-models/esp32-nodemcu-board) |
| **Raspberry Pi Pico (RP2040)** | CC-BY 4.0 | Raspberry Pi Foundation Open Hardware | [Raspberry Pi Documentation Assets](https://datasheets.raspberrypi.com/pico/Pico-R3-step.zip) |

---

## ⚡ 2. Sensors & Modules

| Component | License | Source | Notes |
| :--- | :--- | :--- | :--- |
| **HC-SR04 Ultrasonic Sensor** | CC-BY 4.0 | GrabCAD / Poly Pizza | Dual transducer cans, 4-pin header |
| **DHT11 / DHT22 Temp & Humidity** | CC0 / Public Domain | Sketchfab Free Electronics | Blue/White perforated housing |
| **MPU-6050 6-Axis Gyro & Accel** | CC-BY 4.0 | GitHub open-hardware-models | I2C sensor PCB with 8 pins |
| **PIR Motion Sensor (HC-SR501)** | CC-BY 4.0 | GrabCAD | Fresnel lens dome, dual potentiometers |
| **LDR Photoresistor Module** | CC0 | Free3D / CGTrader Free | Photocell snake pattern with 10k resistor |
| **16x2 I2C Character LCD** | CC-BY 4.0 | GrabCAD | Blue backlight LCD with backpack module |
| **0.96" I2C OLED (SSD1306)** | CC-BY 4.0 | Sketchfab | Monochromatic OLED display |

---

## ⚙️ 3. Actuators, Motors & Drivers

| Component | License | Source | Notes |
| :--- | :--- | :--- | :--- |
| **SG90 Micro Servo (9g)** | CC-BY 4.0 | GrabCAD / Tinkercad | Translucent blue casing, 3-pin lead |
| **L298N Dual H-Bridge Driver** | CC-BY-SA | GrabCAD | Aluminum heatsink, screw terminals |
| **TT DC Gear Motor (Yellow BO Motor)** | CC0 / Public Domain | Poly Pizza / Sketchfab | Dual shaft, 1:48 gear ratio |
| **NEMA 17 Stepper Motor** | CC-BY 4.0 | OpenBuilds CAD Library | 42mm faceplate, 5mm D-shaft |
| **28BYJ-48 Stepper with ULN2003** | CC-BY 4.0 | GrabCAD | 5V unipolar stepper with driver board |

---

## 🏎️ 4. Robot Chassis & Mechanics

| Chassis Model | License | Source | Description |
| :--- | :--- | :--- | :--- |
| **2WD Smart Robot Car Chassis** | CC-BY 4.0 | GrabCAD / GitHub | Laser-cut acrylic plate, 2 drive wheels, 1 castor |
| **4WD Obstacle Avoidance Rover** | CC-BY 4.0 | Thingiverse / Printables | Double-deck acrylic chassis with battery box |
| **6-DOF Robotic Arm Assembly** | CC-BY-SA 3.0 | GitHub Open-Manipulator | Articulated gripper with servo linkages |
| **Quadruped Robot Chassis** | MIT | Stanford Pupper Open Project | 12-servo quadruped frame |

---

## 🚀 5. Draco Compression & LOD Workflow

To ensure 60 FPS performance on lower-tier mobile and web browsers:

1. **Convert to Binary GLB**:
   ```bash
   npx gltf-pipeline -i model.gltf -o model.glb -d
   ```

2. **Draco Geometry Compression**:
   ```bash
   npx @gltf-transform/cli optimize model.glb optimized.glb --compress draco
   ```
   *Reduces typical 15 MB CAD models down to under 600 KB!*

3. **Level of Detail (LOD)**:
   - High detail for close-up component inspection (< 1m camera distance).
   - Low polygon proxies for birds-eye workbench view (> 3m camera distance).
