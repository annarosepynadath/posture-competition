import { useState } from 'react';
import type { GameStage, Player, PostureMetrics } from './types';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { PreTurnScreen } from './components/PreTurnScreen';
import { ChallengeScreen } from './components/ChallengeScreen';
import { TurnResultScreen } from './components/TurnResultScreen';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { RulesModal } from './components/RulesModal';
import { CameraModal } from './components/CameraModal';

const STORAGE_KEY = 'posture_champion_match_state_v1';

interface SavedState {
  players: Player[];
  currentPlayerIndex: number;
  stage: GameStage;
}

function getInitialState(): SavedState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.players) && parsed.players.length >= 2) {
        return {
          players: parsed.players,
          currentPlayerIndex: parsed.currentPlayerIndex || 0,
          stage: parsed.stage || 'setup',
        };
      }
    }
  } catch {
    // ignore storage error
  }
  return {
    players: [],
    currentPlayerIndex: 0,
    stage: 'setup',
  };
}

export function App() {
  const [initial] = useState<SavedState>(getInitialState);
  const [stage, setStage] = useState<GameStage>(initial.stage);
  const [players, setPlayers] = useState<Player[]>(initial.players);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(initial.currentPlayerIndex);
  const [rulesModalOpen, setRulesModalOpen] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Save tournament state to localStorage
  const persistState = (
    newPlayers: Player[],
    newIndex: number,
    newStage: GameStage
  ) => {
    setPlayers(newPlayers);
    setCurrentPlayerIndex(newIndex);
    setStage(newStage);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          players: newPlayers,
          currentPlayerIndex: newIndex,
          stage: newStage,
        })
      );
    } catch {
      // ignore storage write errors
    }
  };

  // Start game from HomeScreen
  const handleStartGame = (configuredPlayers: Player[]) => {
    persistState(configuredPlayers, 0, 'pre-turn');
  };

  // Pre-turn countdown complete -> start 10s challenge
  const handleCountdownComplete = () => {
    setStage('challenge');
  };

  // 10s challenge complete -> save metrics and show turn result
  const handleChallengeComplete = (finalMetrics: PostureMetrics) => {
    const updated = [...players];
    updated[currentPlayerIndex] = {
      ...updated[currentPlayerIndex],
      score: finalMetrics.overallScore,
      metricsBreakdown: finalMetrics,
      completed: true,
    };

    persistState(updated, currentPlayerIndex, 'turn-result');
  };

  // Proceed after turn result
  const handleProceedNext = () => {
    if (currentPlayerIndex < players.length - 1) {
      persistState(players, currentPlayerIndex + 1, 'pre-turn');
    } else {
      persistState(players, currentPlayerIndex, 'leaderboard');
    }
  };

  // Rematch with same players
  const handlePlayAgainSame = () => {
    const resetPlayers = players.map((p) => ({
      ...p,
      score: null,
      metricsBreakdown: null,
      completed: false,
    }));
    persistState(resetPlayers, 0, 'pre-turn');
  };

  // Reset entirely to setup
  const handleNewCompetition = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setStage('setup');
  };

  // Camera error handler
  const handleCameraError = (err: string) => {
    setCameraError(err);
  };

  const handleRetryCamera = () => {
    setCameraError(null);
  };

  const currentPlayer = players[currentPlayerIndex];

  return (
    <div className="flex flex-col min-h-screen text-[#F1FAEE] font-sans selection:bg-[#A8DADC] selection:text-[#1D3557]">
      <Header
        stage={stage}
        currentPlayerIndex={currentPlayerIndex}
        totalPlayers={players.length}
        onRestart={handleNewCompetition}
        onOpenRules={() => setRulesModalOpen(true)}
      />

      <main className="flex-1 flex flex-col justify-center">
        {stage === 'setup' && (
          <HomeScreen
            onStartGame={handleStartGame}
            onOpenRules={() => setRulesModalOpen(true)}
            onCameraError={handleCameraError}
          />
        )}

        {stage === 'pre-turn' && currentPlayer && (
          <PreTurnScreen
            player={currentPlayer}
            playerIndex={currentPlayerIndex}
            totalPlayers={players.length}
            onCountdownComplete={handleCountdownComplete}
          />
        )}

        {stage === 'challenge' && currentPlayer && (
          <ChallengeScreen
            player={currentPlayer}
            playerIndex={currentPlayerIndex}
            totalPlayers={players.length}
            onChallengeComplete={handleChallengeComplete}
            onCameraError={handleCameraError}
          />
        )}

        {stage === 'turn-result' && currentPlayer && (
          <TurnResultScreen
            player={currentPlayer}
            playerIndex={currentPlayerIndex}
            totalPlayers={players.length}
            allPlayers={players}
            onProceedNext={handleProceedNext}
          />
        )}

        {stage === 'leaderboard' && (
          <LeaderboardScreen
            players={players}
            onPlayAgainSame={handlePlayAgainSame}
            onNewCompetition={handleNewCompetition}
          />
        )}
      </main>

      {/* Rules & Scoring Info Modal */}
      <RulesModal
        isOpen={rulesModalOpen}
        onClose={() => setRulesModalOpen(false)}
      />

      {/* Camera Permission / Error Modal */}
      <CameraModal
        isOpen={cameraError !== null}
        errorMsg={cameraError || ''}
        onRetry={handleRetryCamera}
        onClose={() => setCameraError(null)}
      />

      {/* Championship Footer */}
      <footer className="w-full py-4 text-center text-xs text-[#A8DADC]/60 border-t border-[#A8DADC]/10 bg-[#102038]/60 font-medium">
        <p>
          Posture Champion &bull; Client-Side MediaPipe Vision AI &bull; No Data Leaves Your Browser
        </p>
      </footer>
    </div>
  );
}

export default App;
