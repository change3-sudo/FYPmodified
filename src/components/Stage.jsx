import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders';
// 如果需要額外的 GLTF 功能，可能還需要：
import "@babylonjs/core/Loading/loadingScreen";
import "@babylonjs/loaders/glTF";
import LightingControl from './Light/LightingControl'; 
import EditBar from './EditBar';
import ObjectControl from './Object/ObjectControl';
import GeometryRenderer from './Object/GeometryRenderer';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import LightSelector from './Light/LightSelector';
//import SpotlightWebGPU from './SpotlightWebGPU';
// 移除類型定義，改用 JSDoc 來提供類型提示
/**
 * @typedef {Object} SpotLightProps
 * @property {number} diameterTop
 * @property {number} diameterBottom
 * @property {number} exponent
 * @property {number} angle
 * @property {number} intensity
 * @property {BABYLON.Vector3} position
 * @property {BABYLON.Vector3} direction
 * @property {BABYLON.Color3} [diffuse]
 * @property {BABYLON.Scene} [scene]
 */
const CueMode = ({ isVisible, setSelectedLightInfo, lights,goToNextCue, goToPreviousCue, copyCue, onRecordCue, highlightedCueIndex, cues, onCommand }) => {
  const [command, setCommand] = useState('');
  const [placeholder, setPlaceholder] = useState('Enter command...');
const [selectedLightChannel, setSelectedLightChannel] = useState()
  const commandMap = {
    ' ': 'go',
    'r': 'record',
    'u': 'update',
    'c': 'copy to',
    'g': 'group',
    'q': 'cue',
    'l': 'label/note',
    'b': 'block',
    'x': 'cue only/track',
    'f': 'full',
    'o': 'out',
  };

  const handleCommandInput = (e) => {
    const input = e.target.value;
    const lastChar = input.slice(-1);
  
    // Check if the last character is a backspace
    if (e.nativeEvent.inputType === 'deleteContentBackward') {
      setCommand(input);
      return;
    }
  
    // Check if the last character is a digit
    if (/\d/.test(lastChar)) {
      setCommand(input + ' ');
      setPlaceholder('Enter command...');
      return;
    }
  
    // Check if the last character is a mapped command
    if (commandMap[lastChar]) {
      const fullTerm = commandMap[lastChar];
      const newCommand = input.slice(0, -1) + fullTerm + ' ';
      setCommand(newCommand);
      setPlaceholder(fullTerm);
    } else {
      setCommand(input);
      setPlaceholder('Enter command...');
    }
  };
   useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === ' ' && !e.ctrlKey) {
        e.preventDefault();
        goToNextCue();
      } else if (e.key === ' ' && e.ctrlKey) {
        e.preventDefault();
        goToPreviousCue();
      } else if (e.key === 'Enter') {
        const fullCommand = command.trim();
        executeCommand(fullCommand);
        setCommand('');
        setPlaceholder('Enter command...');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [command, goToNextCue, goToPreviousCue]);

  const executeCommand = (expandedCmd) => {
    const channelNumber = parseInt(expandedCmd, 10);
    
    // 检查输入是否为有效的通道号
    if (!isNaN(channelNumber)) {
        const selectedLight = lights.find(light => light.channel === channelNumber.toString());
        if (selectedLight) {
            setSelectedLightChannel(channelNumber);
            setSelectedLightInfo({
                id: selectedLight.id,
                intensity: selectedLight.intensity,
                color: selectedLight.color,
                position: selectedLight.position
            });
            console.log(`Selected light channel: ${channelNumber}`);
            console.log(selectedLight)
        } else {
            console.log(`No light found for channel: ${channelNumber}`);
        }
    } else {
        // 处理其他命令
        switch (expandedCmd) {
            case 'record':
                // 处理录制命令
                break;
            case 'copy':
                // 处理复制命令
                break;
            // 添加其他命令的处理逻辑
            default:
                console.log(`Unknown command: ${expandedCmd}`);
        }
    }
  };

  const getNextCueNumber = () => {

  };

  const extractCueNumber = (cueName) => {
    const match = cueName.match(/(\d+)/);
    return match ? parseInt(match[0], 10) : null;
  };

  // useEffect(() => {
  //   if (cues[highlightedCueIndex]) {
  //     onCommand(`go to cue ${extractCueNumber(cues[highlightedCueIndex].name)}`);
  //     console.log("now the name index is", cues[highlightedCueIndex].name);
  //   }
  // }, [highlightedCueIndex, cues, onCommand]);
  useEffect(() => {
    console.log("is this running?",isVisible)
  }, [isVisible])
  
  useEffect(() => {
    console.log("now index is", highlightedCueIndex);
  }, [highlightedCueIndex]);


  const visibilityCueMode = isVisible ? 'flex-col' : 'hidden'
  return (
    <div>
    <div className={`absolute top-0  z-40 w:1/6 left-0   h-full bg-gray-800 text-white pt-4 space-y-4 ${visibilityCueMode}`}>
    <button 
          onClick={() => onRecordCue(getNextCueNumber())}
          className="w-full p-2 bg-blue-500 rounded hover:bg-blue-600 transition-colors"
        >
          Record Cue
        </button>
        <ul className="space-y-1">
          {cues.map((cue, index) => (
            <li
              key={cue.id}
              className={`p-2 rounded ${index === highlightedCueIndex ? 'bg-gray-600' : 'bg-gray-700'}`}
            >
              <strong>Cue {extractCueNumber(cue.name)}</strong>
            </li>
          ))}
        </ul>
<div className={`fixed bottom-0 w-full flex-col space-y-2 ${visibilityCueMode}`}>
      
      <input
          type="text"
          value={command}
          onChange={handleCommandInput}
          className="w-full p-2 bg-gray-700 text-white"
          placeholder={placeholder}
      />
  </div>
</div>
    </div>


  );
};



