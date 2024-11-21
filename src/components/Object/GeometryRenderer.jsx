import React, { useEffect } from 'react';
import * as BABYLON from '@babylonjs/core';

const GeometryRenderer = ({ object, scene }) => {
    useEffect(() => {
        if (!object || !scene) return;
      
        const { position = { x: 1, y: 0, z: 0 }, rotation = { x: 0, y: 0, z: 0 }, scale = { x: 1, y: 1, z: 1 }, color = '#ffffff' } = object;
      
        let mesh;
        const material = new BABYLON.StandardMaterial('material', scene);
        material.diffuseColor = BABYLON.Color3.FromHexString(object.color || '#ffffff');
      
        switch (object.type) {
          case 'sphere':
            mesh = BABYLON.MeshBuilder.CreateSphere('sphere', { diameter: 2 }, scene);
            break;
          case 'cone':
            mesh = BABYLON.MeshBuilder.CreateCylinder('cone', { diameterTop: 0, diameterBottom: 1, height: 2 }, scene);
            break;
          case 'torus':
            mesh = BABYLON.MeshBuilder.CreateTorus('torus', { diameter: 2, thickness: 0.5 }, scene);
            break;
          default:
            mesh = BABYLON.MeshBuilder.CreateBox('box', { size: 1 }, scene);
            break;
        }
      
        if (mesh) {
            mesh.position = new BABYLON.Vector3(object.position[0], object.position[1], object.position[2]);
            mesh.rotation = new BABYLON.Vector3(object.rotation[0], object.rotation[1], object.rotation[2]);
            mesh.scaling = new BABYLON.Vector3(object.scale[0], object.scale[1], object.scale[2]);
            mesh.material = material;
          }
      
      
        return () => {
          if (mesh) {
            mesh.dispose();
          }
        };
      }, [object, scene]);

  return null; // Babylon.js handles rendering internally
};

export default GeometryRenderer; 