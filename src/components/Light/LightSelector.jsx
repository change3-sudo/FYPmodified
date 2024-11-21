import React, { useCallback, useState, useEffect } from 'react';

const LightSelector = React.memo(({ setSelectedLightStack, selectedLightStack, updateSelectedLightPositions, scene }) => {
  const [hoveringIds, setHoveringIds] = useState([]);

  useEffect(() => {
    if (!scene) return;

    const canvas = scene.getEngine().getRenderingCanvas();
    const handleClick = (event) => {
      const pickResult = scene.pick(scene.pointerX, scene.pointerY);
      if (pickResult.hit) {
        const hitObject = pickResult.pickedMesh;
        if (hitObject && hitObject.parent && hitObject.parent.children.some(child => child.isSpotLight)) {
          const lightGroup = hitObject.parent;
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
              setHoveringIds(newStack);
              updateSelectedLightPositions(prevPositions =>
                prevPositions.filter(entry => entry.id !== hitObjectId)
              );
              return newStack;
            } else {
            
              const newEntry = { id: hitObjectId, position: lightGroup.position.asArray() };
              const newStack = [...stack, newEntry];

              updateSelectedLightPositions(prevPositions => {
                const positionExists = prevPositions.some(entry => entry.id === hitObjectId);
                if (!positionExists) {
                  return [...prevPositions, newEntry];
                }
                return prevPositions;
              });

              setHoveringIds(newStack);
              return newStack;
            }
          });

        } else {
          console.log('Clicked outside of lights');
        }
      }
    };

    canvas.addEventListener('click', handleClick);
    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  }, [scene, setSelectedLightStack, updateSelectedLightPositions]);

  useEffect(() => {
    console.log("Hovered Lights:", hoveringIds);
  }, [hoveringIds]);

  useEffect(() => {
    console.log("Selected Light Stack:", selectedLightStack);
  }, [selectedLightStack]);

  return null;
});

export default LightSelector;
