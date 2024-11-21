import React, { useState, useEffect } from 'react';

const CueMode = ({ isVisible, goToNextCue, goToPreviousCue, copyCue, onRecordCue, highlightedCueIndex, cues, onCommand }) => {
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

  const executeCommand = (expandedCmd) => {
    const parts = expandedCmd.split(' ');
  
    if (parts[0] === 'record') {
      let cueNumber;
      if (parts.length > 2 && !isNaN(parts[2])) {
        cueNumber = parseInt(parts[2], 10);
        console.log(cueNumber);
      } else {
        cueNumber = getNextCueNumber();
        console.log("cueNumber", cueNumber)
      }
      onRecordCue(cueNumber);
    } else if (parts[0] === 'cue' && parts[2] === 'copy' && parts[3] === 'to' && parts[4] === 'cue') {
      const sourceCueNumber = parseInt(parts[1], 10);
      const targetCueNumber = parseInt(parts[5], 10);
  
      // Validate cue numbers to ensure they are within the valid range
      if (!isNaN(sourceCueNumber) && !isNaN(targetCueNumber) && sourceCueNumber > 0 && sourceCueNumber <= 999 && targetCueNumber > 0 && targetCueNumber <= 999) {
        copyCue(sourceCueNumber, targetCueNumber);
      } else {
        console.error('Invalid cue numbers for copy command. Cue numbers must be between 1 and 999.');
      }
    
    } else if (commandMap[expandedCmd]) {
      onCommand(expandedCmd);
    } else {
      const channelNumber = parseInt(expandedCmd, 10);
      if (!isNaN(channelNumber)) {
        onCommand(`select light ${channelNumber}`);
      } else if (expandedCmd.startsWith('a') && selectedLightChannel !== null) {
        const intensityValue = parseInt(expandedCmd.slice(1), 10);
        if (!isNaN(intensityValue)) {
          onCommand(`adjust intensity ${selectedLightChannel} to ${intensityValue}`);
        }
      }
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Enter') {
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
  }, [command]);
  const getNextCueNumber = () => {
    const cueNumbers = cues.map(cue => extractCueNumber(cue.name)).filter(num => num !== null);
    const maxCueNumber = Math.max(...cueNumbers, 0);
    return maxCueNumber + 1;
  };

  const extractCueNumber = (cueName) => {
    const match = cueName.match(/(\d+)/);
    return match ? parseInt(match[0], 10) : null;
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

  useEffect(() => {
    console.log("now index is", highlightedCueIndex);
  }, [highlightedCueIndex]);

  const visibilityCueMode = isVisible ? 'flex-col' : 'hidden';

  return (
    <div className={`fixed z-60 w-full md:w-1/2 xl:w-1/3 h-full bg-gray-800 text-white pt-4 space-y-4 ${visibilityCueMode}`}>
      <div>

        <button 
          onClick={() => onRecordCue(getNextCueNumber())}
          className="w-full p-2 bg-blue-500 rounded hover:bg-blue-600 transition-colors"
        >
          Record Cue
        </button>
        <button onClick={goToNextCue}>Next Cue</button>
        <button onClick={goToPreviousCue}>Previous Cue</button>

        <div className="mt-4">
          <h3 className="text-xl mb-2">Cue List</h3>
          <ul>
            {cues.map((cue, index) => (
              <li
                key={cue.id}
                className={`mb-1 p-2 ${index === highlightedCueIndex ? 'bg-gray-600' : ''}`}
              >
                <strong>{extractCueNumber(cue.name)}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="fixed z-60 bottom-0 w-full flex-col space-y-2">
            <input
                type="text"
                value={command}
                onChange={handleCommandInput}
                className="w-full p-2 bg-gray-700 text-white"
                placeholder={placeholder}
            />
        </div>
    </div>

  );
};

export default CueMode;
