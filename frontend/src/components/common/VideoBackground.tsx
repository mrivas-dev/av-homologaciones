'use client';

import { useEffect, useRef, useState } from 'react';

interface VideoBackgroundProps {
  videoSrc: string;
  posterSrc: string;
  className?: string;
}

export default function VideoBackground({ videoSrc, posterSrc, className = '' }: VideoBackgroundProps) {
  const [isClient, setIsClient] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // This effect only runs on the client
    setIsClient(true);
    
    // Ensure the video plays and loops
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Autoplay prevented, showing controls instead');
          if (videoRef.current) {
            videoRef.current.controls = true;
          }
        });
      }
    }
  }, []);

  const handleLoadedMetadata = () => {
    setIsLoaded(true);
  };

  // Don't render video on server
  if (!isClient) {
    return (
      <div className={`absolute inset-0 w-full h-full overflow-hidden bg-black/40 ${className}`} />
    );
  }

  return (
    <div className={`absolute inset-0 w-full h-full overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
        preload="auto"
        onLoadedMetadata={handleLoadedMetadata}
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {!isLoaded && (
        <img
          src={posterSrc}
          alt="Video poster"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}
