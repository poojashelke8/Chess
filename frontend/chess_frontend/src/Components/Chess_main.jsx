// App.js

import "../../../chess_frontend/src/App.css";
import { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

const Chess_main = ()=> {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  const onPieceDrop = (sourceSquare, targetSquare) => {
    if (gameOver) return false;

    const gameCopy = new Chess(game.fen());

    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (move === null) return false;

    // ✅ UPDATE BOTH
    setGame(gameCopy);
    setFen(gameCopy.fen());

    return true; // 🚨 MUST BE IMMEDIATE
  };

  // Bot move (AFTER render)
  useEffect(() => {
    if (gameOver) return;

    if (game.turn() === "b") {
      const timer = setTimeout(() => {
        const gameCopy = new Chess(game.fen());
        const moves = gameCopy.moves();
        if (!moves.length) return;

        const randomMove =
          moves[Math.floor(Math.random() * moves.length)];
        gameCopy.move(randomMove);

        setGame(gameCopy);
        setFen(gameCopy.fen());
      }, 300);

      return () => clearTimeout(timer);
    }

    if (game.isGameOver() || game.isDraw()) {
      setGameOver(true);
      setWinner(game.turn() === "w" ? "Black" : "White");
    }
  }, [fen]); // 🔑 depend on fen

  return (
    <div>
      <h2>Chess Game</h2>

      <Chessboard
        position={fen}
        onPieceDrop={onPieceDrop}
        boardWidth={420}
      />

      {gameOver && <p>Winner: {winner}</p>}
    </div>
  );
};



export default Chess_main;