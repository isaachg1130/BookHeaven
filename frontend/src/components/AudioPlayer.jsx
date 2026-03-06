import React, { useRef, useState, useEffect } from 'react'
import '../styles/AudioPlayer.css'

function AudioPlayer({ audioSrc, title = 'Reproduciendo...', onClose }) {
    const audioRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [error, setError] = useState(null)
    const blobUrlRef = useRef(null)

    useEffect(() => {
        const loadAudio = async () => {
            try {
                setError(null)
                
                // Si la URL es relativa (API endpoint), fetch con headers
                if (audioSrc.startsWith('/api')) {
                    const token = localStorage.getItem('auth_token')
                    const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
                    
                    const response = await fetch(audioSrc, { headers })
                    if (!response.ok) throw new Error('No se pudo cargar el audio')
                    
                    const blob = await response.blob()
                    const blobUrl = URL.createObjectURL(blob)
                    blobUrlRef.current = blobUrl
                    
                    if (audioRef.current) {
                        audioRef.current.src = blobUrl
                    }
                } else {
                    // URL absoluta, usar directamente
                    if (audioRef.current) {
                        audioRef.current.src = audioSrc
                    }
                }
            } catch (err) {
                console.error('Error al cargar audio:', err)
                setError(err.message || 'Error al cargar el audio')
            }
        }

        loadAudio()

        return () => {
            // Limpiar blob URL
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current)
            }
        }
    }, [audioSrc])

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const updateTime = () => setCurrentTime(audio.currentTime)
        const updateDuration = () => setDuration(audio.duration)
        const handleEnded = () => setIsPlaying(false)

        audio.addEventListener('timeupdate', updateTime)
        audio.addEventListener('loadedmetadata', updateDuration)
        audio.addEventListener('ended', handleEnded)

        return () => {
            audio.removeEventListener('timeupdate', updateTime)
            audio.removeEventListener('loadedmetadata', updateDuration)
            audio.removeEventListener('ended', handleEnded)
        }
    }, [])

    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause()
            } else {
                audioRef.current.play().catch(err => console.error('Error al reproducir:', err))
            }
            setIsPlaying(!isPlaying)
        }
    }

    const handleProgressChange = (e) => {
        const newTime = e.target.value
        if (audioRef.current) {
            audioRef.current.currentTime = newTime
            setCurrentTime(newTime)
        }
    }

    const handleVolumeChange = (e) => {
        const newVolume = e.target.value
        setVolume(newVolume)
        if (audioRef.current) {
            audioRef.current.volume = newVolume
        }
    }

    const formatTime = (time) => {
        if (isNaN(time)) return '0:00'
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    return (
        <div className="audio-player-modal">
            <div className="audio-player">
                <div className="audio-player__header">
                    <h3>{title}</h3>
                    <button className="audio-player__close" onClick={onClose}>✕</button>
                </div>

                {error && (
                    <div className="audio-player__error">
                        ⚠️ {error}
                    </div>
                )}

                <audio
                    ref={audioRef}
                    crossOrigin="anonymous"
                    onError={() => setError('Error al cargar el archivo de audio')}
                />

                <div className="audio-player__controls">
                    <button
                        className="btn-play-audio"
                        onClick={handlePlayPause}
                        title={isPlaying ? 'Pausar' : 'Reproducir'}
                    >
                        {isPlaying ? '⏸' : '▶'}
                    </button>

                    <div className="audio-player__progress">
                        <span className="time-display">{formatTime(currentTime)}</span>
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleProgressChange}
                            className="progress-slider"
                        />
                        <span className="time-display">{formatTime(duration)}</span>
                    </div>

                    <div className="audio-player__volume">
                        <span className="volume-icon">🔊</span>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="volume-slider"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AudioPlayer