// 创建三点打光系统
const setupThreePointLighting = (scene, model) => {
    // 1. 主光 (Key Light) - 最亮的光源，通常从前方45度角照射
    const keyLight = new BABYLON.SpotLight(
        "keyLight",
        new BABYLON.Vector3(10, 15, -10), // 从右前方照射
        new BABYLON.Vector3(-0.5, -1, 0.5), // 朝向模型
        Math.PI / 3,
        2,
        scene
    );
    keyLight.intensity = 0.8;
    keyLight.diffuse = new BABYLON.Color3(1, 0.95, 0.8); // 略带暖色调

    // 2. 补光 (Fill Light) - 较弱的光源，用于填充主光产生的阴影
    const fillLight = new BABYLON.SpotLight(
        "fillLight",
        new BABYLON.Vector3(-10, 10, -5), // 从左前方照射
        new BABYLON.Vector3(0.5, -1, 0.5),
        Math.PI / 3,
        2,
        scene
    );
    fillLight.intensity = 0.4; // 强度约为主光的一半
    fillLight.diffuse = new BABYLON.Color3(0.8, 0.85, 1); // 略带冷色调

    // 3. 背光 (Back Light) - 用于突出物体轮廓
    const backLight = new BABYLON.SpotLight(
        "backLight",
        new BABYLON.Vector3(0, 12, 10), // 从后方照射
        new BABYLON.Vector3(0, -1, -1),
        Math.PI / 4,
        2,
        scene
    );
    backLight.intensity = 0.6;
    backLight.diffuse = new BABYLON.Color3(0.9, 0.9, 1); // 中性偏冷色调

    // 为每个光源创建阴影生成器
    const shadowGenerators = [];
    [keyLight, fillLight, backLight].forEach(light => {
        const shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurScale = 2;
        shadowGenerator.setDarkness(0.2);
        shadowGenerator.bias = 0.00001;
        shadowGenerators.push(shadowGenerator);
    });

    // 为模型添加阴影
    if (model && model.meshes) {
        model.meshes.forEach(mesh => {
            mesh.receiveShadows = true;
            shadowGenerators.forEach(generator => {
                generator.addShadowCaster(mesh);
            });
        });
    }

    // 添加环境光以提供基础照明
    const ambientLight = new BABYLON.HemisphericLight(
        "ambientLight",
        new BABYLON.Vector3(0, 1, 0),
        scene
    );
    ambientLight.intensity = 0.2;
    ambientLight.groundColor = new BABYLON.Color3(0.2, 0.2, 0.25);

    // 返回光源对象以便后续调整
    return {
        keyLight,
        fillLight,
        backLight,
        ambientLight,
        shadowGenerators
    };
};

