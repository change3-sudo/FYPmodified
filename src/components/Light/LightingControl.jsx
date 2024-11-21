import React, { useState, useEffect, useCallback } from 'react';

const DEFAULT_INTENSITY = 0.6;
const MAX_INTENSITY = 1;
const DISPLAY_MULTIPLIER = 100; // Factor to convert between display and actual values
const DEFAULT_COLOR = '#ff0000';
const DEFAULT_POSITION = { x: -2, y: 6, z: 0 };

const LightingControl = React.memo(({ 
  isVisible, 
  onLightAdd, 
  selectedLightStack,
  setSelectedLightStack, 
  onUpdateLight, 
  onRecordCue,
  cues = [],
  lights,
  selectedLightInfo
}) => {
  const objectToArray = (obj) => [obj.x, obj.y, obj.z];
  const arrayToObject = (arr) => {
    return Array.isArray(arr) 
      ? { x: arr[0] ?? 0, y: arr[1] ?? 0, z: arr[2] ?? 0 }
      : DEFAULT_POSITION;
  };
  const [intensity, setIntensity] = useState(DEFAULT_INTENSITY);
  const [channelInputVisible, setChannelInputVisible] = useState(false);
  const [newLightId, setNewLightId] = useState(null);

  const [displayIntensity, setDisplayIntensity] = useState(Math.round(DEFAULT_INTENSITY * DISPLAY_MULTIPLIER));
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [channelNumber, setChannelNumber] = useState(0);
  function generateShortId() {
    return Math.random().toString(36).substring(2, 6);
  }
  const handleAdd = useCallback(() => {
    const positionArray = objectToArray(position);
    const id = generateShortId();
    setNewLightId(id);
    // Initially add the light without a channel number if it's to be added later
    onLightAdd(id, intensity, color, {
      x: positionArray[0], 
      y: positionArray[1], 
      z: positionArray[2],
    });
    setChannelInputVisible(true);
  }, [position, intensity, color, onLightAdd]);
  useEffect(() => {
    if (selectedLightStack && selectedLightStack.length > 0) {
      const currentLight = selectedLightStack[selectedLightStack.length - 1];
      setPosition(currentLight.position || DEFAULT_POSITION);
      setIntensity(currentLight.intensity ?? DEFAULT_INTENSITY);
      setColor(currentLight.color || DEFAULT_COLOR);
    }
  }, [selectedLightStack]);
  const handleChannelSubmit = useCallback(() => {
    console.log("Attempting to assign channel:", channelNumber, "to light ID:", newLightId);
  
    if (newLightId && channelNumber) {
      onUpdateLight(newLightId, { type: 'channel', value: channelNumber });
      setChannelInputVisible(false);
      setChannelNumber(''); // Clear after successful submission

      console.log("Channel assigned successfully.");
    } else {
      console.log("Failed to assign channel. Missing light ID or channel number.");
    }
  }, [channelNumber, newLightId, onUpdateLight]);
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleChannelSubmit();
    }
  };
  const handlePositionChange = (axis, value) => {
    const newValue = parseFloat(value);
    setPosition(prev => {
      const updatedPosition = {
        ...prev,
        [axis]: newValue,
      };

      if (selectedLightStack && selectedLightStack.length > 0) {
        const currentLight = selectedLightStack[selectedLightStack.length - 1];
        onUpdateLight(currentLight.id, {
          type: 'position',
          value: updatedPosition,
        });
      }

      return updatedPosition;
    });
  };

  const handleIntensityChange = useCallback((e) => {
    const newValue = parseFloat(e.target.value);
    setIntensity(newValue);
    const newDisplayIntensity = Math.round(newValue * DISPLAY_MULTIPLIER);
    setDisplayIntensity(newDisplayIntensity);

    if (selectedLightStack && selectedLightStack.length > 0) {
      const currentLight = selectedLightStack[selectedLightStack.length - 1];
      onUpdateLight(currentLight.id, {
        type: 'intensity',
        value: newValue,
      });
    }
  }, [selectedLightStack, onUpdateLight]);

  if (!isVisible) return null;

  return (
    <div>
      <div className={`fixed left-0 top-10 z-40 w-40 h-full bg-gray-800 text-white flex-col pt-4 space-y-4 ${isVisible ? 'flex-col' : 'hidden'}`}>
        <div className="px-4">
          <div className="mb-4">
            <label>Position X:</label>
            <input 
              type="number" 
              value={position.x ?? 0}
              onChange={(e) => handlePositionChange('x', e.target.value)}
              className="w-full bg-gray-700 p-1"
            />
            <label>Position Y:</label>
            <input 
              type="number" 
              value={position.y ?? 0}
              onChange={(e) => handlePositionChange('y', e.target.value)}
              className="w-full bg-gray-700 p-1"
            />
            <label>Position Z:</label>
            <input 
              type="number" 
              value={position.z ?? 0}
              onChange={(e) => handlePositionChange('z', e.target.value)}
              className="w-full bg-gray-700 p-1"
            />
          </div>
          <div className="mb-4">
            <label>Intensity: {displayIntensity}</label>
            <input 
              type="range" 
              min="0" 
              max={MAX_INTENSITY}
              step="0.01"
              value={intensity ?? DEFAULT_INTENSITY}
              onChange={handleIntensityChange} 
              className="w-full bg-gray-700 p-1"
            />
          </div>
          <button 
            onClick={handleAdd}
            className="w-full p-2 bg-blue-500 rounded hover:bg-blue-600 transition-colors"
          >
            Render
          </button>

        {channelInputVisible && (
          <div className="mt-4">
            <label>Enter Channel Number:</label>
            <input 
              type="text"
              value={channelNumber}
              onChange={(e) => setChannelNumber(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-gray-700 p-1 mb-2"
            />
            <button 
              onClick={handleChannelSubmit}
              className="w-full p-2 bg-green-500 rounded hover:bg-green-600 transition-colors"
            >
              Assign Channel
            </button>
          </div>
        )}

        </div>
          {/* 显示灯具信息 */}
      {selectedLightInfo && (
        <div>
           <h3 className="text-xl font-bold mb-4 ">灯具信息</h3> {/* 使用 mb-4 添加标题下方的间距 */}
          <div className="mb-4">
            <label className="block"><strong>ID:</strong> {selectedLightInfo.id}</label>
          </div>
          <div className="mb-4">
            <label className="block"><strong>强度:</strong> {selectedLightInfo.intensity}</label>
          </div>
          <div className="mb-4">
            <label className="block"><strong>颜色:</strong> {selectedLightInfo.color}</label>
          </div>
          <div className="mb-4">
            <label className="block"><strong>位置:</strong> {`(${selectedLightInfo.position.x}, ${selectedLightInfo.position.y}, ${selectedLightInfo.position.z})`}</label>
        </div>
        </div>
      )}
    </div>
      </div>

    
  );
});

export default LightingControl; 