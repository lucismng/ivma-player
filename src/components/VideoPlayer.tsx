
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { PlayIcon, PauseIcon, MaximizeIcon, Volume2Icon } from './Icons';

interface VideoPlayerProps {
  src: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    let hls: Hls;

    const setupHls = () => {
        if (Hls.isSupported()) {
          hls = new Hls();
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => console.log('Autoplay was prevented.'));
            setIsPlaying(true);
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.addEventListener('loadedmetadata', () => {
            video.play().catch(() => console.log('Autoplay was prevented.'));
            setIsPlaying(true);
          });
        }
    }
    
    setupHls();

    const handleTimeUpdate = () => {
        if (video.duration) {
            setProgress((video.currentTime / video.duration) * 100);
        }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    
    return () => {
      if (hls) {
        hls.destroy();
      }
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [src]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
        const newVolume = parseFloat(e.target.value);
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    }
  };
  
  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.parentElement?.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  const handleMouseMove = useCallback(() => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000);
  }, []);
  
  useEffect(() => {
    handleMouseMove(); // Show controls initially
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [handleMouseMove]);

  return (
    <div className="relative w-full aspect-video bg-black group" onMouseMove={handleMouseMove} onMouseLeave={() => setShowControls(false)}>
      <video ref={videoRef} className="w-full h-full" onClick={togglePlayPause} />
      <div 
        ref={controlsRef} 
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="h-1 bg-gray-600 cursor-pointer">
          <div className="bg-brand-primary h-1" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="flex items-center justify-between mt-2 text-white">
          <div className="flex items-center gap-4">
            <button onClick={togglePlayPause}>
              {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-2">
                <Volume2Icon className="w-6 h-6" />
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-1 accent-brand-primary"
                />
            </div>
          </div>
          <button onClick={toggleFullscreen}>
            <MaximizeIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
