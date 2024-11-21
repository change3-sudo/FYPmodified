import React, { useState } from 'react';

function EditBar({ toggleButtonsVisibility,  toggleLightControl,toggleCueControl, onFileImport }) {
  const [showOptions, setShowOptions] = useState(false);

  const toggleOptions = () => {
    setShowOptions(prev => !prev);
  };
  //fixed z-40 w-50 h-full bg-gray-800 text-white pt-4 space-y-4
  return (
    <div className="fixed right-0 top-10 z-50 w-46 h-full bg-gray-800 text-white flex-col pt-4 space-y-4">
      <button 
        className="mx-4 py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded"
        onClick={toggleOptions}
        aria-expanded={showOptions}
        aria-label="Toggle edit options"
      >
        Edit
      </button>
      {showOptions && (
        <div className="flex flex-col space-y-2 px-4">
          <button 
            className="py-1 px-2 bg-gray-700 hover:bg-gray-600 rounded"
            onClick={toggleButtonsVisibility}
            aria-label="Toggle additional buttons visibility"
          >
            Add Object
          </button>
          <button 
            className="py-1 px-2 bg-gray-700 hover:bg-gray-600 rounded"
            onClick={toggleLightControl}
          >
            Adjust Fixtures
          </button>
          <button 
            className="py-1 px-2 bg-gray-700 hover:bg-gray-600 rounded"
            onClick={toggleCueControl}
          >
            Cue mode
          </button>
          <button 
            className="py-1 px-2 bg-gray-700 hover:bg-gray-600 rounded"
            onClick={() => document.getElementById('fileInput').click()}
            aria-label="Import file"
          >
            Import
          </button>
        </div>
      )}
      {/* <button className="mx-4 py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded" aria-label="Secondary action">Patch</button> */}
    </div>
  );
}

export default EditBar;