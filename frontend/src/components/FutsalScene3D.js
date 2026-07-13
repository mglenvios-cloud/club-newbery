"use client";
import React, { useRef } from 'react';
import { Engine, Scene, useBeforeRender } from 'react-babylonjs';
import { Vector3, Color3 } from '@babylonjs/core/Maths/math';
import '@babylonjs/core/Meshes/meshBuilder';

// Componente para la pelota animada
const RotatingBall = () => {
  const sphereRef = useRef(null);

  // Animación: rotar la esfera en cada frame
  useBeforeRender((scene) => {
    if (sphereRef.current) {
      const deltaTimeInMillis = scene.getEngine().getDeltaTime();
      const rpm = 5;
      sphereRef.current.rotation.y += ((rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000));
      sphereRef.current.rotation.x += ((rpm / 120) * Math.PI * 2 * (deltaTimeInMillis / 1000));
    }
  });

  return (
    <sphere name="futsal-ball" ref={sphereRef} diameter={4} segments={64}>
      <standardMaterial 
        name="ball-mat" 
        diffuseColor={Color3.FromHexString("#D32F2F")} 
        specularColor={Color3.White()}
        specularPower={64}
        emissiveColor={Color3.FromHexString("#220000")}
        roughness={0.2}
      />
    </sphere>
  );
};

export default function FutsalScene3D() {
  return (
    <div className="absolute inset-0 w-full h-full -z-10 pointer-events-none">
      <Engine antialias adaptToDeviceRatio canvasId="babylon-canvas" className="w-full h-full outline-none">
        <Scene clearColor={new Color3(0.05, 0.05, 0.05)}>
          <arcRotateCamera
            name="camera1"
            target={Vector3.Zero()}
            alpha={Math.PI / 2}
            beta={Math.PI / 3}
            radius={10}
            wheelPrecision={50}
          />
          <hemisphericLight name="light1" intensity={0.7} direction={Vector3.Up()} />
          <pointLight name="light2" intensity={0.8} position={new Vector3(5, 5, -5)} diffuse={Color3.White()} />
          <pointLight name="light3" intensity={0.5} position={new Vector3(-5, -5, 5)} diffuse={Color3.FromHexString("#D32F2F")} />
          
          <RotatingBall />
          
          {/* Pequeñas esferas flotantes de fondo */}
          {[...Array(15)].map((_, i) => (
            <sphere 
              key={i} 
              name={`particle-${i}`} 
              diameter={0.2} 
              position={new Vector3(
                (Math.random() - 0.5) * 20, 
                (Math.random() - 0.5) * 20, 
                (Math.random() - 0.5) * 20
              )}
            >
               <standardMaterial 
                name={`particle-mat-${i}`} 
                emissiveColor={Math.random() > 0.5 ? Color3.White() : Color3.FromHexString("#D32F2F")} 
               />
            </sphere>
          ))}
        </Scene>
      </Engine>
    </div>
  );
}
