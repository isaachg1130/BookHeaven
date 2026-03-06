// src/components/audio/AudioPlayer.jsx
import React, { useState, useRef } from 'react';

export const AudioPlayer = ({ audioBook, audioUrl }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);

    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (e) => {
        const time = parseFloat(e.target.value);
        setCurrentTime(time);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
        }
    };

    const handleVolumeChange = (e) => {
        const vol = parseFloat(e.target.value);
        setVolume(vol);
        if (audioRef.current) {
            audioRef.current.volume = vol;
        }
    };

    const formatTime = (time) => {
        if (!time || isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 text-white">
            <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
            />

            {/* Información */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">{audioBook.titulo}</h2>
                <p className="text-blue-100">{audioBook.autor}</p>
                {audioBook.narrador && (
                    <p className="text-blue-100 text-sm">🎙️ Narrador: {audioBook.narrador}</p>
                )}
            </div>

            {/* Controles */}
            <div className="space-y-4">
                {/* Play/Pause */}
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={handlePlayPause}
                        className="bg-white text-blue-600 rounded-full p-4 hover:bg-blue-100 transition-colors text-2xl font-bold"
                    >
                        {isPlaying ? '⏸' : '▶'}
                    </button>
                </div>

                {/* Progreso */}
                <div>
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-2 bg-blue-300 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm mt-2">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Volumen */}
                <div className="flex items-center gap-3">
                    <span>🔊</span>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="flex-1 h-2 bg-blue-300 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>
        </div>
    );
};
