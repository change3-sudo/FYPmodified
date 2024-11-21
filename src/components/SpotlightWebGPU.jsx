import React, { useEffect, useRef } from 'react';
import * as BABYLON from '@babylonjs/core';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';

const SpotlightWebGPU = React.forwardRef(({ 
  angle = Math.PI / 4, 
  penumbra = 0.1, 
  distance = 500, 
  color = 'white', 
  intensity = 1, 
  position = new Vector3(0, 0, 0), 
  targetPosition = new Vector3(0, 0, 0)}, ref) => {
  
  const spotlightRef = useRef();
  const spotlightHelperRef = useRef();
  const sceneRef = useRef();

  useEffect(() => {
    const canvas = document.getElementById('renderCanvas'); // 确保有一个canvas元素
    const engine = new BABYLON.WebGPUEngine(canvas);
    sceneRef.current = new BABYLON.Scene(engine);

    // 创建聚光灯
    const spotlight = new BABYLON.SpotLight("spotLight", position, new Vector3(0, -1, 0), angle, penumbra, sceneRef.current);
    spotlight.diffuse = new BABYLON.Color3.FromHexString(color);
    spotlight.intensity = intensity;
    spotlight.position = position;
    spotlight.target = targetPosition;

    // 创建聚光灯助手
    spotlightHelperRef.current = new BABYLON.SpotLightHelper(spotlight);
    sceneRef.current.add(spotlightHelperRef.current);

    // 渲染循环
    engine.runRenderLoop(() => {
      sceneRef.current.render();
    });

    // 清理函数
    return () => {
      sceneRef.current.remove(spotlightHelperRef.current);
      spotlight.dispose();
      engine.dispose();
    };
  }, [position, angle, penumbra, color, intensity, targetPosition]);

  useEffect(() => {
    if (spotlightRef.current) {
      spotlightRef.current.position = position;
      spotlightRef.current.target = targetPosition;
    }
  }, [position, targetPosition]);

  return (
    <mesh ref={spotlightRef} position={position}>
      <coneGeometry args={[distance * Math.tan(angle / 2), distance, 32]} />
      <meshStandardMaterial color={color} transparent opacity={0.5} />
    </mesh>
  );
});

export default SpotlightWebGPU;