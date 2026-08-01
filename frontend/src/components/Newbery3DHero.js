"use client";
import React, { useState, useEffect, useRef } from 'react';
import * as BABYLON from '@babylonjs/core';
import { Sparkles } from 'lucide-react';

export default function Newbery3DHero() {
  const [webGLSupported, setWebGLSupported] = useState(true);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Verificar si WebGL está soportado por el navegador
    if (!BABYLON.Engine.isSupported()) {
      console.warn("WebGL no está soportado en este navegador. Cargando fallback.");
      setTimeout(() => setWebGLSupported(false), 0);
      return;
    }

    let engine;
    try {
      // Inicializar Motor
      engine = new BABYLON.Engine(canvasRef.current, true, {
        preserveDrawingBuffer: true,
        stencil: true
      });
    } catch (e) {
      console.error("Fallo al inicializar el motor de Babylon:", e);
      setWebGLSupported(false);
      return;
    }

    // Inicializar Escena
    const scene = new BABYLON.Scene(engine);
    // Fondo oscuro/negro deportivo
    scene.clearColor = new BABYLON.Color4(0.04, 0.04, 0.04, 1.0);

    // Cámara ArcRotate
    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.2,
      7,
      BABYLON.Vector3.Zero(),
      scene
    );
    // Limitar zoom para evitar que rompan el layout
    camera.attachControl(canvasRef.current, true, false);
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 9;
    camera.inputs.attached.pointers.multiTouchPanAndZoom = false;
    camera.inputs.attached.pointers.doubleTap = false;

    // Iluminación
    const hemiLight = new BABYLON.HemisphericLight(
      "hemiLight",
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    hemiLight.intensity = 0.7;

    // Luz de punto roja brillante (Efecto neón)
    const redLight = new BABYLON.PointLight(
      "redLight",
      new BABYLON.Vector3(2.5, 2, 2.5),
      scene
    );
    redLight.diffuse = new BABYLON.Color3(0.9, 0.1, 0.1);
    redLight.intensity = 1.8;

    // Luz de punto blanca brillante
    const whiteLight = new BABYLON.PointLight(
      "whiteLight",
      new BABYLON.Vector3(-2.5, -2, -2.5),
      scene
    );
    whiteLight.diffuse = new BABYLON.Color3(1, 1, 1);
    whiteLight.intensity = 1.2;

    // Pelota de Futsal Central
    const ball = BABYLON.MeshBuilder.CreateSphere(
      "futsalBall",
      { diameter: 2.3, segments: 64 },
      scene
    );
    
    // Crear Material para la pelota con textura dinámica
    const ballMaterial = new BABYLON.StandardMaterial("ballMaterial", scene);
    const dynamicTexture = new BABYLON.DynamicTexture(
      "dynamicTexture",
      { width: 512, height: 256 },
      scene,
      true
    );
    ballMaterial.diffuseTexture = dynamicTexture;
    ballMaterial.specularColor = new BABYLON.Color3(0.6, 0.6, 0.6);
    ballMaterial.specularPower = 32;
    ballMaterial.roughness = 0.2;
    ball.material = ballMaterial;

    // Dibujar el diseño del balón en la textura dinámica
    const drawBallTexture = () => {
      const ctx = dynamicTexture.getContext();
      
      // Fondo blanco del cuero
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, 512, 256);

      // Definir los centros de los parches pentagonales para cubrir la esfera
      const patches = [
        { x: 42, y: 50 }, { x: 128, y: 50 }, { x: 213, y: 50 }, { x: 298, y: 50 }, { x: 384, y: 50 }, { x: 470, y: 50 },
        { x: 0, y: 128 }, { x: 85, y: 128 }, { x: 170, y: 128 }, { x: 256, y: 128 }, { x: 341, y: 128 }, { x: 426, y: 128 }, { x: 512, y: 128 },
        { x: 42, y: 206 }, { x: 128, y: 206 }, { x: 213, y: 206 }, { x: 298, y: 206 }, { x: 384, y: 206 }, { x: 470, y: 206 }
      ];

      // Dibujar costuras/líneas entre parches para simular cuero cosido (en gris oscuro/rojo)
      ctx.strokeStyle = "#DDDDDD";
      ctx.lineWidth = 2.5;
      
      ctx.beginPath();
      patches.forEach((p) => {
        // Conectar con el siguiente horizontal
        const nextH = patches.find(other => Math.abs(other.y - p.y) < 5 && other.x > p.x && other.x - p.x < 100);
        if (nextH) {
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(nextH.x, nextH.y);
        }
        // Conectar con el siguiente vertical diagonal
        const nextV = patches.find(other => other.y > p.y && other.y - p.y < 85 && Math.abs(other.x - p.x) < 50);
        if (nextV) {
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(nextV.x, nextV.y);
        }
      });
      ctx.stroke();

      // Dibujar pentágonos negros con borde rojo
      patches.forEach((p) => {
        // Omitimos el parche central de la fila 2 para imprimir el logo de Jorge Newbery
        if (p.x === 256 && p.y === 128) {
          return;
        }
        
        ctx.fillStyle = "#111111";
        ctx.strokeStyle = "#D32F2F";
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

      // Dibujar el logo oficial / marca en la parte central blanca
      ctx.strokeStyle = "#D32F2F";
      ctx.lineWidth = 3;
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(256, 128, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Texto interno de marca del club
      ctx.fillStyle = "#111111";
      ctx.font = "bold 9px 'Montserrat', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("JORGE", 256, 120);
      ctx.fillStyle = "#D32F2F";
      ctx.font = "black 9px 'Montserrat', sans-serif";
      ctx.fillText("NEWBERY", 256, 134);

      // Marca adicional para realismo
      ctx.fillStyle = "#888888";
      ctx.font = "bold 8px 'Montserrat', sans-serif";
      ctx.fillText("FUTSAL OFICIAL", 256, 185);

      // Actualizar textura
      dynamicTexture.update();
    };

    drawBallTexture();

    // Crear esferas orbitantes (partículas/átomos del club)
    const orbiters = [];
    const colors = [
      new BABYLON.Color3(0.83, 0.11, 0.11), // Rojo Club
      new BABYLON.Color3(1, 1, 1),          // Blanco
      new BABYLON.Color3(0.2, 0.2, 0.2),    // Negro
    ];

    for (let i = 0; i < 18; i++) {
      const orb = BABYLON.MeshBuilder.CreateSphere(
        `orb_${i}`,
        { diameter: 0.12 + Math.random() * 0.15 },
        scene
      );

      const orbMat = new BABYLON.StandardMaterial(`orbMat_${i}`, scene);
      const color = colors[i % colors.length];
      orbMat.diffuseColor = color;
      orbMat.emissiveColor = color.scale(0.2);
      orbMat.specularColor = new BABYLON.Color3(0.8, 0.8, 0.8);
      orb.material = orbMat;

      // Definir parámetros de órbita
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

    // Bucle de renderizado y animación
    scene.registerBeforeRender(() => {
      const time = Date.now() * 0.001;

      // Rotación tridimensional de la pelota de futsal
      ball.rotation.y = time * 0.45;
      ball.rotation.x = time * 0.18;
      ball.rotation.z = Math.sin(time * 0.3) * 0.1;

      // Flotación arriba/abajo
      ball.position.y = Math.sin(time * 1.5) * 0.15;

      // Animación de órbitas
      orbiters.forEach((orb) => {
        orb.angle += orb.speed;
        orb.mesh.position.x = Math.cos(orb.angle) * orb.radiusX;
        orb.mesh.position.z = Math.sin(orb.angle) * orb.radiusZ;
        orb.mesh.position.y = Math.sin(time * orb.wobbleSpeed) * 0.5 + orb.heightOffset;
      });

      // Mover luces ligeramente para generar brillos cambiantes
      redLight.position.x = Math.sin(time) * 3;
      redLight.position.z = Math.cos(time) * 3;
    });

    engine.runRenderLoop(() => {
      scene.render();
    });

    // Resize Handler
    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.dispose();
    };
  }, []);

  if (!webGLSupported) {
    return (
      <div className="absolute inset-0 w-full h-full bg-jn-black">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-luminosity"
          style={{ backgroundImage: "url('/images/fans.png')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-jn-black via-jn-black/60 to-transparent z-10"></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-jn-red/10 rounded-full blur-[120px] z-0"></div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-28">
          <div className="w-28 h-32 bg-gradient-to-br from-jn-red to-jn-darkred rounded-3xl opacity-15 animate-pulse flex items-center justify-center border border-white/10 shadow-lg">
            <span className="text-white font-black text-4xl">JN</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <canvas ref={canvasRef} className="w-full h-full block outline-none" />
      {/* Controles de cámara flotantes para avisarle al usuario que es 3D */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 pointer-events-none">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles size={10} className="text-jn-red animate-spin [animation-duration:4s]" />
          Lienzo 3D Interactivo (Arrastrá para girar)
        </p>
      </div>
    </div>
  );
}