const Stage = () => {
    const [lights, setLights] = useState([]);
    const [selectedLightStack, setSelectedLightStack] = useState([]);
    const canvasRef = useRef(null);
    const [selectedLightInfo, setSelectedLightInfo] = useState(null);
    const [isChannelSubmitted, setIsChannelSubmitted] = useState(false);

    useEffect(() => {
        console.log("selected light info", selectedLightInfo)
    }, [selectedLightInfo])

    const [isButtonsVisible, setIsButtonsVisible] = useState(false);
    const [objects, setObjects] = useState([]);
    const [scene, setScene] = useState(null);
    const [isLightControlVisible, setIsLightControlVisible] = useState(false);
    const [isCueControlVisible, setIsCueControlVisible] = useState(false);
    const [enableOrbit, setEnableOrbit] = useState(true);
    const [selectedLightPositions, setSelectedLightPositions] = useState([]);
    const [lightManager, setLightManager] = useState(null);
    const [highlightedCueIndex, setHighlightedCueIndex] = useState(0);
    const [cues, setCues] = useState([]);
    const [currentChannel, setCurrentChannel] = useState(0);
    const [currentCueIndex, setCurrentCueIndex] = useState(-1);

    const extractCueNumber = (cueName) => {
        const match = cueName.match(/(\d+)/);
        return match ? parseInt(match[0], 10) : null;
    };

    const getNextCueNumber = () => {
        const cueNumbers = cues.map(cue => extractCueNumber(cue.name)).filter(num => num !== null);
        const maxCueNumber = Math.max(...cueNumbers, 0);
        return maxCueNumber + 1;
    };
    const handleRecordCue = (cueNumber) => {
 
    };
    const handleCopyCue = (sourceCueNumber, targetCueNumber) => {

    };

    // === Cue 导航函数 ===
    const goToNextCue = () => {

    };

    const goToPreviousCue = () => {
 
    };

    // === Cue 状态应用函数 ===
    const applyCueState = (cue) => {
       
    };
    const sortedCues = [...cues].sort((a, b) => {
        const numA = extractCueNumber(a.name);
        const numB = extractCueNumber(b.name);
        return numA - numB;
      });
      const onCommand = useCallback((command) => {
        console.log(`Executing command: ${command}`);
        switch (command) {
          case 'record':
            console.log('Record');
            recordCue(5);
            // Add logic for recording
            break;
          case 'u':
            console.log('Update');
            // Add logic to update something
            break;
          case 'c':
            console.log('Copy to');
            copyCue(1,2) 
            // Add logic to copy something
            break;
          case 'g':
            console.log('Group');
            // Add logic to group items
            break;
          case 'q':
            console.log('Cue');
            // Add logic to handle cue
            break;
          case 'l':
            console.log('Label/Note');
            // Add logic to handle label or note
            break;
          case 'b':
            console.log('Block');
            // Add logic to block something
            break;
          case 'x':
            console.log('Cue only/Track');
            // Add logic for cue only or track
            break;
          case 'f':
            console.log('Full');
            // Add logic to set something to full
            break;
          case 'o':
            console.log('Out');
            // Add logic to go out
            break;
          default:
            if (command.startsWith('select light')) {
              const channelNumber = command.split(' ')[2];
              console.log(`Select light channel: ${channelNumber}`);
              // Example: Select light logic
            } else if (command.startsWith('adjust intensity')) {
              const parts = command.split(' ');
              const channelNumber = parts[2];
              const intensityValue = parts[4];
              console.log(`Adjust intensity of light channel ${channelNumber} to ${intensityValue}`);
              // Example: Adjust intensity logic
            }
            break;
        }
      }, [cues, lights]);
    
    
      const copyCue = (source, target) => {
        
      };

 

    const handleObjectAdd = useCallback((geometry, color, worldSpace) => {
        const newObject = {
          id: Math.random(),
          type: geometry,
          color: color,
          position: [
            Math.random() * 10 - 5,
            Math.random() * 10 + 5,
            Math.random() * 10 - 5
          ],
          rotation: [0, 0, 0],
          scale:  [1, 1, 1]
        };
        setObjects(prevObjects => [...prevObjects, newObject]);
    
      }, []);

    useEffect(() => {
        console.log(objects);
    }, [objects]);

    useEffect(() => {
        const initEngine = async () => {
            try {
                const canvas = canvasRef.current;
                
                // 检查 WebGPU 支持
                if (!navigator.gpu) {
                    throw new Error("WebGPU not supported");
                }

                // 获取适配器和设备
                const adapter = await navigator.gpu.requestAdapter();
                const device = await adapter.requestDevice();

                // 获 WebGPU 上下文和首选格式
                const context = canvas.getContext('webgpu');
                if (!context) {
                    throw new Error("Failed to get WebGPU context");
                }
                const format = navigator.gpu.getPreferredCanvasFormat();

                // 配置 Canvas
                context.configure({
                    device,
                    format,
                    alphaMode: 'premultiplied',
                });

                // 创建 WebGPU 引擎
                const engine = new BABYLON.WebGPUEngine(canvas);
                await engine.initAsync();
                console.log("WebGPU engine initialized successfully");

                // 创建场景
                const scene = new BABYLON.Scene(engine);
                setScene(scene); // 确保更新 scene 状态
                console.log("Scene initialized:", scene); 
                
                // 初始化 LightManager
                // const manager = new LightManager(scene);
                // setLightManager(manager);

                // 创建相机
                const camera = new BABYLON.ArcRotateCamera(
                    "camera", 
                    Math.PI / 2, 
                    Math.PI / 4, 
                    80, 
                    new BABYLON.Vector3(1, 9, 15), 
                    scene
                );
                camera.attachControl(canvas, true);

                // 可选：设置相机的最小和最大距离限制
                camera.maxZ = 10000;
                camera.lowerRadiusLimit = 0.0001;  // 最小缩放距离
                camera.upperRadiusLimit = 100   ; // 最大缩放距离
                const keyLight = new BABYLON.SpotLight(
                    "keyLight",
                    new BABYLON.Vector3(10, 15, -10),
                    new BABYLON.Vector3(-0.5, -1, 0.5),
                    Math.PI / 3,
                    2,
                    scene
                );
                keyLight.intensity = 1;
                keyLight.diffuse = new BABYLON.Color3(1, 1,1);
        
                // 2. 补光 (Fill Light)
                const fillLight = new BABYLON.SpotLight(
                    "fillLight",
                    new BABYLON.Vector3(-10, 10, -5),
                    new BABYLON.Vector3(0.5, -1, 0.5),
                    Math.PI / 3,
                    2,
                    scene
                );
                fillLight.intensity = 1;
                fillLight.diffuse = new BABYLON.Color3(0.8, 0.85, 1);
        
                // 3. 背光 (Back Light)
                const backLight = new BABYLON.SpotLight(
                    "backLight",
                    new BABYLON.Vector3(0, 12, 10),
                    new BABYLON.Vector3(0, -1, -1),
                    Math.PI / 4,
                    2,
                    scene
                );
                backLight.intensity = 1;
                backLight.diffuse = new BABYLON.Color3(0.9, 0.9, 1);
        
                // 创建阴影生成器
                const shadowGenerators = [];
                [keyLight, fillLight, backLight].forEach(light => {
                    const shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
                    shadowGenerator.useBlurExponentialShadowMap = true;
                    shadowGenerator.blurScale = 2;
                    shadowGenerator.setDarkness(0.2);
                    shadowGenerator.bias = 0.00001;
                    shadowGenerators.push(shadowGenerator);
                });
                // 创建光源
                const light = new BABYLON.HemisphericLight(
                    "light", 
                    new BABYLON.Vector3(0, 0, 0), 
                    scene
                );
                light.intensity = 0.5;
                // 创建聚光灯
                const spotLight = new BABYLON.SpotLight(
                    "spotLight",
                    new BABYLON.Vector3(0, 4.54, 0),
                    new BABYLON.Vector3(0, -1, 0),
                    Math.PI / 4,
                    2,
                    scene
                );
                spotLight.intensity = 1;
                spotLight.angle = Math.PI / 2; // 增加角度以使边缘更和
                spotLight.exponent = 7; // 增加衰减值以使边缘更柔和                // 可选：设置聚光灯的阴影
                spotLight.shadowMinZ = 1; // 阴影的最小距离
                spotLight.shadowMaxZ = 100; // 阴影的最大距离
                spotLight.shadowDarkness = 0.5; // 阴影的深度
                spotLight.shadowEnabled = true;
                
                // 可选：启用阴影生成
                const gradientTexture = new BABYLON.DynamicTexture("gradient", { width: 256, height: 256 }, scene, false);
                const ctx = gradientTexture.getContext();
                const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
                gradient.addColorStop(0, "rgba(255, 255, 255, 1)"); // 中心颜色
                gradient.addColorStop(1, "rgba(255, 255, 255, 0)"); // 边缘颜色
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 256, 256);
                gradientTexture.update();
// 创建并配置阴影生成器
const shadowGenerator = new BABYLON.ShadowGenerator(2048, spotLight); // 增加分辨率
shadowGenerator.useExponentialShadowMap = true;
shadowGenerator.useBlurExponentialShadowMap = true;
shadowGenerator.blurScale = 2;
shadowGenerator.setDarkness(0.3);
shadowGenerator.bias = 0.00001;
shadowGenerator.normalBias = 0.01;
shadowGenerator.useKernelBlur = true;
shadowGenerator.blurKernel = 64;
const volumetricLight = new BABYLON.VolumetricLightScatteringPostProcess(
    'volumetric',
    1.0,
    camera,
    null,
    100,
    BABYLON.Texture.BILINEAR_SAMPLINGMODE,
    engine,
    false
);

// 调整体积光参数
volumetricLight.exposure = 20;
volumetricLight.decay = 0.95;
volumetricLight.weight = 0.5;
volumetricLight.density = 0.5;
                const fresnelMaterial = new BABYLON.ShaderMaterial("fresnelMaterial", scene, {
                    vertex: `
                        precision highp float;
                        attribute vec3 position;
                        attribute vec3 normal;
                        varying vec3 vNormal;
                        varying vec3 vPosition;
    
                        void main() {
                            vNormal = normalize(normal);
                            vPosition = position;
                            gl_Position = vec4(position, 1.0);
                        }
                    `,
                    fragment: `
                        precision highp float;
                        varying vec3 vNormal;
                        varying vec3 vPosition;
    
                        void main() {
                            vec3 viewDir = normalize(-vPosition);
                            float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);
                            float edgeSoftness = smoothstep(0.01, 0.1, fresnel); // 调整边缘柔和度
                            gl_FragColor = vec4(edgeSoftness, edgeSoftness, edgeSoftness, 1.0); // 灰度值
                        }
                    `
                });
                // 设置聚光灯的颜色和强度

 // 使用泊松采样
                const fixtureResult = await BABYLON.SceneLoader.ImportMeshAsync(
                    "",
                    "/model/", // 保路径正确
                    "fixture.gltf", // 替换为你的灯具模型文件名
                    scene
                );

                if (fixtureResult.meshes.length > 0) {
                    const fixtureMesh = fixtureResult.meshes[0];
                    fixtureMesh.position.copyFrom(spotLight.position);
                    // 创建发光材质
                    const emissiveMaterial = new BABYLON.StandardMaterial("emissiveMaterial", scene);
                    emissiveMaterial.emissiveColor = new BABYLON.Color3(1, 1, 0);
                    emissiveMaterial.emissiveIntensity = 1;
                    emissiveMaterial.alpha = 1;
                    
                    // 添加光晕效果
                    const glowLayer = new BABYLON.GlowLayer("glow", scene);
                    glowLayer.intensity = 1;
                    glowLayer.addIncludedOnlyMesh(fixtureMesh);
                    
                    fixtureMesh.material = emissiveMaterial;
                    fixtureMesh.parent = spotLight;
                    fixtureMesh.position.y -= 5;
                
                    // 创建光锥可视化效果
                    const coneLength = 1;
                    const coneAngle = spotLight.angle;
                    const cone = BABYLON.MeshBuilder.CreateCylinder("cone", {
                        height: coneLength,
                        diameterTop: 0,
                        diameterBottom: Math.tan(coneAngle) * coneLength * 2,
                    }, scene);
                    
                    // 创建半透明材质用于光锥
                    const coneMaterial = new BABYLON.StandardMaterial("coneMaterial", scene);
                    coneMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
                    coneMaterial.alpha = 0.1;
                    coneMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
                    coneMaterial.alphaMode = BABYLON.Engine.ALPHA_ADD;
                    cone.material = coneMaterial;
                    
                    // 将光锥放置在正确的位置
                    cone.parent = spotLight;
                    cone.rotation.x = Math.PI;
                    cone.position.y -= coneLength / 2;
                }

                // 创建多个模型
                const modelCount = 1;
                const arr = Array.from({ length: modelCount }, (_, i) => i);

                for (const index of arr) {
                    try {
                        const result = await BABYLON.SceneLoader.ImportMeshAsync(
                            "",
                            "/model/",
                            "untitled.gltf",
                            scene
                        );

                        if (result.meshes.length > 0) {
                            // 创建光圈效果
                            const lightCircle = BABYLON.MeshBuilder.CreateDisc("lightCircle", {
                                radius: 2,
                                tessellation: 64
                            }, scene);

                            // 设置位置
                            lightCircle.rotation.x = Math.PI / 2;
                            lightCircle.position = new BABYLON.Vector3(
                                spotLight.position.x,
                                0.01,
                                spotLight.position.z
                            );

                            // 为 WebGPU 创建 PBR 材质
                            const lightCircleMaterial = new BABYLON.PBRMaterial("lightCircleMaterial", scene);
                            
                            // 创建渐变纹理
                            const gradientTexture = new BABYLON.DynamicTexture("gradient", {
                                width: 256,
                                height: 256
                            }, scene);
                            
                            const ctx = gradientTexture.getContext();
                            const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
                            gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
                            gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.3)");
                            gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
                            ctx.fillStyle = gradient;
                            ctx.fillRect(0, 0, 256, 256);
                            gradientTexture.update();

                            // 设置 PBR 材质属性
                            lightCircleMaterial.albedoTexture = gradientTexture;
                            lightCircleMaterial.emissiveTexture = gradientTexture;
                            lightCircleMaterial.opacityTexture = gradientTexture;
                            lightCircleMaterial.useAlphaFromAlbedoTexture = true;
                            lightCircleMaterial.emissiveColor = new BABYLON.Color3(1, 1, 0.8);
                            lightCircleMaterial.emissiveIntensity = 2;
                            lightCircleMaterial.alpha = 0.5;
                            lightCircleMaterial.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHABLEND;
                            lightCircleMaterial.metallic = 0;
                            lightCircleMaterial.roughness = 1;
                            lightCircleMaterial.unlit = true;

                            // 应用材质
                            lightCircle.material = lightCircleMaterial;

                            // 创建外圈
                            const outerLightCircle = BABYLON.MeshBuilder.CreateDisc("outerLightCircle", {
                                radius: 2,
                                tessellation: 64
                            }, scene);
                            
                            outerLightCircle.rotation.x = Math.PI / 2;
                            outerLightCircle.position = new BABYLON.Vector3(
                                spotLight.position.x,
                                0.005,
                                spotLight.position.z
                            );

                            // 克隆材质并修改属性
                            const outerMaterial = lightCircleMaterial.clone("outerLightCircleMaterial");
                            outerMaterial.alpha = 0.2;
                            outerMaterial.emissiveIntensity = 1;
                            outerLightCircle.material = outerMaterial;

                            // 添加缩放动画
                            const createScaleAnimation = (mesh, baseScale = 1) => {
                                const keys = [];
                                const frameRate = 30;
                                
                                keys.push({
                                    frame: 0,
                                    value: new BABYLON.Vector3(baseScale, baseScale, baseScale)
                                });
                                keys.push({
                                    frame: frameRate,
                                    value: new BABYLON.Vector3(baseScale * 1.1, baseScale * 1.1, baseScale * 1.1)
                                });
                                keys.push({
                                    frame: frameRate * 2,
                                    value: new BABYLON.Vector3(baseScale, baseScale, baseScale)
                                });

                                const animation = new BABYLON.Animation(
                                    "scaleAnimation",
                                    "scaling",
                                    frameRate,
                                    BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
                                    BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
                                );

                                animation.setKeys(keys);
                                mesh.animations = [animation];
                                scene.beginAnimation(mesh, 0, frameRate * 2, true);
                            };

                            // 应用动画到两个光圈
                            createScaleAnimation(lightCircle);
                            createScaleAnimation(outerLightCircle);

                            // 确保正确的渲染顺序
                            lightCircle.renderingGroupId = 1;
                            outerLightCircle.renderingGroupId = 1;
                        }
                    } catch (error) {
                        console.error(`模型 ${index} 加载失败:`, error);
                    }
                }

                // 调整相机以查看所有模型
                camera.radius = modelCount * 4; // 根据模型数量调整相机距离
                camera.beta = Math.PI / 3; // 调整相机角度

                // 创建环境光
                const ambientLight = new BABYLON.HemisphericLight(
                    "ambientLight", // 光源名称
                    new BABYLON.Vector3(0, 1, 0), // 光源方向（Y轴向上）
                    scene // 关联的场景
                );
                var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 1000, height: 1000}, scene);
                ground.position.y = -1; // 根据需要调整高度
ground.position.x = 0; // 根据需要调整 X 位置
ground.position.z = 0;
                // 设置环境光的颜色和强度
                ambientLight.diffuse = new BABYLON.Color3(1, 1, 1); // 漫反射光颜色（白色）
                ambientLight.specular = new BABYLON.Color3(1, 1, 1); // 高光颜色（白色）
                ambientLight.intensity =0.5; // 光强度（0 到 1 之间的）
                const lightPosition = new BABYLON.Vector3(0,15, 0);
                // Create a reference for the spotlight
                // let volumetricSpotlight;

                // // Create Volumetric Spotlight
                // volumetricSpotlight = new SpotLightVolumetric({
                //     diameterTop: 0.45,
                //     diameterBottom: 1,
                //     exponent:15,
                //     angle: Math.PI /2,
                //     intensity: 0.5,
                //     position: lightPosition,
                //     direction: new BABYLON.Vector3(0, -1, 0),
                //     diffuse: BABYLON.Color3.Yellow(),
                //     scene: scene
                // });
                // console.log(volumetricSpotlight);

                // Render Loop
                engine.runRenderLoop(() => {
                    // volumetricSpotlight.update(); // Update the spotlight
                    scene.render();
                });

                // 处理窗调整
                const handleResize = () => {
                    engine.resize();
                };
                window.addEventListener('resize', handleResize);

                // 返回清理函数
                return () => {
                    window.removeEventListener('resize', handleResize);
                    scene.dispose();
                    engine.dispose();
                    device.destroy();
                };
            } catch (error) {
                console.error("Fatal error during initialization:", error);
                console.log("Falling back to WebGL");
                
                // 回退到 WebGL
                try {
                    const canvas = canvasRef.current;
                    const engine = new BABYLON.Engine(canvas, true);
                    const scene = new BABYLON.Scene(engine);
                    setScene(scene);
                    
                    // WebGL 场景设置
                    const camera = new BABYLON.ArcRotateCamera(
                        "camera", 
                        Math.PI / 2, 
                        Math.PI / 4, 
                        5, 
                        new BABYLON.Vector3(0, 0, 0), 
                        scene
                    );
                    camera.attachControl(canvas, true);

                    const light = new BABYLON.HemisphericLight(
                        "light", 
                        new BABYLON.Vector3(0, 1, 0), 
                        scene
                    );
                    try {
                        console.log("开始加载模型...");
                        console.log("模型路径:", "/model/stage2.obj");
                        const result = await BABYLON.SceneLoader.ImportMeshAsync(
                            "",
                            "/model/",
                            "stage2.obj",
                            scene
                        );
                        console.log("模型加载成功", result);
                        
                        // 可选：设置相机目标
                        
                        
                    } catch (error) {
                        console.error("模型加载失败:", error);
                        console.error("错误详情:", error.message);
                    }

                    const box = BABYLON.MeshBuilder.CreateBox("box", { size: 2 }, scene);
                    box.position.y = 1;

                    engine.runRenderLoop(() => {
                        scene.render();
                    });

                    return () => {
                        scene.dispose();
                        engine.dispose();
                    };
                } catch (fallbackError) {
                    console.error("WebGL fallback also failed:", fallbackError);
                    return () => {};
                }
            }
        };

        // 初始化引擎
        const cleanup = initEngine();

        // 组件卸载时清理
        return () => {
            cleanup.then(cleanupFn => cleanupFn && cleanupFn());
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!scene || !canvas) return;

        const handleClick = (event) => {
            const pickResult = scene.pick(scene.pointerX, scene.pointerY);
            if (pickResult.hit) {
                const hitObject = pickResult.pickedMesh;
                if (hitObject && hitObject.parent && Array.isArray(hitObject.parent.children)) {
                    const lightGroup = hitObject.parent;
                    if (lightGroup.children.some(child => child.isSpotLight)) {
                        const spotLight = lightGroup.children.find(child => child.isSpotLight);
                        const hitObjectId = hitObject.metadata.id;
                        const actualIntensity = spotLight.intensity;
                        const displayIntensity = actualIntensity / 31.8;

                        setSelectedLightStack(prevStack => {
                            const stack = Array.isArray(prevStack) ? prevStack : [];
                            const index = stack.findIndex(entry => entry.id === hitObjectId);

                            if (index !== -1) {
                                console.log('Light deselected:', hitObjectId);
                                const newStack = stack.filter(entry => entry.id !== hitObjectId);
                                setSelectedLightPositions(prevPositions =>
                                    prevPositions.filter(entry => entry.id !== hitObjectId)
                                );
                                return newStack;
                            } else {
                                const newEntry = { id: hitObjectId, position: lightGroup.position.asArray() };
                                const newStack = [...stack, newEntry];

                                setSelectedLightPositions(prevPositions => {
                                    const positionExists = prevPositions.some(entry => entry.id === hitObjectId);
                                    if (!positionExists) {
                                        return [...prevPositions, newEntry];
                                    }
                                    return prevPositions;
                                });

                                return newStack;
                            }
                        });
                    }
                } else {
                    console.log('Clicked outside of lights');
                }
            }
        };

        canvas.addEventListener('click', handleClick);
        return () => {
            canvas.removeEventListener('click', handleClick);
        };
    }, [scene, setSelectedLightStack]);

    const addObject = (object) => {
        setObjects(prevObjects => [...prevObjects, object]);
    };
    useEffect(() => {
        // 监听灯光数据的变化
        console.log('Current lights:', lights);
    }, [lights]);
    useEffect(() => {
        console.log("selectedLightStack", selectedLightStack);
    }, [selectedLightStack]);
    
    const onLightAdd = async (id, intensity, color, position) => {
        // 创建一个中心点来统一所有元素的位置
        const centerPosition = new BABYLON.Vector3(position.x, position.y, position.z);
        
        // 创建聚光灯
        const spotLight = new BABYLON.SpotLight(
            id, 
            centerPosition.clone(), // 使用中心点的克隆
            new BABYLON.Vector3(0, -1, 0), 
            Math.PI / 8, 
            1, 
            scene
        );
        
        // 设置光源属性
        spotLight.diffuse = BABYLON.Color3.FromHexString(color);
        spotLight.intensity = intensity;
        spotLight.angle = Math.PI / 3;
        spotLight.exponent = 20;
        spotLight.range = 20;

        // 创建阴影生成器
        const shadowGenerator = new BABYLON.ShadowGenerator(2048, spotLight);
        shadowGenerator.useExponentialShadowMap = true;
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurScale = 2;
        shadowGenerator.setDarkness(0.2);
        shadowGenerator.bias = 0.00001;
        shadowGenerator.usePercentageCloserFiltering = true; 

        // 计算光照射到地面的位置
        const groundY = 0.01; // 地面的Y坐标
        const lightDirection = new BABYLON.Vector3(0, -1, 0);
        const distance = centerPosition.y - groundY;
        const groundPosition = new BABYLON.Vector3(
            centerPosition.x + lightDirection.x * distance,
            groundY,
            centerPosition.z + lightDirection.z * distance
        );

        try {
            // 加载灯具模型
            const fixtureResult = await BABYLON.SceneLoader.ImportMeshAsync(
                "", 
                "/model/", 
                "fixture.gltf", 
                scene
            );
            
            if (fixtureResult.meshes.length > 0) {
                const fixtureMesh = fixtureResult.meshes[0];
                console.log("fixtureMesh", fixtureResult.meshes[1]);
                fixtureResult.meshes.forEach(mesh => {
                    console.log(`Loaded mesh: ${mesh.id}`); // 打印所有子模型的名称
                });
                const selectionBox = BABYLON.MeshBuilder.CreateBox("selectionBox", { size: 2 }, scene);
                selectionBox.parent = fixtureMesh;
                selectionBox.position = new BABYLON.Vector3(0, 0, 0); // Adjust position as needed
            
                // // Make the box invisible
                const invisibleMaterial = new BABYLON.StandardMaterial("invisibleMaterial", scene);
                invisibleMaterial.alpha = 0; // Set alpha to 0 to make it invisible
                selectionBox.material = invisibleMaterial;
                selectionBox.isPickable = false;
                fixtureMesh.isPickable = true; // Optionally make the fixture itself 
                // 创建一个变换节点作为父节点
                const lightGroup = new BABYLON.TransformNode("lightGroup", scene);
                lightGroup.position = centerPosition.clone();
                console.log(`Loaded fixture mesh: ${fixtureMesh.id}`);

                // 设置灯具位置
                fixtureMesh.parent = lightGroup;

                // 创建发光材质
                const emissiveMaterial = new BABYLON.PBRMaterial("emissiveMaterial", scene);
                emissiveMaterial.emissiveColor = BABYLON.Color3.FromHexString("#ffffff");
                emissiveMaterial.emissiveIntensity = 200;
                emissiveMaterial.alpha = 1;
                fixtureMesh.material = emissiveMaterial;

                // 创建光圈
                const lightCircle = BABYLON.MeshBuilder.CreateDisc("lightCircle", {
                    radius: 2,
                    tessellation: 64
                }, scene);

                // 设置光圈位置
                lightCircle.rotation.x = Math.PI / 2;
                lightCircle.position = groundPosition;

                // 创建光圈材质
                const lightCircleMaterial = new BABYLON.PBRMaterial("lightCircleMaterial", scene);
                
                // 创建渐变纹理
                const gradientTexture = new BABYLON.DynamicTexture("gradient", {
                    width: 256,
                    height: 256
                }, scene);
                
                const ctx = gradientTexture.getContext();
                const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
                gradient.addColorStop(0, `rgba(${hexToRgb(color).r}, ${hexToRgb(color).g}, ${hexToRgb(color).b}, 0.8)`);
                gradient.addColorStop(0.5, `rgba(${hexToRgb(color).r}, ${hexToRgb(color).g}, ${hexToRgb(color).b}, 0.3)`);
                gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 256, 256);
                gradientTexture.update();

                // 设置光圈材质
                lightCircleMaterial.albedoTexture = gradientTexture;
                lightCircleMaterial.emissiveTexture = gradientTexture;
                lightCircleMaterial.opacityTexture = gradientTexture;
                lightCircleMaterial.useAlphaFromAlbedoTexture = true;
                lightCircleMaterial.emissiveColor = BABYLON.Color3.FromHexString(color);
                lightCircleMaterial.emissiveIntensity = 10;
                lightCircleMaterial.alpha = 1;
                lightCircleMaterial.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHABLEND;
                lightCircleMaterial.unlit = true;
                lightCircle.material = lightCircleMaterial;

                // 添加光圈动画
                const animation = new BABYLON.Animation(
                    "scaleAnimation",
                    "scaling",
                    30,
                    BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
                    BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
                );

                const keys = [];
                keys.push({
                    frame: 0,
                    value: new BABYLON.Vector3(1, 1, 1)
                });
                keys.push({
                    frame: 30,
                    value: new BABYLON.Vector3(1.1, 1.1, 1.1)
                });
                keys.push({
                    frame: 60,
                    value: new BABYLON.Vector3(1, 1, 1)
                });

                animation.setKeys(keys);
                lightCircle.animations = [animation];
                scene.beginAnimation(lightCircle, 0, 60, true);
                let beamHeight = 0;
                let currentY = fixtureMesh.position.y;
                while (currentY > 0) {
                    beamHeight += 1;
                    console.log(currentY); // 打印 currentY 而不是 fixtureMesh.position.y
                    currentY -= 1;
                }
                // 设置渲染顺序
                lightCircle.renderingGroupId = 1;
                // 创建光束
                const beam = BABYLON.MeshBuilder.CreateCylinder("beam", {
                    height: 8, // 光束的高度
                    diameterTop: 0.1, // 顶部直径
                    diameterBottom: 6, // 底部直径
                    tessellation: 64
                }, scene);

                // 设置光束材质
                const beamMaterial = new BABYLON.StandardMaterial("beamMaterial", scene);
                beamMaterial.diffuseColor = BABYLON.Color3.FromHexString(color);
                beamMaterial.alpha = 0.5; // 半透明效果
                beam.material = beamMaterial;
                beam.parent = lightGroup;
                beam.angle = Math.PI / 8;
                // 设置光束位置和方向
                // 根据需要调整光束位置
                beam.position.y =  -8 / 2;
                // const clippingPlane = new BABYLON.Plane(0, 1, 0, 0); // 定义一个平面，y = 0
                // scene.clipPlane = clippingPlane; // 将裁剪平面应用到场景

                // 将光束添加到光组中
                // 将所有相关对象存储在一个组中
                const lightComponents = {
                    group: lightGroup,
                    spotlight: spotLight,
                    fixture: fixtureMesh,
                    lightCircle: lightCircle,
                    shadowGenerator: shadowGenerator
                };

                setLights(prevLights => {
                    const newLight = { 
                      id, 
                      intensity, 
                      color, 
                      position: centerPosition,
                      components: lightComponents,
                      channel: currentChannel
                    };
                    setSelectedLightInfo(newLight); // 使新添加的灯具信息更新 selectedLightInfo
                    return [...prevLights, newLight];
                  });
            }
        } catch (error) {
            console.error("灯具模型加载失败:", error);
        }
    };
    const onUpdateLight = useCallback((id, { type, value }) => {
        setLights(prevLights => {
          if (type === 'remove') {
            // Remove the light with the specified ID
            return prevLights.filter(light => light.id !== id);
          }
          // Update the light with the specified ID
          return prevLights.map(light =>
            light.id === id ? { ...light, [type]: value } : light
          );
        });
        if (type === 'channel') {
          setCurrentChannel(value); // Update the current channel state
          setIsChannelSubmitted(true);
        }
        if (type === 'remove') {
        }
      }, []);
    useEffect(() => {
        console.log("selectedLight", lights);
    }, [lights]);   
    // 辅助函数：十六进制转RGB
    const parseColor = (color) => {
        const match = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : [0, 0, 0];
      };
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    // 定义处理函数
    const onSelectLight = (lightId) => {
        const selectedLight = lights.find(light => light.id === lightId);
        if (selectedLight) {
            console.log(`Selected light: ${selectedLight.id}`);
            // 在这里可以添加其他逻辑，例如高亮显示选中的灯光
        } else {
            console.log(`Light with ID ${lightId} not found.`);
        }
    };
    const toggleButtonsVisibility = useCallback(() => {
        setIsButtonsVisible(prev => !prev);
        setIsCueControlVisible(false);
        setIsLightControlVisible(false);
        console.log("toggleButtonsVisibility");
    }, []);

    const toggleLightControl = useCallback(() => {
        setIsLightControlVisible(prev => !prev);
        setIsButtonsVisible(false);
        setIsCueControlVisible(false);
      }, []);
      const toggleCueControl = useCallback(() => {
        setIsCueControlVisible(prev => !prev);
        setIsButtonsVisible(false);
        setIsLightControlVisible(false);
      }, []);

    const onFileImport = () => {
        console.log("File import triggered");
        // 在这里实现你的逻辑
    };
    const handleCuesUpdate = useCallback((updatedCues) => {
        setCues(updatedCues);
      }, []);

      
      const recordCue = useCallback((cueNumber) => {
        const currentLightsState = lights.map(light => ({
          id: light.id,
          position: light.position,
          intensity: light.intensity,
          color: light.color,
          focusPoint: light.focusPoint,
        }));
      
        // Use the provided cue number if available, otherwise default to auto-generated
        const cueName = `Cue ${cueNumber}`;
      
        const newCue = {
          id: 2,
          name: cueName,
          lightState: currentLightsState,
        };
      
        setCues(prevCues => {
          const updatedCues = [...prevCues, newCue];
          console.log('Updated cues:', updatedCues); // Log inside the callback
          return updatedCues;
        });
      
        console.log('Cue recorded:', newCue);
      }, [lights, cues]);

 

    // 示例：在某个事件中检查是否有选中的灯具
    const checkSelectedFixture = () => {
        if (lightManager && lightManager.isFixtureSelected()) {
            console.log("A lighting fixture is selected.");
        } else {
            console.log("No lighting fixture is selected.");
        }
    };

    const fadeToCue = (targetCueIndex, duration = 3000) => {
        const targetCue = cues[targetCueIndex];
        if (!targetCue) return; // Ensure the target cue exists
      
        const { lightState: targetLightState } = targetCue;
        const startTime = performance.now();
      
        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1); // Calculate animation progress
      
          targetLightState.forEach(targetLight => {
            const currentLight = lights.find(light => light.id === targetLight.id);
            if (!currentLight) return;
      
            const interpolate = (start, end) => start + (end - start) * progress;
      
            const newPosition = [
              interpolate(currentLight.position[0], targetLight.position[0]),
              interpolate(currentLight.position[1], targetLight.position[1]),
              interpolate(currentLight.position[2], targetLight.position[2])
            ];
      
            const newIntensity = interpolate(currentLight.intensity, targetLight.intensity);
            // const newColor = interpolateColor(currentLight.color, targetLight.color, progress);
      
            // Update light properties
            onUpdateLight(targetLight.id, { type: 'position', value: newPosition });
            onUpdateLight(targetLight.id, { type: 'intensity', value: newIntensity });
            // onUpdateLight(targetLight.id, { type: 'color', value: newColor });
          });
      
          if (progress < 1) {
            requestAnimationFrame(animate); // Continue animation if not complete
          } else {
            setCurrentCueIndex(targetCueIndex); // Update current cue index when animation completes
          }
        };
      
        requestAnimationFrame(animate); // Start animation
      };
      // Helper function to interpolate colors
      const interpolateColor = (startColor, endColor, progress) => {
        const startRGB = parseColor(startColor);
        const endRGB = parseColor(endColor);
      
        const interpolate = (start, end) => Math.round(start + (end - start) * progress);
      
        return `rgb(${interpolate(startRGB[0], endRGB[0])}, ${interpolate(startRGB[1], endRGB[1])}, ${interpolate(startRGB[2], endRGB[2])})`;
      };
    // Cue 相关的处理函数





    // 辅助函数应用 Cue 的状态到灯光


    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
            <canvas 
                ref={canvasRef} 
                style={{ 
                    width: '100%', 
                    height: '100%',
                    touchAction: 'none',
                    zIndex: 1
                }} 
            />
            <EditBar 
                toggleButtonsVisibility={toggleButtonsVisibility}
                toggleLightControl={toggleLightControl}
                toggleCueControl={toggleCueControl}
                onFileImport={onFileImport}
            />
            <ObjectControl 
                addObject={handleObjectAdd}
                isVisible={isButtonsVisible}
                selectedObject={null} // 传递适当的对象
                updateObject={() => {}} // 传递适当的函数
            />
      <LightingControl 
        isVisible={isLightControlVisible} 
        onLightAdd={onLightAdd}
        selectedLightStack={selectedLightStack}
        setSelectedLightStack={setSelectedLightStack}
        onUpdateLight={onUpdateLight}
        selectedLightInfo={selectedLightInfo} // 传递 selectedLightInfo
      />
      <CueMode 
        isVisible={isCueControlVisible}
        goToNextCue={goToNextCue}
        goToPreviousCue={goToPreviousCue}
        copyCue={handleCopyCue}
        onRecordCue = {recordCue}
        highlightedCueIndex={highlightedCueIndex}
        cues={cues}
        onCommand={onCommand}
        setSelectedLightInfo={setSelectedLightInfo}
        lights={lights}
      />

            {objects.map(obj => (
                <GeometryRenderer
                    key={obj.id}
                    object={obj}
                    scene={scene}
                />
            ))}
  
        </div>
    );
};

export default Stage; 