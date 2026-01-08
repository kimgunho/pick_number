"use client";

import type React from "react";

import { useState, useRef } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  velocity: number;
  size: number;
  rotation: number;
}

interface NeonLine {
  id: number;
  x: number;
  delay: number;
  color: string;
  duration: number;
}

export default function RandomNumberPicker() {
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isPreExploding, setIsPreExploding] = useState(false);
  const [isExploding, setIsExploding] = useState(false);
  const [minNumber, setMinNumber] = useState(1);
  const [maxNumber, setMaxNumber] = useState(100);
  const [confetti, setConfetti] = useState<Particle[]>([]);
  const [pickedNumbers, setPickedNumbers] = useState<number[]>([]);
  const [neonLines, setNeonLines] = useState<NeonLine[]>([]);

  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const spinSoundRef = useRef<HTMLAudioElement | null>(null);
  const partySoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);

  const playSound = (audioRef: React.MutableRefObject<HTMLAudioElement | null>) => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const stopSound = (audioRef: React.MutableRefObject<HTMLAudioElement | null>) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const triggerConfetti = () => {
    const particles: Particle[] = [];
    const colors = ["#00F5FF", "#FF1493", "#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#FF00FF", "#00FF00"];

    for (let wave = 0; wave < 3; wave++) {
      for (let i = 0; i < 80; i++) {
        particles.push({
          id: Date.now() + wave * 1000 + i,
          x: 50,
          y: 50,
          color: colors[Math.floor(Math.random() * colors.length)],
          angle: (Math.PI * 2 * i) / 80 + wave * 0.1,
          velocity: 3 + Math.random() * 5 + wave,
          size: 8 + Math.random() * 12,
          rotation: Math.random() * 360,
        });
      }
    }

    setConfetti(particles);
  };

  const triggerExplosion = () => {
    const particles: Particle[] = [];
    const colors = ["#FF4500", "#FFD700", "#FFFFFF", "#FF69B4", "#FF0000"]; // Fire colors + Pink

    for (let i = 0; i < 120; i++) {
      particles.push({
        id: Date.now() + i,
        x: 50,
        y: 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: Math.random() * Math.PI * 2,
        velocity: 10 + Math.random() * 20, // High velocity
        size: 5 + Math.random() * 15,
        rotation: Math.random() * 360,
      });
    }

    setConfetti(particles);
  };

  const generateNeonLines = () => {
    const lines: NeonLine[] = [];
    const colors = ["#00F5FF", "#FF1493", "#FFD700"];

    for (let i = 0; i < 75; i++) {
      lines.push({
        id: Date.now() + i,
        x: Math.random() * 100, // Random horizontal position
        delay: Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: 2 + Math.random() * 2, // Random duration between 2-4s
      });
    }

    setNeonLines(lines);
  };

  const startSpinning = (playPartySound: boolean) => {
    // Phase 3: Spin
    setIsExploding(false);
    setIsPreExploding(false);
    setIsSpinning(true);
    setIsShaking(true); // Keeping the gentle shake during spin if desired, or can remove
    generateNeonLines();

    setTimeout(() => setIsShaking(false), 800);

    playSound(spinSoundRef);
    if (playPartySound) {
      playSound(partySoundRef);
    }

    let count = 0;
    let speed = 50;

    const spin = () => {
      const availableNumbers = Array.from({ length: maxNumber - minNumber + 1 }, (_, i) => minNumber + i).filter((num) => !pickedNumbers.includes(num));

      if (availableNumbers.length === 0) {
        setPickedNumbers([]);
        setCurrentNumber(Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber);
      } else {
        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        setCurrentNumber(availableNumbers[randomIndex]);
      }

      count++;

      if (count < 30) {
        speed = 50;
      } else if (count < 45) {
        speed = 100;
      } else if (count < 55) {
        speed = 200;
      }

      if (count >= 40) {
        const availableNumbers = Array.from({ length: maxNumber - minNumber + 1 }, (_, i) => minNumber + i).filter((num) => !pickedNumbers.includes(num));

        if (availableNumbers.length === 0) {
          setPickedNumbers([]);
          const finalNumber = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
          setCurrentNumber(finalNumber);
          setPickedNumbers([finalNumber]);
        } else {
          const randomIndex = Math.floor(Math.random() * availableNumbers.length);
          const finalNumber = availableNumbers[randomIndex];
          setCurrentNumber(finalNumber);
          setPickedNumbers([...pickedNumbers, finalNumber]);
        }

        setIsSpinning(false);
        setNeonLines([]);

        stopSound(spinSoundRef);
        playSound(winSoundRef);
        triggerConfetti();
      } else {
        setTimeout(spin, speed);
      }
    };

    spin();
  };

  const generateRandomNumber = () => {
    playSound(clickSoundRef);
    setConfetti([]);

    // Check if we should show explosion (only if ? box is visible, which corresponds to currentNumber === null)
    if (currentNumber === null) {
      // Phase 1: Pre-explosion Shake (Violent)
      setIsPreExploding(true);

      setTimeout(() => {
        // Phase 2: Explosion
        setIsPreExploding(false);
        setIsExploding(true);
        playSound(partySoundRef); // Use party sound for explosion impact for now
        triggerExplosion();

        setTimeout(() => {
          startSpinning(false);
        }, 400); // Wait for explosion animation (400ms)
      }, 600); // Wait for pre-explosion shake (600ms)
    } else {
      // Skip explosion, start spinning immediately
      startSpinning(true);
    }
  };

  const resetPicker = () => {
    playSound(clickSoundRef);
    setCurrentNumber(null);
  };

  const resetAllNumbers = () => {
    playSound(clickSoundRef);
    setPickedNumbers([]);
    setCurrentNumber(null);
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <audio ref={clickSoundRef} src="/assets/sounds/click.mp3" preload="auto" />
      <audio ref={spinSoundRef} src="/assets/sounds/spinning.mp3" preload="auto" loop />
      <audio ref={partySoundRef} src="/assets/sounds/party.mp3" preload="auto" />
      <audio ref={winSoundRef} src="/assets/sounds/ending.mp3" preload="auto" />

      {neonLines.length > 0 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {neonLines.map((line) => (
            <div
              key={line.id}
              className="absolute animate-neon-rain"
              style={{
                left: `${line.x}%`,
                top: "-20%",
                width: "2px",
                height: "20%",
                background: `linear-gradient(180deg, transparent 0%, ${line.color} 50%, transparent 100%)`,
                boxShadow: `0 0 3px ${line.color}, 0 0 6px ${line.color}`,
                opacity: 0.08,
                animationDelay: `${line.delay}s`,
                animationDuration: `${line.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      {confetti.length > 0 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {confetti.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full animate-confetti-burst"
              style={
                {
                  left: "50%",
                  top: "50%",
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  backgroundColor: particle.color,
                  boxShadow: `0 0 20px ${particle.color}, 0 0 40px ${particle.color}`,
                  "--angle": `${particle.angle}rad`,
                  "--velocity": particle.velocity,
                  "--rotation": `${particle.rotation}deg`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      {pickedNumbers.length > 0 && (
        <div className="fixed top-4 right-4 z-20 bg-card/80 backdrop-blur-md border-2 border-neon-cyan/50 rounded-xl p-5 max-w-[340px] max-h-[600px] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-neon-cyan tracking-wider neon-text-border">당첨자 번호 목록</h3>
            {/* <button onClick={resetAllNumbers} className="text-[10px] text-neon-pink hover:text-neon-yellow transition-colors" title="Reset all">
              ⟳
            </button> */}
          </div>
          <div className="flex flex-wrap gap-2">
            {pickedNumbers
              .slice()
              .reverse()
              .map((num, idx) => (
                <div
                  key={`${num}-${idx}`}
                  className="w-14 h-14 flex items-center justify-center bg-neon-cyan/20 border-2 border-neon-cyan rounded-lg text-2xl font-bold text-neon-cyan neon-text-border"
                >
                  {num}
                </div>
              ))}
          </div>
          {/* <div className="mt-2 text-[10px] text-muted-foreground text-center">{maxNumber - minNumber + 1 - pickedNumbers.length} left</div> */}
        </div>
      )}

      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,.03) 2px, rgba(255,255,255,.03) 4px)",
            backgroundSize: "100% 4px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,.03) 2px, rgba(255,255,255,.03) 4px)",
            backgroundSize: "4px 100%",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-wider">
            <span className="text-neon-cyan neon-glow-cyan neon-text-subtle-border inline-block">BorgWarner</span>
          </h1>
          <h2 className="text-4xl md:text-6xl font-bold tracking-wider">
            <span className="text-neon-pink neon-glow-pink neon-text-subtle-border inline-block">Lucky Draw</span>
          </h2>
          {/* <p className="text-xl md:text-2xl text-muted-foreground tracking-widest neon-text-subtle-border">당첨번호</p> */}
        </div>

        <div className="flex justify-center items-center py-8">
          <div className="relative">
            {currentNumber === null && (
              <div
                className={`w-[280px] h-[280px] border-8 border-neon-yellow neon-box-yellow rounded-2xl flex items-center justify-center bg-gradient-to-br from-neon-yellow/20 to-neon-orange/20 backdrop-blur-sm transition-all duration-300 ${
                  isExploding ? "animate-explode-out" : isPreExploding ? "animate-shake-violent" : isShaking ? "animate-shake-box" : "animate-float-box"
                }`}
              >
                <div className="text-[10rem] md:text-[14rem] font-bold text-neon-yellow neon-glow-yellow neon-text-subtle-border animate-pulse-question">?</div>
                <div className="absolute top-6 left-6 w-4 h-4 bg-neon-yellow rounded-full neon-box-yellow animate-pulse" />
                <div className="absolute top-6 right-6 w-4 h-4 bg-neon-yellow rounded-full neon-box-yellow animate-pulse" style={{ animationDelay: "0.2s" }} />
                <div className="absolute bottom-6 left-6 w-4 h-4 bg-neon-yellow rounded-full neon-box-yellow animate-pulse" style={{ animationDelay: "0.4s" }} />
                <div className="absolute bottom-6 right-6 w-4 h-4 bg-neon-yellow rounded-full neon-box-yellow animate-pulse" style={{ animationDelay: "0.6s" }} />
              </div>
            )}

            {currentNumber !== null && (
              <div
                className={`w-[420px] h-[300px] border-8 border-neon-cyan neon-box-cyan rounded-2xl flex items-center justify-center bg-gradient-to-br from-neon-cyan/20 to-background backdrop-blur-sm transition-all duration-300 ${
                  isSpinning ? "animate-spin-box scale-105" : "animate-reveal-box"
                }`}
              >
                <div
                  className={`text-9xl md:text-[10rem] font-bold text-neon-cyan neon-glow-cyan neon-text-subtle-border tabular-nums ${
                    isSpinning ? "blur-md scale-125 animate-roll-numbers" : "animate-pop-number"
                  } transition-all duration-100`}
                >
                  {currentNumber}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground tracking-wider">MIN</label>
            <input
              type="number"
              value={minNumber}
              onChange={(e) => setMinNumber(Number(e.target.value))}
              className="w-24 px-3 py-2 bg-card border-2 border-border rounded-lg text-center text-foreground focus:border-neon-cyan focus:outline-none transition-colors"
              disabled={isSpinning || isPreExploding || isExploding}
            />
          </div>
          <div className="hidden sm:block text-muted-foreground">—</div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground tracking-wider">MAX</label>
            <input
              type="number"
              value={maxNumber}
              onChange={(e) => setMaxNumber(Number(e.target.value))}
              className="w-24 px-3 py-2 bg-card border-2 border-border rounded-lg text-center font-mono text-foreground focus:border-neon-pink focus:outline-none transition-colors"
              disabled={isSpinning || isPreExploding || isExploding}
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={generateRandomNumber}
            disabled={isSpinning || pickedNumbers.length >= maxNumber - minNumber + 1 || isPreExploding || isExploding}
            className="px-12 py-5 text-2xl font-bold tracking-widest bg-transparent border-4 border-neon-pink text-neon-pink neon-glow-pink neon-text-subtle-border rounded-xl hover:bg-neon-pink/20 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-95 hover:border-neon-cyan hover:text-neon-cyan hover:neon-glow-cyan"
          >
            <span>{isPreExploding || isExploding ? "🔥 BREAKING..." : isSpinning ? "✨ ROLLING..." : "🎲 PICK NUMBER"}</span>
          </button>
        </div>

        {/* {currentNumber !== null && !isSpinning && (
          <div className="flex justify-center animate-fade-in">
            <button
              onClick={resetPicker}
              className="px-8 py-3 text-lg font-bold tracking-widest bg-transparent border-4 border-neon-yellow text-neon-yellow neon-glow-yellow neon-text-subtle-border rounded-xl hover:bg-neon-yellow/20 hover:scale-105 transition-all duration-300 active:scale-95"
            >
              🔄 TRY AGAIN
            </button>
          </div>
        )} */}

        {/* <div className="text-center space-y-2 pt-8">
          <p className="text-sm text-muted-foreground tracking-[0.3em]">FEELING LUCKY?</p>
          <p className="text-xs text-muted-foreground/60 tracking-widest">PRESS THE BUTTON</p>
        </div> */}
      </div>

      <div className="absolute top-1/4 left-1/4 w-[400] h-[400] bg-neon-cyan/30 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400] h-[400] bg-neon-pink/30 rounded-full blur-[150px] pointer-events-none" />
    </main>
  );
}
