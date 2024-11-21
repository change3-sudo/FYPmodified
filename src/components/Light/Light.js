import * as BABYLON from 'babylonjs';

class Light {
    constructor(scene, id, intensity, color, position) {
        this.scene = scene;
        this.id = id;
        this.intensity = intensity;
        this.color = color;
        this.position = position;

        this.lightGroup = null;
        this.spotLight = null;
        this.fixtureMesh = null;
        this.volumetricBeam = null;
        this.shadowGenerator = null;

        this.createLight();
    }

    createLight() {
        const centerPosition = new BABYLON.Vector3(this.position.x, this.position.y, this.position.z);

        // 创建聚光灯
        this.spotLight = new BABYLON.SpotLight(
            this.id,
            centerPosition.clone(),
            new BABYLON.Vector3(0, -1, 0),
            Math.PI / 8,
            1,
            this.scene
        );

        // 设置光源属性
        this.spotLight.diffuse = BABYLON.Color3.FromHexString("#ffffff");
        this.spotLight.intensity = this.intensity;
        this.spotLight.angle = Math.PI / 3;
        this.spotLight.exponent = 20;
        this.spotLight.range = 20;

        // 创建阴影生成器
        this.shadowGenerator = new BABYLON.ShadowGenerator(2048, this.spotLight);
        this.shadowGenerator.useExponentialShadowMap = true;
        this.shadowGenerator.useBlurExponentialShadowMap = true;
        this.shadowGenerator.blurScale = 2;
        this.shadowGenerator.setDarkness(0.2);
        this.shadowGenerator.bias = 0.00001;
        this.shadowGenerator.usePercentageCloserFiltering = true;

        // 创建变换节点作为父节点
        this.lightGroup = new BABYLON.TransformNode("lightGroup", this.scene);
        this.lightGroup.position = centerPosition.clone();

        // 加载灯具模型
        this.loadFixture();
    }

    async loadFixture() {
        try {
            const fixtureResult = await BABYLON.SceneLoader.ImportMeshAsync(
                "",
                "/model/",
                "fixture.gltf",
                this.scene
            );

            if (fixtureResult.meshes.length > 0) {
                this.fixtureMesh = fixtureResult.meshes[0];
                this.fixtureMesh.parent = this.lightGroup;

                // 创建发光材质
                const emissiveMaterial = new BABYLON.PBRMaterial("emissiveMaterial", this.scene);
                emissiveMaterial.emissiveColor = BABYLON.Color3.FromHexString("#ffffff");
                emissiveMaterial.emissiveIntensity = 200;
                emissiveMaterial.alpha = 1;
                this.fixtureMesh.material = emissiveMaterial;

                // 创建假光束
                this.volumetricBeam = this.createVolumetricBeam();
            }
        } catch (error) {
            console.error("灯具模型加载失败:", error);
        }
    }

    createVolumetricBeam() {
        const beam = BABYLON.MeshBuilder.CreateCylinder("volumetricBeam", {
            height: 20,
            diameterTop: 0.1,
            diameterBottom: 2,
            tessellation: 64,
            subdivisions: 64
        }, this.scene);

        beam.rotation.x = Math.PI / 2;

        // 创建自定义着色器
        BABYLON.Effect.ShadersStore['volumetricBeamVertexShader'] = `
            precision highp float;
            attribute vec3 position;
            attribute vec3 normal;
            uniform mat4 worldViewProjection;
            uniform mat4 world;
            varying vec3 vPositionW;
            varying vec3 vNormalW;
            varying vec3 vPosition;

            void main() {
                vec4 p = vec4(position, 1.);
                gl_Position = worldViewProjection * p;
                vPositionW = vec3(world * vec4(position, 1.0));
                vNormalW = normalize(vec3(world * vec4(normal, 0.0)));
                vPosition = position;
            }
        `;

        BABYLON.Effect.ShadersStore['volumetricBeamFragmentShader'] = `
            precision highp float;
            varying vec3 vPositionW;
            varying vec3 vNormalW;
            varying vec3 vPosition;
            uniform vec3 lightColor;
            uniform float intensity;
            uniform vec3 cameraPosition;

            void main() {
                float distanceFromCenter = length(vPosition.xz);
                float attenuation = 1.0 - smoothstep(0.0, 1.0, distanceFromCenter);
                vec3 viewDir = normalize(cameraPosition - vPositionW);
                float fresnel = pow(1.0 - abs(dot(viewDir, vNormalW)), 2.0);
                float noise = fract(sin(dot(vPosition.xyz, vec3(12.9898, 78.233, 45.5432))) * 43758.5453);
                noise = mix(0.8, 1.0, noise);
                float heightAttenuation = 1.0 - smoothstep(0.0, 1.0, abs(vPosition.y) / 10.0);
                float finalIntensity = attenuation * fresnel * noise * heightAttenuation * intensity;
                vec4 finalColor = vec4(lightColor * finalIntensity, finalIntensity * 0.5);
                gl_FragColor = finalColor;
            }
        `;

        const volumetricMaterial = new BABYLON.ShaderMaterial(
            "volumetricBeamMaterial",
            this.scene,
            {
                vertex: "volumetricBeam",
                fragment: "volumetricBeam",
            },
            {
                attributes: ["position", "normal"],
                uniforms: ["world", "worldView", "worldViewProjection", "cameraPosition", "lightColor", "intensity"],
                needAlphaBlending: true
            }
        );

        volumetricMaterial.setColor3("lightColor", BABYLON.Color3.FromHexString("#ffffff"));
        volumetricMaterial.setFloat("intensity", 1.0);
        volumetricMaterial.setVector3("cameraPosition", this.scene.activeCamera.position);

        volumetricMaterial.alphaMode = BABYLON.Engine.ALPHA_ADD;
        volumetricMaterial.backFaceCulling = false;

        beam.material = volumetricMaterial;
        beam.parent = this.lightGroup;
        beam.position.y = -10;

        // 添加相机位置更新
        this.scene.onBeforeRenderObservable.add(() => {
            volumetricMaterial.setVector3("cameraPosition", this.scene.activeCamera.position);
        });

        return {
            mesh: beam,
            material: volumetricMaterial,
            update: (intensity) => {
                volumetricMaterial.setFloat("intensity", intensity);
            }
        };
    }

    dispose() {
        // 清理资源
        if (this.fixtureMesh) {
            this.fixtureMesh.dispose();
        }
        if (this.volumetricBeam) {
            this.volumetricBeam.mesh.dispose();
        }
        if (this.spotLight) {
            this.spotLight.dispose();
        }
        if (this.lightGroup) {
            this.lightGroup.dispose();
        }
    }
}

export default Light;