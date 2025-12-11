import React, { useState, useEffect } from 'react';
import { Brain } from './brain';

interface AutoPlayControlsProps {
  game: any;
  onMove: () => void;
  disabled?: boolean;
}

type BrainPersonality = 'greedy' | 'explorer' | 'aggressive';

export const AutoPlayControls: React.FC<AutoPlayControlsProps> = ({ 
  game, 
  onMove,
  disabled = false 
}) => {
  const [selectedPersonality, setSelectedPersonality] = useState<BrainPersonality>('greedy');
  const [brain, setBrain] = useState<Brain>(new Brain(selectedPersonality));
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1000);
  const [lastMoveReason, setLastMoveReason] = useState<string>('');

  // Calculate thresholds based on difficulty (inferred from map size)
  const getStartingResources = (mapSize: number): { food: number; water: number } => {
    if (mapSize === 12) return { food: 100, water: 100 }; // easy
    if (mapSize === 16) return { food: 75, water: 75 };  // medium
    if (mapSize === 20) return { food: 50, water: 50 };  // hard
    return { food: 100, water: 100 }; // default
  };

  const gameState = game?.getGameState();
  const mapSize = gameState?.mapSize || 12;
  const startingResources = getStartingResources(mapSize);
  
  // Calculate thresholds for each brain type
  const explorerThreshold = Math.round(startingResources.food * 0.5);
  const aggressiveCritical = Math.round(startingResources.food * 0.15);

  useEffect(() => {
    const newBrain = new Brain(selectedPersonality);
    setBrain(newBrain);
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
      return;
    }
    
    const bestMove = brain.calculateBestMove(gameState);
    
    if (!bestMove) {
      setIsAutoPlaying(false);
      return;
    }
    
    game.attemptMove(bestMove.dx, bestMove.dy);
    setLastMoveReason(bestMove.reason);
    onMove();
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

  return (
    <div>
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-white text-base font-bold">Brain Control</h3>
          <div className="text-xs text-cyan-300">
            Current: {selectedPersonality}
          </div>
        </div>
        
        <div className="offer-display mb-3" style={{ padding: '0.5rem' }}>
          {selectedPersonality === 'greedy' && (
            <div>
              <div className="text-green-400 font-bold mb-1" style={{ fontSize: '0.7rem' }}>Greedy Strategy:</div>
              <div className="text-gray-300" style={{ fontSize: '0.65rem', lineHeight: '1.3' }}>Obsessively collects every visible resource (food, water, gold) before pursuing the trophy. Ignores resource levels and thresholds - if resources are visible, they must be collected first. Only moves toward the trophy when no resources are in sight.</div>
            </div>
          )}
          {selectedPersonality === 'explorer' && (
            <div>
              <div className="text-yellow-400 font-bold mb-1" style={{ fontSize: '0.7rem' }}>Explorer Strategy:</div>
              <div className="text-gray-300" style={{ fontSize: '0.65rem', lineHeight: '1.3' }}>Maintains resources at 50% of starting levels ({explorerThreshold}+). Gathers resources to stay above threshold, but prioritizes the trophy when it's visible. Balances resource management with trophy pursuit.</div>
            </div>
          )}
          {selectedPersonality === 'aggressive' && (
            <div>
              <div className="text-red-400 font-bold mb-1" style={{ fontSize: '0.7rem' }}>Aggressive Strategy:</div>
              <div className="text-gray-300" style={{ fontSize: '0.65rem', lineHeight: '1.3' }}>Single-mindedly pursues the trophy, ignoring resources unless critically low (below {aggressiveCritical}). Takes calculated risks and explores aggressively to find the trophy. Only stops for resources when survival is at stake.</div>
            </div>
          )}
        </div>
        
        <div className="mb-3">
  <div className="text-xs text-gray-300 mb-1">Select Brain Type:</div>
  <div className="grid grid-cols-3 gap-1">
    {/* Row 1 */}
    <button
      onClick={() => setSelectedPersonality('greedy')}
      className={`px-2 py-1.5 rounded text-xs font-bold ${
        selectedPersonality === 'greedy'
          ? 'bg-green-600 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
      disabled={disabled}
    >
      Greedy
    </button>
    <button
      onClick={() => setSelectedPersonality('explorer')}
      className={`px-2 py-1.5 rounded text-xs font-bold ${
        selectedPersonality === 'explorer'
          ? 'bg-yellow-600 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
      disabled={disabled}
    >
      Explorer
    </button>
    <button
      onClick={() => setSelectedPersonality('aggressive')}
      className={`px-2 py-1.5 rounded text-xs font-bold ${
        selectedPersonality === 'aggressive'
          ? 'bg-red-600 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
      disabled={disabled}
    >
      Aggressive
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
        
        {lastMoveReason && (
          <div className="mb-2 p-2 bg-gray-800 rounded text-xs">
            <div className="text-gray-300 mb-1">Last move reason:</div>
            <div className="text-cyan-300">{lastMoveReason}</div>
          </div>
        )}
      </div>
    </div>
  );
};