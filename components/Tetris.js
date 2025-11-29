import React, { useState, useEffect, useCallback } from 'react';

const TETROMINOS = {
    0: { shape: [[0]], color: '0, 0, 0' },
    I: {
        shape: [
            [0, 'I', 0, 0],
            [0, 'I', 0, 0],
            [0, 'I', 0, 0],
            [0, 'I', 0, 0],
        ],
        color: '80, 227, 194',
    },
    J: {
        shape: [
            [0, 'J', 0],
            [0, 'J', 0],
            ['J', 'J', 0],
        ],
        color: '36, 95, 223',
    },
    L: {
        shape: [
            [0, 'L', 0],
            [0, 'L', 0],
            [0, 'L', 'L'],
        ],
        color: '223, 173, 36',
    },
    O: {
        shape: [
            ['O', 'O'],
            ['O', 'O'],
        ],
        color: '223, 217, 36',
    },
    S: {
        shape: [
            [0, 'S', 'S'],
            ['S', 'S', 0],
            [0, 0, 0],
        ],
        color: '48, 211, 56',
    },
    T: {
        shape: [
            [0, 0, 0],
            ['T', 'T', 'T'],
            [0, 'T', 0],
        ],
        color: '132, 61, 198',
    },
    Z: {
        shape: [
            ['Z', 'Z', 0],
            [0, 'Z', 'Z'],
            [0, 0, 0],
        ],
        color: '227, 78, 78',
    },
};

const randomTetromino = () => {
    const tetrominos = 'IJLOSTZ';
    const randTetromino =
        tetrominos[Math.floor(Math.random() * tetrominos.length)];
    return TETROMINOS[randTetromino];
};

const STAGE_WIDTH = 12;
const STAGE_HEIGHT = 20;

const createStage = () =>
    Array.from(Array(STAGE_HEIGHT), () =>
        new Array(STAGE_WIDTH).fill([0, 'clear'])
    );

const checkCollision = (player, stage, { x: moveX, y: moveY }) => {
    for (let y = 0; y < player.tetromino.shape.length; y += 1) {
        for (let x = 0; x < player.tetromino.shape[y].length; x += 1) {
            if (player.tetromino.shape[y][x] !== 0) {
                if (
                    !stage[y + player.pos.y + moveY] ||
                    !stage[y + player.pos.y + moveY][x + player.pos.x + moveX] ||
                    stage[y + player.pos.y + moveY][x + player.pos.x + moveX][1] !==
                    'clear'
                ) {
                    return true;
                }
            }
        }
    }
    return false;
};

