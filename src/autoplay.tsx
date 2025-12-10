import React, { useState, useEffect } from 'react';
import { Brain } from '/home/kai/CS3560-Group-2/src/brain.ts';

interface AutoPlayControlsProps {
  game: any;
  onMove: () => void;
  disabled?: boolean;
}

type BrainPersonality = 'survivalist' | 'cautious' | 'balanced' | 'aggressive' | 'explorer';

export const AutoPlayControls: React.FC<AutoPlayControlsProps> = ({ 
  game, 
  onMove,
  disabled = false 
}) => {
  const [selectedPersonality, setSelectedPersonality] = useState<BrainPersonality>('survivalist');
  const [brain, setBrain] = useState<Brain>(new Brain(selectedPersonality));
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1000);
  const [brainLog, setBrainLog] = useState<string[]>([]);
  const [lastMoveReason, setLastMoveReason] = useState<string>('');

  useEffect(() => {
    const newBrain = new Brain(selectedPersonality);
    setBrain(newBrain);
    setBrainLog(prev => [`Brain changed to: ${selectedPersonality}`, ...prev.slice(0, 9)]);
  }, [selectedPersonality]);

  useEffect(() => {
    let interval: number | null = null;
    
    if (isAutoPlaying && game && !disabled) {
      interval = setInterval(() => {
        makeBrainMove();
      }, playSpeed);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoPlaying, game, playSpeed, disabled]);

  const makeBrainMove = () => {
    if (!game || disabled) return;
    
    const gameState = game.getGameState();
    
    if (gameState.gameOver || gameState.gameWon) {
      setIsAutoPlaying(false);
      setBrainLog(prev => [`Game ${gameState.gameWon ? 'WON' : 'OVER'}`, ...prev]);
      return;
    }
    
    const bestMove = brain.calculateBestMove(gameState);
    
    if (!bestMove) {
      setBrainLog(prev => ['Brain: No valid moves available', ...prev]);
      setIsAutoPlaying(false);
      return;
    }
    
    const result = game.attemptMove(bestMove.dx, bestMove.dy);
    
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
    const logEntry = `[${time}] [${selectedPersonality}] ${bestMove.reason}`;
    setBrainLog(prev => [logEntry, ...prev.slice(0, 9)]);
    setLastMoveReason(bestMove.reason);
    
    onMove();
    
    if (result && 'message' in result && result.message) {
      setBrainLog(prev => [`Result: ${result.message}`, ...prev.slice(0, 9)]);
    }
  };

  const handleSingleStep = () => {
    if (disabled) return;
    makeBrainMove();
  };

  const toggleAutoPlay = () => {
    if (disabled) return;
    setIsAutoPlaying(!isAutoPlaying);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaySpeed(speed);
  };

  const clearLog = () => {
    setBrainLog([]);
    setLastMoveReason('');
  };

  return (
    <div className="auto-play-panel" style={{ marginBottom: '12px' }}>
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-white text-base font-bold">Brain Control</h3>
          <div className="text-xs text-cyan-300">
            Current: {selectedPersonality}
          </div>
        </div>
        
        <div className="mb-3">
  <div className="text-xs text-gray-300 mb-1">Select Brain Type:</div>
  <div className="grid grid-cols-3 gap-1">
    {/* Row 1 */}
    <button
      onClick={() => setSelectedPersonality('survivalist')}
      className={`px-2 py-1.5 rounded text-xs font-bold ${
        selectedPersonality === 'survivalist'
          ? 'bg-green-600 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
      disabled={disabled}
    >
      Survivalist
    </button>
    <button
      onClick={() => setSelectedPersonality('cautious')}
      className={`px-2 py-1.5 rounded text-xs font-bold ${
        selectedPersonality === 'cautious'
          ? 'bg-yellow-600 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
      disabled={disabled}
    >
      Cautious
    </button>
    <button
      onClick={() => setSelectedPersonality('balanced')}
      className={`px-2 py-1.5 rounded text-xs font-bold ${
        selectedPersonality === 'balanced'
          ? 'bg-purple-600 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
      disabled={disabled}
    >
      Balanced
    </button>
    
 
    <button
      onClick={() => setSelectedPersonality('aggressive')}
      className={`px-2 py-1.5 rounded text-xs font-bold col-span-2 ${
        selectedPersonality === 'aggressive'
          ? 'bg-red-600 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
      disabled={disabled}
    >
      Aggressive
    </button>
    <button
      onClick={() => setSelectedPersonality('explorer')}
      className={`px-2 py-1.5 rounded text-xs font-bold ${
        selectedPersonality === 'explorer'
          ? 'bg-blue-600 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
      disabled={disabled}
    >
      Explorer
    </button>
  </div>
</div>
        
        {disabled && (
          <div className="text-yellow-400 text-xs mb-2 p-1 bg-yellow-900 rounded">
            Brain disabled during trader interaction
          </div>
        )}
        
        <div className="mb-3">
          <div className="text-xs text-gray-300 mb-1">Speed: {playSpeed}ms</div>
          <input
            type="range"
            min="200"
            max="3000"
            step="100"
            value={playSpeed}
            onChange={(e) => handleSpeedChange(Number(e.target.value))}
            disabled={disabled}
            className={`w-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Fast</span>
            <span>Slow</span>
          </div>
        </div>
        
        <div className="flex gap-2 mb-3">
          <button
            onClick={handleSingleStep}
            disabled={disabled}
            className={`flex-1 px-3 py-2 rounded text-sm font-bold ${
              disabled 
                ? 'bg-gray-600 cursor-not-allowed text-gray-400' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            Single Step
          </button>
          <button
            onClick={toggleAutoPlay}
            disabled={disabled}
            className={`flex-1 px-3 py-2 rounded text-sm font-bold ${
              disabled
                ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                : isAutoPlaying
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isAutoPlaying ? 'Stop' : 'Auto-Play'}
          </button>
        </div>
        
        <button
          onClick={clearLog}
          className="w-full px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs mb-3"
        >
          Clear Log
        </button>
        
        {lastMoveReason && (
          <div className="mb-2 p-2 bg-gray-800 rounded text-xs">
            <div className="text-gray-300 mb-1">Last move reason:</div>
            <div className="text-cyan-300">{lastMoveReason}</div>
          </div>
        )}
      </div>
      
      <div className="log-container">
        <div className="text-xs text-gray-300 mb-1">Brain Decision Log:</div>
        <div className="log-content">
          {brainLog.map((log, index) => (
            <div key={index} className="log-entry text-xs text-gray-400 py-1 border-b border-gray-800">
              {log}
            </div>
          ))}
          {brainLog.length === 0 && (
            <div className="text-xs text-gray-500 py-2 text-center">No decisions yet</div>
          )}
        </div>
      </div>
    </div>
  );
};