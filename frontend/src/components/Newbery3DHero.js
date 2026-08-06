"use client";
import React, { useState, useEffect, useRef } from 'react';
import * as BABYLON from '@babylonjs/core';
import { Sparkles } from 'lucide-react';
import { useTheme } from './ThemeContext';

export default function Newbery3DHero() {
  const [webGLSupported, setWebGLSupported] = useState(true);
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!canvasRef.current) return;

    if (!BABYLON.Engine.isSupported()) {
      setTimeout(() => setWebGLSupported(false), 0);
      return;
    }

    let engine;
    let scene;
    try {
      engine = new BABYLON.Engine(canvasRef.current, true, {
        preserveDrawingBuffer: true,
        stencil: true
      });
      const bgHex = theme?.bgColor || "#070707";
      const bgC = BABYLON.Color3.FromHexString(bgHex);
      scene.clearColor = new BABYLON.Color4(bgC.r, bgC.g, bgC.b, 1.0);
    } catch (e) {
      console.error("Fallo al crear escena Babylon:", e);
      setWebGLSupported(false);
      return;
    }

    try {
      const camera = new BABYLON.ArcRotateCamera(
        "camera",
        -Math.PI / 2,
        Math.PI / 2.2,
        7,
        BABYLON.Vector3.Zero(),
        scene
      );
      camera.attachControl(canvasRef.current, true, false);
      camera.lowerRadiusLimit = 4;
      camera.upperRadiusLimit = 10;

      // Iluminación
      const hemiLight = new BABYLON.HemisphericLight(
        "hemiLight",
        new BABYLON.Vector3(0, 1, 0),
        scene
      );
      hemiLight.intensity = 0.7;

      const primHex = theme?.primaryColor || "#dc2626";
      const secHex = theme?.accentColor || "#ffffff";
      const tertHex = theme?.tertiaryColor || "#111827";

      const themeLight = new BABYLON.PointLight(
        "themeLight",
        new BABYLON.Vector3(2.5, 2, 2.5),
        scene
      );
      try {
        themeLight.diffuse = BABYLON.Color3.FromHexString(primHex);
      } catch (e) {
        themeLight.diffuse = new BABYLON.Color3(0.8, 0.1, 0.1);
      }
      themeLight.intensity = 2.2;

      const whiteLight = new BABYLON.PointLight(
        "whiteLight",
        new BABYLON.Vector3(-2.5, -2, -2.5),
        scene
      );
      whiteLight.diffuse = new BABYLON.Color3(1, 1, 1);
      whiteLight.intensity = 1.2;

      // MALLA 3D DINÁMICA DE 8 FORMAS DE ESCUDOS (ORIENTACIÓN CORRECTA AL DERECHO)
      let mainMesh;
      const objectType = theme?.object3D || 'shield';
      const shieldShape = theme?.shieldShape || 'classic';

      if (objectType === 'shield') {
        if (shieldShape === 'circular') {
          // 🟡 ESCUDO CIRCULAR
          mainMesh = BABYLON.MeshBuilder.CreateCylinder(
            "clubShieldMesh",
            { height: 0.3, diameter: 2.6, tessellation: 64 },
            scene
          );
          mainMesh.rotation.x = -Math.PI / 2;
          mainMesh.rotation.z = Math.PI;
        } else if (shieldShape === 'diamond') {
          // 💎 ESCUDO DIAMANTE / ROMBO
          mainMesh = BABYLON.MeshBuilder.CreateCylinder(
            "clubShieldMesh",
            { height: 0.3, diameterTop: 2.6, diameterBottom: 2.6, tessellation: 4 },
            scene
          );
          mainMesh.rotation.x = -Math.PI / 2;
          mainMesh.rotation.y = Math.PI / 4;
          mainMesh.rotation.z = Math.PI;
        } else if (shieldShape === 'triangular') {
          // ⚔️ ESCUDO GOTICO TRIANGULAR
          mainMesh = BABYLON.MeshBuilder.CreateCylinder(
            "clubShieldMesh",
            { height: 0.3, diameterTop: 2.6, diameterBottom: 2.6, tessellation: 3 },
            scene
          );
          mainMesh.rotation.x = -Math.PI / 2;
          mainMesh.rotation.y = Math.PI / 2;
          mainMesh.rotation.z = Math.PI;
        } else if (shieldShape === 'pentagon') {
          // 🌟 ESCUDO PENTAGONAL DEPORTIVO
          mainMesh = BABYLON.MeshBuilder.CreateCylinder(
            "clubShieldMesh",
            { height: 0.3, diameterTop: 2.6, diameterBottom: 2.6, tessellation: 5 },
            scene
          );
          mainMesh.rotation.x = -Math.PI / 2;
          mainMesh.rotation.z = Math.PI;
        } else if (shieldShape === 'spanish') {
          // 🏆 ESCUDO HERÁLDICO ESPAÑOL
          mainMesh = BABYLON.MeshBuilder.CreateCylinder(
            "clubShieldMesh",
            { height: 0.3, diameterTop: 2.6, diameterBottom: 2.6, tessellation: 8 },
            scene
          );
          mainMesh.rotation.x = -Math.PI / 2;
          mainMesh.rotation.z = Math.PI;
        } else if (shieldShape === 'crowned') {
          // 👑 ESCUDO CORONADO / ANGULAR
          mainMesh = BABYLON.MeshBuilder.CreateCylinder(
            "clubShieldMesh",
            { height: 0.3, diameterTop: 2.6, diameterBottom: 2.6, tessellation: 10 },
            scene
          );
          mainMesh.rotation.x = -Math.PI / 2;
          mainMesh.rotation.z = Math.PI;
        } else if (shieldShape === 'classic') {
          // 🛡️ ESCUDO CLÁSICO APUNTADO (Ancho Arriba, Punta Abajo)
          mainMesh = BABYLON.MeshBuilder.CreateCylinder(
            "clubShieldMesh",
            { height: 0.3, diameterTop: 1.0, diameterBottom: 2.6, tessellation: 6 },
            scene
          );
          mainMesh.rotation.x = -Math.PI / 2;
          mainMesh.rotation.z = Math.PI;
        } else {
          // ⬛ ESCUDO RECTANGULAR BISELADO
          mainMesh = BABYLON.MeshBuilder.CreateBox(
            "clubShieldMesh",
            { width: 2.2, height: 2.6, depth: 0.3 },
            scene
          );
        }

        // Material y Textura Dinámica TRICOLOR (3 Colores + Proyección Al Derecho)
        const shieldMat = new BABYLON.StandardMaterial("shieldMat", scene);
        const dynamicTexture = new BABYLON.DynamicTexture(
          "shieldTexture",
          { width: 512, height: 512 },
          scene,
          true
        );

        shieldMat.diffuseTexture = dynamicTexture;
        shieldMat.specularColor = new BABYLON.Color3(0.9, 0.9, 0.9);
        shieldMat.specularPower = 64;
        mainMesh.material = shieldMat;

        const drawShieldTexture = () => {
          try {
            const ctx = dynamicTexture.getContext();

            // Fondo Tricolor (Banda Diagonal)
            ctx.fillStyle = primHex;
            ctx.fillRect(0, 0, 512, 512);

            // Franja Diagonal con Color Secundario
            ctx.fillStyle = secHex;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(512, 512);
            ctx.lineTo(512, 350);
            ctx.lineTo(350, 0);
            ctx.closePath();
            ctx.fill();

            // Marco Exterior con Color Terciario
            ctx.strokeStyle = tertHex;
            ctx.lineWidth = 20;
            ctx.strokeRect(10, 10, 492, 492);

            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = 4;
            ctx.strokeRect(22, 22, 468, 468);

            // Proyectar Foto o Escudo del Usuario (Orientación Al Derecho)
            if (theme?.customLogoUrl && typeof window !== 'undefined') {
              const img = new window.Image();
              img.crossOrigin = "anonymous";
              img.onload = () => {
                try {
                  ctx.save();
                  // Fondo circular en el centro
                  ctx.fillStyle = tertHex;
                  ctx.beginPath();
                  ctx.arc(256, 256, 160, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.strokeStyle = secHex;
                  ctx.lineWidth = 6;
                  ctx.stroke();

                  // Proyección limpia al derecho
                  ctx.beginPath();
                  ctx.arc(256, 256, 150, 0, Math.PI * 2);
                  ctx.clip();
                  ctx.drawImage(img, 106, 106, 300, 300);
                  ctx.restore();

                  dynamicTexture.update();
                } catch (e) {
                  console.error("Error al renderizar foto sobre escudo 3D:", e);
                }
              };
              img.onerror = () => {
                console.warn("Fallo al cargar la foto, usando fallback de texto.");
              };
              img.src = theme.customLogoUrl;
            } else {
              // Fallback de texto
              ctx.fillStyle = "#FFFFFF";
              ctx.font = "bold 32px Montserrat, sans-serif";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(theme?.clubShortName || "JORGE NEWBERY", 256, 230);

              ctx.fillStyle = secHex;
              ctx.font = "bold 20px Montserrat, sans-serif";
              ctx.fillText(theme?.subTitle || "CLUB DIGITAL", 256, 280);
            }

            dynamicTexture.update();
          } catch (err) {
            console.error("Error en textura dinámica tricolor del escudo:", err);
          }
        };

        drawShieldTexture();

      } else if (objectType === 'trophy') {
        // 🏆 TROFEO / COPA DORADA 3D
        mainMesh = BABYLON.MeshBuilder.CreateCylinder(
          "trophyCup",
          { height: 2.2, diameterTop: 1.8, diameterBottom: 0.8, tessellation: 32 },
          scene
        );

        const trophyMat = new BABYLON.StandardMaterial("trophyMat", scene);
        trophyMat.diffuseColor = BABYLON.Color3.FromHexString("#f59e0b");
        trophyMat.specularColor = new BABYLON.Color3(1, 0.9, 0.5);
        trophyMat.specularPower = 128;
        mainMesh.material = trophyMat;

      } else if (objectType === 'skates') {
        // 🛼 PATÍN ARTÍSTICO 3D (Bota + Chasis + 4 Ruedas Tricolor)
        mainMesh = new BABYLON.TransformNode("skateGroup", scene);

        const boot = BABYLON.MeshBuilder.CreateBox("skateBoot", { width: 1.2, height: 1.6, depth: 2.4 }, scene);
        boot.parent = mainMesh;
        boot.position.y = 0.6;

        const bootMat = new BABYLON.StandardMaterial("bootMat", scene);
        bootMat.diffuseColor = BABYLON.Color3.FromHexString(secHex);
        bootMat.specularColor = new BABYLON.Color3(0.8, 0.8, 0.8);
        boot.material = bootMat;

        const plate = BABYLON.MeshBuilder.CreateBox("skatePlate", { width: 1.0, height: 0.2, depth: 2.6 }, scene);
        plate.parent = mainMesh;
        plate.position.y = -0.3;

        const plateMat = new BABYLON.StandardMaterial("plateMat", scene);
        plateMat.diffuseColor = BABYLON.Color3.FromHexString(primHex);
        plate.material = plateMat;

        // 4 Ruedas
        const wheelPositions = [
          { x: -0.6, y: -0.6, z: 0.8 },
          { x: 0.6, y: -0.6, z: 0.8 },
          { x: -0.6, y: -0.6, z: -0.8 },
          { x: 0.6, y: -0.6, z: -0.8 },
        ];

        const wheelMat = new BABYLON.StandardMaterial("wheelMat", scene);
        wheelMat.diffuseColor = BABYLON.Color3.FromHexString(tertHex);

        wheelPositions.forEach((pos, idx) => {
          const wheel = BABYLON.MeshBuilder.CreateCylinder(`wheel_${idx}`, { height: 0.3, diameter: 0.7, tessellation: 24 }, scene);
          wheel.parent = mainMesh;
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(pos.x, pos.y, pos.z);
          wheel.material = wheelMat;
        });

      } else if (objectType === 'martial_arts') {
        // 🥋 ARTES MARCIALES & CINTURÓN 3D
        mainMesh = new BABYLON.TransformNode("martialArtsGroup", scene);

        const beltRing = BABYLON.MeshBuilder.CreateTorus("beltRing", { diameter: 2.2, thickness: 0.4, tessellation: 48 }, scene);
        beltRing.parent = mainMesh;

        const beltMat = new BABYLON.StandardMaterial("beltMat", scene);
        beltMat.diffuseColor = BABYLON.Color3.FromHexString(tertHex);
        beltRing.material = beltMat;

        const emblem = BABYLON.MeshBuilder.CreateCylinder("emblem", { height: 0.2, diameter: 1.4, tessellation: 32 }, scene);
        emblem.parent = mainMesh;
        emblem.rotation.x = Math.PI / 2;

        const emblemMat = new BABYLON.StandardMaterial("emblemMat", scene);
        emblemMat.diffuseColor = BABYLON.Color3.FromHexString(primHex);
        emblem.material = emblemMat;

      } else if (objectType === 'multisport') {
        // 🌟 CLUSTER MULTI-DEPORTE (Pelota Central + Copa + Patín orbitando)
        mainMesh = new BABYLON.TransformNode("multisportGroup", scene);

        const centerBall = BABYLON.MeshBuilder.CreateSphere("clusterBall", { diameter: 1.8, segments: 32 }, scene);
        centerBall.parent = mainMesh;
        const ballMat = new BABYLON.StandardMaterial("clusterBallMat", scene);
        ballMat.diffuseColor = BABYLON.Color3.FromHexString(primHex);
        centerBall.material = ballMat;

        const sideCup = BABYLON.MeshBuilder.CreateCylinder("clusterCup", { height: 1.4, diameterTop: 1.0, diameterBottom: 0.5 }, scene);
        sideCup.parent = mainMesh;
        sideCup.position.set(1.8, 0.4, 0);
        const cupMat = new BABYLON.StandardMaterial("clusterCupMat", scene);
        cupMat.diffuseColor = BABYLON.Color3.FromHexString("#f59e0b");
        sideCup.material = cupMat;

        const sideSkate = BABYLON.MeshBuilder.CreateBox("clusterSkate", { width: 0.8, height: 1.0, depth: 1.4 }, scene);
        sideSkate.parent = mainMesh;
        sideSkate.position.set(-1.8, -0.2, 0);
        const skateMat = new BABYLON.StandardMaterial("clusterSkateMat", scene);
        skateMat.diffuseColor = BABYLON.Color3.FromHexString(secHex);
        sideSkate.material = skateMat;

      } else {
        // ⚽ 🏀 🏐 BALÓN CON TEXTURA TRICOLOR Y FOTO
        mainMesh = BABYLON.MeshBuilder.CreateSphere(
          "sportsBall",
          { diameter: 2.4, segments: 64 },
          scene
        );

        const ballMaterial = new BABYLON.StandardMaterial("ballMaterial", scene);
        const dynamicTexture = new BABYLON.DynamicTexture(
          "dynamicTexture",
          { width: 512, height: 256 },
          scene,
          true
        );
        ballMaterial.diffuseTexture = dynamicTexture;
        ballMaterial.specularColor = new BABYLON.Color3(0.7, 0.7, 0.7);
        ballMaterial.specularPower = 32;
        mainMesh.material = ballMaterial;

        const drawTexture = () => {
          try {
            const ctx = dynamicTexture.getContext();

            if (objectType === 'basketball') {
              ctx.fillStyle = "#ea580c";
              ctx.fillRect(0, 0, 512, 256);

              ctx.strokeStyle = "#111111";
              ctx.lineWidth = 6;

              ctx.beginPath();
              ctx.moveTo(0, 128); ctx.lineTo(512, 128);
              ctx.moveTo(256, 0); ctx.lineTo(256, 256);
              ctx.stroke();

              ctx.beginPath();
              ctx.arc(128, 128, 80, 0, Math.PI * 2);
              ctx.arc(384, 128, 80, 0, Math.PI * 2);
              ctx.stroke();

            } else if (objectType === 'volleyball') {
              ctx.fillStyle = primHex;
              ctx.fillRect(0, 0, 170, 256);

              ctx.fillStyle = secHex;
              ctx.fillRect(170, 0, 172, 256);

              ctx.fillStyle = tertHex;
              ctx.fillRect(342, 0, 170, 256);

              ctx.strokeStyle = "#111111";
              ctx.lineWidth = 4;
              ctx.strokeRect(0, 0, 512, 256);

            } else {
              // ⚽ FUTSAL / FÚTBOL
              ctx.fillStyle = "#FFFFFF";
              ctx.fillRect(0, 0, 512, 256);

              const patches = [
                { x: 42, y: 50 }, { x: 128, y: 50 }, { x: 213, y: 50 }, { x: 298, y: 50 }, { x: 384, y: 50 }, { x: 470, y: 50 },
                { x: 0, y: 128 }, { x: 85, y: 128 }, { x: 170, y: 128 }, { x: 256, y: 128 }, { x: 341, y: 128 }, { x: 426, y: 128 }, { x: 512, y: 128 },
                { x: 42, y: 206 }, { x: 128, y: 206 }, { x: 213, y: 206 }, { x: 298, y: 206 }, { x: 384, y: 206 }, { x: 470, y: 206 }
              ];

              patches.forEach((p) => {
                if (p.x === 256 && p.y === 128) return;

                ctx.fillStyle = "#111111";
                ctx.strokeStyle = primHex;
                ctx.lineWidth = 3.5;
                ctx.beginPath();
                const sides = 5;
                const radius = 22;
                for (let i = 0; i <= sides; i++) {
                  const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
                  const px = p.x + Math.cos(angle) * radius;
                  const py = p.y + Math.sin(angle) * radius;
                  if (i === 0) ctx.moveTo(px, py);
                  else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
              });

              ctx.strokeStyle = primHex;
              ctx.lineWidth = 3;
              ctx.fillStyle = "#FFFFFF";
              ctx.beginPath();
              ctx.arc(256, 128, 32, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();

              if (theme?.customLogoUrl && typeof window !== 'undefined') {
                const img = new window.Image();
                img.crossOrigin = "anonymous";
                img.onload = () => {
                  try {
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(256, 128, 28, 0, Math.PI * 2);
                    ctx.clip();
                    ctx.drawImage(img, 226, 98, 60, 60);
                    ctx.restore();
                    dynamicTexture.update();
                  } catch (e) {
                    console.error("Error al proyectar imagen:", e);
                  }
                };
                img.onerror = () => {
                  if (!img.src.includes('/icon-192.png')) {
                    img.src = '/icon-192.png';
                  }
                };
                img.src = theme?.customLogoUrl || '/icon-192.png';
              } else {
                ctx.fillStyle = "#111111";
                ctx.font = "bold 9px Montserrat, sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(theme?.clubShortName || "JORGE", 256, 120);
                ctx.fillStyle = primHex;
                ctx.font = "black 9px Montserrat, sans-serif";
                ctx.fillText("NEWBERY", 256, 134);
              }
            }

            dynamicTexture.update();
          } catch (err) {
            console.error("Error en renderizado de textura dinámica:", err);
          }
        };

        drawTexture();
      }

      // Órbitas de átomos/partículas
      const orbiters = [];
      let orbColor1, orbColor2, orbColor3;
      try {
        orbColor1 = BABYLON.Color3.FromHexString(primHex);
        orbColor2 = BABYLON.Color3.FromHexString(secHex);
        orbColor3 = BABYLON.Color3.FromHexString(tertHex);
      } catch (e) {
        orbColor1 = new BABYLON.Color3(0.8, 0.1, 0.1);
        orbColor2 = new BABYLON.Color3(1, 1, 1);
        orbColor3 = new BABYLON.Color3(0.1, 0.1, 0.1);
      }

      const colors = [orbColor1, orbColor2, orbColor3];

      for (let i = 0; i < 18; i++) {
        const orb = BABYLON.MeshBuilder.CreateSphere(
          `orb_${i}`,
          { diameter: 0.12 + Math.random() * 0.15 },
          scene
        );

        const orbMat = new BABYLON.StandardMaterial(`orbMat_${i}`, scene);
        const color = colors[i % colors.length];
        orbMat.diffuseColor = color;
        orbMat.emissiveColor = color.scale(0.25);
        orb.material = orbMat;

        orbiters.push({
          mesh: orb,
          radiusX: 2.2 + Math.random() * 1.5,
          radiusZ: 2.2 + Math.random() * 1.5,
          speed: 0.008 + Math.random() * 0.012,
          angle: Math.random() * Math.PI * 2,
          heightOffset: (Math.random() - 0.5) * 1.5,
          wobbleSpeed: 0.02 + Math.random() * 0.03
        });
      }

      scene.registerBeforeRender(() => {
        const time = Date.now() * 0.001;

        if (scene) {
          try {
            const currentBgHex = theme?.bgColor || "#070707";
            const currentBgC = BABYLON.Color3.FromHexString(currentBgHex);
            scene.clearColor = new BABYLON.Color4(currentBgC.r, currentBgC.g, currentBgC.b, 1.0);
          } catch (e) {}
        }

        if (mainMesh) {
          const userScale = theme?.objectScale || 1.0;
          mainMesh.scaling = new BABYLON.Vector3(userScale, userScale, userScale);
          mainMesh.rotation.y = time * 0.45;
          if (objectType !== 'shield') {
            mainMesh.rotation.x = time * 0.18;
          }
          mainMesh.position.y = Math.sin(time * 1.5) * 0.15;
        }

        orbiters.forEach((orb) => {
          orb.angle += orb.speed;
          orb.mesh.position.x = Math.cos(orb.angle) * orb.radiusX;
          orb.mesh.position.z = Math.sin(orb.angle) * orb.radiusZ;
          orb.mesh.position.y = Math.sin(time * orb.wobbleSpeed) * 0.5 + orb.heightOffset;
        });

        themeLight.position.x = Math.sin(time) * 3;
        themeLight.position.z = Math.cos(time) * 3;
      });

      engine.runRenderLoop(() => {
        scene.render();
      });

    } catch (e) {
      console.error("Error al configurar mallas en Babylon:", e);
    }

    const handleResize = () => {
      if (engine) engine.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (scene) scene.dispose();
      if (engine) engine.dispose();
    };
  }, [theme?.object3D, theme?.shieldShape, theme?.primaryColor, theme?.accentColor, theme?.tertiaryColor, theme?.customLogoUrl, theme?.clubShortName, theme?.bgColor, theme?.objectScale]);

  if (!webGLSupported) {
    return (
      <div className="absolute inset-0 w-full h-full bg-jn-black flex items-center justify-center text-white font-bold text-xs">
        <p>Lienzo 3D en modo dinámico</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <canvas ref={canvasRef} className="w-full h-full block outline-none" />
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 pointer-events-none">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles size={10} className="text-red-400 animate-spin [animation-duration:4s]" />
          Lienzo 3D Tricolor · Forma: {(theme?.shieldShape || 'classic').toUpperCase()}
        </p>
      </div>
    </div>
  );
}