const Tetris = () => {
    const [stage, setStage] = useState(createStage());
    const [dropTime, setDropTime] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [score, setScore] = useState(0);

    const [player, setPlayer] = useState({
        pos: { x: 0, y: 0 },
        tetromino: TETROMINOS[0],
        collided: false,
    });

    const [nextPiece, setNextPiece] = useState(TETROMINOS[0]);
    const [holdPiece, setHoldPiece] = useState(null);
    const [canHold, setCanHold] = useState(true);

    const movePlayer = (dir) => {
        if (!checkCollision(player, stage, { x: dir, y: 0 })) {
            setPlayer((prev) => ({
                ...prev,
                pos: { x: prev.pos.x + dir, y: prev.pos.y },
            }));
        }
    };

    const startGame = () => {
        setStage(createStage());
        setDropTime(1000);
        setNextPiece(randomTetromino());
        setHoldPiece(null);
        setCanHold(true);
        resetPlayer(randomTetromino()); // Pass a new random piece for the first one
        setGameOver(false);
        setGameStarted(true);
        setScore(0);
    };

    const resetPlayer = useCallback((newPiece = null) => {
        setPlayer({
            pos: { x: STAGE_WIDTH / 2 - 2, y: 0 },
            tetromino: newPiece || nextPiece, // Use provided piece or nextPiece
            collided: false,
        });
        if (!newPiece) {
            setNextPiece(randomTetromino()); // Only generate next if we used the current next
        }
        setCanHold(true);
    }, [nextPiece]);

    const drop = () => {
        if (!checkCollision(player, stage, { x: 0, y: 1 })) {
            setPlayer((prev) => ({
                ...prev,
                pos: { x: prev.pos.x, y: prev.pos.y + 1 },
            }));
        } else {
            if (player.pos.y < 1) {
                setGameOver(true);
                setGameStarted(false);
                setDropTime(null);
            }
            setPlayer((prev) => ({ ...prev, collided: true }));
        }
    };

    const hardDrop = () => {
        let tmpY = 0;
        while (!checkCollision(player, stage, { x: 0, y: tmpY + 1 })) {
            tmpY += 1;
        }
        setPlayer((prev) => ({
            ...prev,
            pos: { x: prev.pos.x, y: prev.pos.y + tmpY },
            collided: true,
        }));
    };

    const hold = () => {
        if (!canHold || gameOver || !gameStarted) return;

        if (!holdPiece) {
            setHoldPiece(player.tetromino);
            resetPlayer();
        } else {
            const currentPiece = player.tetromino;
            setPlayer({
                pos: { x: STAGE_WIDTH / 2 - 2, y: 0 },
                tetromino: holdPiece,
                collided: false,
            });
            setHoldPiece(currentPiece);
            setCanHold(false);
        }
    };

    const keyUp = ({ keyCode }) => {
        if (!gameOver) {
            if (keyCode === 40) {
                setDropTime(1000);
            }
        }
    };

    const dropPlayer = () => {
        setDropTime(null);
        drop();
    };

    const move = ({ keyCode }) => {
        if (!gameOver) {
            if (keyCode === 37) {
                movePlayer(-1);
            } else if (keyCode === 39) {
                movePlayer(1);
            } else if (keyCode === 40) {
                dropPlayer();
            } else if (keyCode === 38) {
                playerRotate(stage, 1);
            } else if (keyCode === 32) {
                hardDrop();
            } else if (keyCode === 67) { // 'C' key
                hold();
            }
        }
    };

    const playerRotate = (stage, dir) => {
        const clonedPlayer = JSON.parse(JSON.stringify(player));
        clonedPlayer.tetromino.shape = rotate(clonedPlayer.tetromino.shape, dir);

        const pos = clonedPlayer.pos.x;
        let offset = 1;
        while (checkCollision(clonedPlayer, stage, { x: 0, y: 0 })) {
            clonedPlayer.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > clonedPlayer.tetromino.shape[0].length) {
                rotate(clonedPlayer.tetromino.shape, -dir);
                clonedPlayer.pos.x = pos;
                return;
            }
        }
        setPlayer(clonedPlayer);
    };

    const rotate = (matrix, dir) => {
        const rotatedTetro = matrix.map((_, index) =>
            matrix.map((col) => col[index])
        );
        if (dir > 0) return rotatedTetro.map((row) => row.reverse());
        return rotatedTetro.reverse();
    };

    const sweepRows = (newStage) => {
        return newStage.reduce((ack, row) => {
            if (row.findIndex((cell) => cell[0] === 0) === -1) {
                setScore((prev) => prev + 100);
                ack.unshift(new Array(newStage[0].length).fill([0, 'clear']));
                return ack;
            }
            ack.push(row);
            return ack;
        }, []);
    };

    useEffect(() => {
        if (!gameStarted) return;

        const updateStage = (prevStage) => {
            const newStage = prevStage.map((row) =>
                row.map((cell) => (cell[1] === 'clear' ? [0, 'clear'] : cell))
            );

            player.tetromino.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        newStage[y + player.pos.y][x + player.pos.x] = [
                            value,
                            `${player.collided ? 'merged' : 'clear'}`,
                            player.tetromino.color,
                        ];
                    }
                });
            });

            if (player.collided) {
                resetPlayer();
                return sweepRows(newStage);
            }

            return newStage;
        };

        setStage((prev) => updateStage(prev));
    }, [player, resetPlayer, gameStarted]);

    useInterval(() => {
        drop();
    }, dropTime);

    return (
        <div
            className="flex flex-col items-center justify-center outline-none"
            role="button"
            tabIndex="0"
            onKeyDown={(e) => move(e)}
            onKeyUp={keyUp}
            ref={(div) => div && div.focus()}
        >
            <div className="flex gap-8 items-start">
                {/* Hold Piece */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-4 w-32 h-32 flex flex-col items-center justify-center">
                        <p className="text-white/60 text-sm mb-2 uppercase tracking-wider">Hold</p>
                        <div className="flex-1 flex items-center justify-center">
                            {holdPiece && <TetrominoDisplay tetromino={holdPiece} />}
                        </div>
                    </div>
                    <button
                        onClick={hold}
                        disabled={!canHold || !gameStarted}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${canHold && gameStarted
                                ? 'bg-white/10 hover:bg-white/20 text-white'
                                : 'bg-white/5 text-white/30 cursor-not-allowed'
                            }`}
                    >
                        Hold (C)
                    </button>
                </div>

                {/* Main Game Board */}
                <div className="relative p-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-xl shadow-2xl">
                    <div className="grid grid-rows-[repeat(20,minmax(0,1fr))] grid-cols-[repeat(12,minmax(0,1fr))] gap-[1px] bg-black/50 border border-white/10 w-[300px] h-[500px]">
                        {stage.map((row) =>
                            row.map((cell, x) => (
                                <div
                                    key={x}
                                    className="w-full h-full"
                                    style={{
                                        background: cell[0] === 0 ? 'transparent' : `rgba(${cell[2] || '255,255,255'}, 0.8)`,
                                        border: cell[0] === 0 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: cell[0] === 0 ? 'none' : `0 0 10px rgba(${cell[2] || '255,255,255'}, 0.5)`,
                                    }}
                                />
                            ))
                        )}
                    </div>

                    {gameOver && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-xl z-10">
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-white mb-4">Game Over</h2>
                                <button
                                    onClick={startGame}
                                    className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}

                    {!gameOver && !gameStarted && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl z-10">
                            <button
                                onClick={startGame}
                                className="px-8 py-3 bg-white text-black font-bold text-xl rounded-full hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                            >
                                Start Game
                            </button>
                        </div>
                    )}
                </div>

                {/* Next Piece & Stats */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-4 w-32 h-32 flex flex-col items-center justify-center">
                        <p className="text-white/60 text-sm mb-2 uppercase tracking-wider">Next</p>
                        <div className="flex-1 flex items-center justify-center">
                            {nextPiece && <TetrominoDisplay tetromino={nextPiece} />}
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-4 w-32 flex flex-col gap-4">
                        <div className="text-center">
                            <p className="text-xs text-white/60 uppercase tracking-wider">Score</p>
                            <p className="text-xl font-bold font-mono text-white">{score}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-white/60 uppercase tracking-wider">Level</p>
                            <p className="text-xl font-bold font-mono text-white">1</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-white/40 text-sm">
                Use arrow keys to move and rotate • Space to drop • C to hold
            </div>
        </div>
    );
};

// Helper component to display a single tetromino
const TetrominoDisplay = ({ tetromino }) => {
    if (!tetromino || !tetromino.shape) return null;

    // Clean up the shape (remove empty rows/cols if needed, but for simplicity we render as is)
    // We'll use a small grid
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateRows: `repeat(${tetromino.shape.length}, 1fr)`,
                gridTemplateColumns: `repeat(${tetromino.shape[0].length}, 1fr)`,
                gap: '1px'
            }}
        >
            {tetromino.shape.map((row, y) =>
                row.map((cell, x) => (
                    <div
                        key={`${y}-${x}`}
                        style={{
                            width: '15px',
                            height: '15px',
                            background: cell !== 0 ? `rgba(${tetromino.color}, 0.8)` : 'transparent',
                            border: cell !== 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                            boxShadow: cell !== 0 ? `0 0 5px rgba(${tetromino.color}, 0.5)` : 'none'
                        }}
                    />
                ))
            )}
        </div>
    );
};

function useInterval(callback, delay) {
    const savedCallback = React.useRef();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null) {
            const id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

export default Tetris;
