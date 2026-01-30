import "../../../chess_frontend/src/App.css";
import { useState, useRef, useEffect } from "react";
import { Chess } from "chess.js";

const Chess_main = () => {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [points, setPoints] = useState({ w: 0, b: 0 });
  const [winner, setWinner] = useState(null);

  const gameStartTime = useRef(Date.now());
  const moveStartTime = useRef(Date.now());
  const moveHistory = useRef([]);

  /* ---------- utils ---------- */

  const getSquareName = (row, col) =>
    `${String.fromCharCode(97 + col)}${8 - row}`;

  const pieceMap = {
    p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚",
    P: "♙", R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔",
  };

  const piecePoints = { p: 1, n: 3, b: 3, r: 5, q: 9 };

  /* ---------- game logic ---------- */

 const handleSquareClick = (row, col) => {
  if (winner) return;

  const square = getSquareName(row, col);

  /* ---------- 1️⃣ First selection ---------- */
  if (!selectedSquare) {
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      setLegalMoves(moves.map((m) => m.to));
    }
    return;
  }

  /* ---------- 2️⃣ Switch selection (same color) ---------- */
  const clickedPiece = game.get(square);
  if (
    clickedPiece &&
    clickedPiece.color === game.turn() &&
    square !== selectedSquare
  ) {
    setSelectedSquare(square);
    const moves = game.moves({ square, verbose: true });
    setLegalMoves(moves.map((m) => m.to));
    return;
  }

  if (!legalMoves.includes(square)) {
  setSelectedSquare(null);
  setLegalMoves([]);
  return;
}

  /* ---------- 3️⃣ Try move ---------- */
  const newGame = new Chess(game.fen());
  const oldFen = game.fen();

  let move;
  try {
    move = newGame.move({
      from: selectedSquare,
      to: square,
      promotion: "q",
    });
  } catch (err) {
    // chess.js throws on invalid moves
    setSelectedSquare(null);
    setLegalMoves([]);
    return;
  }

  if (!move) {
    setSelectedSquare(null);
    setLegalMoves([]);
    return;
  }

  /* ---------- 4️⃣ Time tracking ---------- */
  const timeTaken =
    (Date.now() - moveStartTime.current) / 1000;
  moveStartTime.current = Date.now();

  /* ---------- 5️⃣ Points ---------- */
  let gained = 0;
  if (move.captured) {
    gained = piecePoints[move.captured] || 0;
    setPoints((p) => ({
      ...p,
      [move.color]: p[move.color] + gained,
    }));
  }

  /* ---------- 6️⃣ Store move (NO download) ---------- */
moveHistory.current.push({
  move_no: moveHistory.current.length + 1,
  player: move.color === "w" ? "White" : "Black",
  color: move.color,
  from: move.from,
  to: move.to,
  piece: move.piece,
  captured: move.captured || null,
  promotion: move.promotion || null,
  san: move.san,
  time_sec: timeTaken,
  points_gained: gained,        // ⭐ THIS IS IMPORTANT
});

  /* ---------- 7️⃣ Game over ---------- */
  if (newGame.isGameOver()) {
    setWinner(move.color === "w" ? "White" : "Black");
  }

  /* ---------- 8️⃣ Final state update ---------- */
  setGame(newGame);
  setSelectedSquare(null);
  setLegalMoves([]);
};


  /* ---------- download ---------- */
const downloadData = () => {
  const startTime = gameStartTime.current;
  const endTime = Date.now();

  const rows = [];

  // CSV header
 rows.push([
  "move_number",
  "player",
  "from",
  "to",
  "piece",
  "captured",
  "promotion",
  "san",
  "time_sec",
  "points_gained_this_move"
].join(","));


  // Move rows
moveHistory.current.forEach((move, index) => {
  rows.push([
    index + 1,
    move.color === "w" ? "White" : "Black",
    move.from,
    move.to,
    move.piece,
    move.captured || "",
    move.promotion || "",
    move.san,
    move.time_sec.toFixed(2),
    move.points_gained ?? 0
  ].join(","));
});



  const csvContent = rows.join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "chess_game_data.csv";
  a.click();

  URL.revokeObjectURL(url);
};


  /* ---------- render ---------- */

  const renderPiece = (piece) => {
    if (!piece) return null;
    const key =
      piece.color === "w"
        ? piece.type.toUpperCase()
        : piece.type;
    return pieceMap[key];
  };

  return (
    <div className="chess-wrapper">
      <h2>Chess Game</h2>

      <div className="layout">
        {/* BOARD */}
        <div className="board">
          {Array.from({ length: 8 }).map((_, r) =>
            Array.from({ length: 8 }).map((_, c) => {
              const square = getSquareName(r, c);
              const piece = game.get(square);
              const dark = (r + c) % 2;
              const selected = square === selectedSquare;
              const legal = legalMoves.includes(square);

              return (
                <div
                  key={square}
                  className={`square ${dark ? "dark" : "light"}
                    ${selected ? "selected" : ""}
                    ${legal ? "legal" : ""}`}
                  onClick={() => handleSquareClick(r, c)}
                >
                  {renderPiece(piece)}
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="side-panel">
          <p>White Points: {points.w}</p>
          <p>Black Points: {points.b}</p>
          <p>
            Time:{" "}
            {Math.floor(
              (Date.now() - gameStartTime.current) / 1000
            )}s
          </p>

          {winner && (
            <div className="winner-box">
              <strong>Winner:</strong> {winner}
            </div>
          )}

          <button onClick={downloadData}>
            Download Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chess_main;
