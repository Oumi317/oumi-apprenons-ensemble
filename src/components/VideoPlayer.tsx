import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipBack, SkipForward } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VideoPlayerProps {
  videoUrl: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
  initialTime?: number;
}

export function VideoPlayer({ videoUrl, onTimeUpdate, onComplete, initialTime = 0 }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      if (initialTime > 0) {
        video.currentTime = initialTime;
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime, video.duration);

      // Check if video is near completion (98% watched)
      if (video.currentTime / video.duration >= 0.98 && !hasCompleted) {
        setHasCompleted(true);
        onComplete?.();
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (!hasCompleted) {
        setHasCompleted(true);
        onComplete?.();
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [initialTime, onTimeUpdate, onComplete, hasCompleted]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = value[0];
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0];
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="overflow-hidden bg-black">
      <div className="relative group">
        <video
          ref={videoRef}
          className="w-full aspect-video"
          src={videoUrl}
          onClick={togglePlay}
        />

        {/* Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Progress Bar */}
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={handleSeek}
            className="mb-4 cursor-pointer"
          />

          {/* Controls */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="text-white hover:text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => skip(-10)}
                className="text-white hover:text-white hover:bg-white/20"
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => skip(10)}
                className="text-white hover:text-white hover:bg-white/20"
              >
                <SkipForward className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-white hover:text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>

              <span className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:text-white hover:bg-white/20"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-background/95 backdrop-blur">
                  <DropdownMenuItem onClick={() => changePlaybackRate(0.5)}>
                    0.5x {playbackRate === 0.5 && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changePlaybackRate(0.75)}>
                    0.75x {playbackRate === 0.75 && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changePlaybackRate(1)}>
                    Normal {playbackRate === 1 && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changePlaybackRate(1.25)}>
                    1.25x {playbackRate === 1.25 && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changePlaybackRate(1.5)}>
                    1.5x {playbackRate === 1.5 && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changePlaybackRate(2)}>
                    2x {playbackRate === 2 && "✓"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-white hover:text-white hover:bg-white/20"
              >
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Play Button Overlay (when paused) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              onClick={togglePlay}
              size="lg"
              className="h-20 w-20 rounded-full bg-primary/90 hover:bg-primary"
            >
              <Play className="h-10 w-10" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}