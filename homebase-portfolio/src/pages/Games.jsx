import { useState, useEffect, useRef, useCallback } from 'react';
import { subscribeToLeaderboard, saveHighScore } from '../services/gameService';

// Simple Tetris implementation
function Tetris({ onScore }) {
  const [board, setBoard] = useState(Array(20).fill().map(() => Array(10).fill(0)));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const scoreRef = useRef(score);
  
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const movePiece = useCallback(() => {
    setScore(s => s + 10);
    onScore(scoreRef.current + 10);
  }, [onScore]);

  const dropPiece = useCallback(() => {
    setScore(s => s + 5);
    onScore(scoreRef.current + 5);
  }, [onScore]);

  useEffect(() => {
    const handleKey = (e) => {
      if (gameOver) return;
      if (e.key === 'ArrowLeft') movePiece();
      if (e.key === 'ArrowRight') movePiece();
      if (e.key === 'ArrowDown') dropPiece();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameOver, movePiece, dropPiece]);

  const resetGame = () => {
    setBoard(Array(20).fill().map(() => Array(10).fill(0)));
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-2xl font-bold mb-4">Score: {score}</div>
      <div className="grid grid-cols-10 gap-px bg-gray-700 p-1 rounded">
        {board.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              className={`w-6 h-6 rounded-sm ${cell ? 'bg-purple-500' : 'bg-gray-800'}`}
            />
          ))
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={resetGame} className="px-4 py-2 bg-purple-500 rounded hover:bg-purple-600">
          New Game
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-400">Use arrow keys to move</p>
    </div>
  );
}

// Snake game
function Snake({ onScore }) {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState('RIGHT');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const scoreRef = useRef(score);
  const directionRef = useRef(direction);
  
  useEffect(() => {
    snakeRef.current = snake;
    foodRef.current = food;
    scoreRef.current = score;
    directionRef.current = direction;
  }, [snake, food, score, direction]);

  useEffect(() => {
    const handleKey = (e) => {
      if (gameOver) return;
      switch(e.key) {
        case 'ArrowUp': if (directionRef.current !== 'DOWN') setDirection('UP'); break;
        case 'ArrowDown': if (directionRef.current !== 'UP') setDirection('DOWN'); break;
        case 'ArrowLeft': if (directionRef.current !== 'RIGHT') setDirection('LEFT'); break;
        case 'ArrowRight': if (directionRef.current !== 'LEFT') setDirection('RIGHT'); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      const newSnake = [...snakeRef.current];
      const head = { ...newSnake[0] };
      const currentDirection = directionRef.current;
      
      switch(currentDirection) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }
      
      if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
        setGameOver(true);
        return;
      }
      
      newSnake.unshift(head);
      const currentFood = foodRef.current;
      
      if (head.x === currentFood.x && head.y === currentFood.y) {
        setScore(s => s + 10);
        onScore(scoreRef.current + 10);
        setFood({ x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) });
      } else {
        newSnake.pop();
      }
      
      setSnake(newSnake);
    }, 150);
    return () => clearInterval(interval);
  }, [gameOver, onScore]);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setDirection('RIGHT');
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-2xl font-bold mb-4">Score: {score}</div>
      <div className="relative w-[400px] h-[400px] bg-gray-800 rounded border border-gray-700">
        {snake.map((seg, i) => (
          <div
            key={i}
            className="absolute w-5 h-5 bg-green-500 rounded"
            style={{ left: seg.x * 20, top: seg.y * 20 }}
          />
        ))}
        <div
          className="absolute w-5 h-5 bg-red-500 rounded"
          style={{ left: food.x * 20, top: food.y * 20 }}
        />
        {gameOver && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="text-2xl font-bold">Game Over!</div>
          </div>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={resetGame} className="px-4 py-2 bg-green-500 rounded hover:bg-green-600">
          New Game
        </button>
      </div>
    </div>
  );
}

export default function Games() {
  const [activeGame, setActiveGame] = useState('tetris');
  const [tetrisScores, setTetrisScores] = useState([]);
  const [snakeScores, setSnakeScores] = useState([]);
  const demoUser = JSON.parse(localStorage.getItem('demoUser') || '{"id":"demo1","name":"Demo User"}');

  useEffect(() => {
    const unsub1 = subscribeToLeaderboard('tetris', setTetrisScores);
    const unsub2 = subscribeToLeaderboard('snake', setSnakeScores);
    return () => { unsub1(); unsub2(); };
  }, []);

  const handleScore = (game, score) => {
    if (score > 0 && score % 100 === 0) {
      saveHighScore(game, demoUser.id, demoUser.name, score);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Games</h1>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveGame('tetris')}
            className={`px-6 py-2 rounded-lg ${activeGame === 'tetris' ? 'bg-purple-500' : 'bg-gray-700'}`}
          >
            🎮 Tetris
          </button>
          <button
            onClick={() => setActiveGame('snake')}
            className={`px-6 py-2 rounded-lg ${activeGame === 'snake' ? 'bg-green-500' : 'bg-gray-700'}`}
          >
            🐍 Snake
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            {activeGame === 'tetris' ? (
              <Tetris onScore={(s) => handleScore('tetris', s)} />
            ) : (
              <Snake onScore={(s) => handleScore('snake', s)} />
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <h2 className="text-lg font-semibold mb-3">Tetris Leaderboard</h2>
              <div className="space-y-2">
                {tetrisScores.slice(0, 5).map((s, i) => (
                  <div key={s.id} className="flex justify-between text-sm">
                    <span>#{i + 1} {s.userName}</span>
                    <span className="text-purple-400">{s.score}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <h2 className="text-lg font-semibold mb-3">Snake Leaderboard</h2>
              <div className="space-y-2">
                {snakeScores.slice(0, 5).map((s, i) => (
                  <div key={s.id} className="flex justify-between text-sm">
                    <span>#{i + 1} {s.userName}</span>
                    <span className="text-green-400">{s.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
