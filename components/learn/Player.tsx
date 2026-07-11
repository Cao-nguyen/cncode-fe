"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
    Play,
    Pause,
    Maximize,
    Minimize,
    Settings,
    Captions,
    Volume2,
    Volume1,
    VolumeX,
} from "lucide-react";

type VideoSource = {
    label: string; // vd: "1080p", "720p", "480p"
    src: string;
};

type VideoPlayerProps = {
    src?: string; // link video mp4/webm... HOẶC link YouTube (watch/youtu.be/shorts/embed)
    sources?: VideoSource[]; // nhiều độ phân giải — chỉ dùng cho video thường, không dùng cho YouTube
    tag?: string; // nhãn góc trên trái, vd: "DM CS 🚩🚩🚩"
    poster?: string;
    autoPlay?: boolean;
    className?: string;
};

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function formatTime(sec: number) {
    if (!isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

// nhận diện link youtube (watch, youtu.be, embed, shorts) và lấy video id
function getYouTubeId(url: string): string | null {
    const match = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
}

export default function VideoPlayer({
    src,
    sources,
    tag,
    poster,
    autoPlay = false,
    className = "",
}: VideoPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const qualityList: VideoSource[] =
        sources && sources.length > 0 ? sources : [{ label: "Auto", src: src ?? "" }];

    // nếu link truyền vào là YouTube -> sẽ nhúng qua IFrame API (để bắt được lỗi chặn nhúng)
    const youTubeId = !sources && src ? getYouTubeId(src) : null;
    const youtubeContainerRef = useRef<HTMLDivElement>(null);
    const youtubePlayerId = useRef(`yt-player-${Math.random().toString(36).slice(2)}`);

    const [currentQuality, setCurrentQuality] = useState(qualityList[0]);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [settingsView, setSettingsView] = useState<"menu" | "speed" | "quality" | null>(null);
    const [captionsOn, setCaptionsOn] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [showControls, setShowControls] = useState(true);
    const [isSeeking, setIsSeeking] = useState(false);
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);
    const [youtubeError, setYoutubeError] = useState(false);

    const togglePlay = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
            video.play();
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const onTimeUpdate = () => {
            if (!isSeeking) setCurrentTime(video.currentTime);
        };
        const onLoadedMetadata = () => setDuration(video.duration);
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onEnded = () => setIsPlaying(false);

        video.addEventListener("timeupdate", onTimeUpdate);
        video.addEventListener("loadedmetadata", onLoadedMetadata);
        video.addEventListener("play", onPlay);
        video.addEventListener("pause", onPause);
        video.addEventListener("ended", onEnded);

        return () => {
            video.removeEventListener("timeupdate", onTimeUpdate);
            video.removeEventListener("loadedmetadata", onLoadedMetadata);
            video.removeEventListener("play", onPlay);
            video.removeEventListener("pause", onPause);
            video.removeEventListener("ended", onEnded);
        };
    }, [isSeeking]);

    useEffect(() => {
        const onFsChange = () => {
            setIsFullscreen(document.fullscreenElement === containerRef.current);
        };
        document.addEventListener("fullscreenchange", onFsChange);
        return () => document.removeEventListener("fullscreenchange", onFsChange);
    }, []);

    // khởi tạo player YouTube qua IFrame API để có thể bắt sự kiện lỗi (video bị chặn nhúng, riêng tư, đã xoá...)
    useEffect(() => {
        if (!youTubeId) return;
        setYoutubeError(false);

        let cancelled = false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any;

        const createPlayer = () => {
            if (cancelled || !youtubeContainerRef.current) return;
            new w.YT!.Player(youtubePlayerId.current, {
                videoId: youTubeId,
                playerVars: { playsinline: 1, rel: 0 },
                host: "https://www.youtube-nocookie.com",
                events: {
                    onError: () => {
                        // mã lỗi 2, 5, 100, 101, 150 đều liên quan đến việc không phát được / bị chặn nhúng
                        setYoutubeError(true);
                    },
                },
            });
        };

        if (w.YT && w.YT.Player) {
            createPlayer();
        } else {
            const existingScript = document.getElementById("youtube-iframe-api");
            if (!existingScript) {
                const tag = document.createElement("script");
                tag.id = "youtube-iframe-api";
                tag.src = "https://www.youtube.com/iframe_api";
                document.body.appendChild(tag);
            }
            const prevCallback = w.onYouTubeIframeAPIReady;
            w.onYouTubeIframeAPIReady = () => {
                prevCallback?.();
                createPlayer();
            };
        }

        return () => {
            cancelled = true;
        };
    }, [youTubeId]);

    const toggleFullscreen = () => {
        const el = containerRef.current;
        if (!el) return;
        if (!document.fullscreenElement) {
            el.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;
        const newTime = Number(e.target.value);
        setCurrentTime(newTime);
        video.currentTime = newTime;
    };

    const changeSpeed = (s: number) => {
        const video = videoRef.current;
        if (!video) return;
        video.playbackRate = s;
        setSpeed(s);
        setSettingsView(null);
    };

    // đổi độ phân giải nhưng giữ nguyên thời gian đang phát
    const changeQuality = (q: VideoSource) => {
        const video = videoRef.current;
        if (!video) return;
        const resumeTime = video.currentTime;
        const wasPlaying = !video.paused;
        setCurrentQuality(q);
        setSettingsView(null);
        requestAnimationFrame(() => {
            if (!videoRef.current) return;
            videoRef.current.currentTime = resumeTime;
            videoRef.current.playbackRate = speed;
            if (wasPlaying) videoRef.current.play();
        });
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;
        const newVolume = Number(e.target.value);
        video.volume = newVolume;
        setVolume(newVolume);
        video.muted = newVolume === 0;
        setMuted(newVolume === 0);
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = !video.muted;
        setMuted(video.muted);
    };

    const toggleCaptions = () => {
        const video = videoRef.current;
        if (!video) return;
        const track = video.textTracks?.[0];
        if (track) {
            track.mode = captionsOn ? "hidden" : "showing";
        }
        setCaptionsOn(!captionsOn);
    };

    const resetHideTimer = () => {
        setShowControls(true);
        if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
        if (isPlaying) {
            hideControlsTimeout.current = setTimeout(() => {
                setShowControls(false);
                setSettingsView(null);
            }, 2800);
        }
    };

    useEffect(() => {
        resetHideTimer();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPlaying]);

    const progressPercent = duration ? (currentTime / duration) * 100 : 0;

    if (youTubeId) {
        return (
            <div
                className={`relative w-full max-w-[420px] aspect-[9/16] bg-black rounded-xl overflow-hidden ${className}`}
            >
                {tag && (
                    <div className="absolute top-3 left-3 z-20 bg-black/70 text-white text-xs font-medium px-2.5 py-1 rounded-md backdrop-blur-sm">
                        {tag}
                    </div>
                )}

                {youtubeError ? (
                    // video bị chặn nhúng (chủ kênh tắt tính năng embed) -> hiện fallback
                    <div
                        className="w-full h-full flex flex-col items-center justify-center gap-3 text-center px-6"
                        style={{
                            backgroundImage: `url(https://img.youtube.com/vi/${youTubeId}/hqdefault.jpg)`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    >
                        <div className="absolute inset-0 bg-black/70" />
                        <p className="relative z-10 text-white text-sm">
                            Video này không cho phép nhúng ra ngoài YouTube.
                        </p>
                        <a
                            href={`https://www.youtube.com/watch?v=${youTubeId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative z-10 bg-red-600 hover:bg-red-700 transition-colors text-white text-sm font-medium px-4 py-2 rounded-full"
                        >
                            Xem trên YouTube
                        </a>
                    </div>
                ) : (
                    <div ref={youtubeContainerRef} className="w-full h-full">
                        <div id={youtubePlayerId.current} className="w-full h-full" />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            onMouseMove={resetHideTimer}
            onClick={() => setSettingsView(null)}
            className={`relative w-full max-w-[420px] aspect-[9/16] bg-black rounded-xl overflow-hidden select-none ${className}`}
        >
            {tag && (
                <div className="absolute top-3 left-3 z-20 bg-black/70 text-white text-xs font-medium px-2.5 py-1 rounded-md backdrop-blur-sm">
                    {tag}
                </div>
            )}

            <video
                ref={videoRef}
                src={currentQuality.src}
                poster={poster}
                autoPlay={autoPlay}
                playsInline
                onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                }}
                className="w-full h-full object-contain bg-black cursor-pointer"
            />

            {!isPlaying && (
                <button
                    onClick={togglePlay}
                    className="absolute inset-0 z-10 flex items-center justify-center"
                >
                    <span className="bg-black/50 rounded-full p-5 hover:bg-black/70 transition-colors">
                        <Play fill="white" className="text-white w-8 h-8" />
                    </span>
                </button>
            )}

            {/* THANH ĐIỀU KHIỂN — TẤT CẢ TRÊN 1 DÒNG */}
            <div
                className={`absolute bottom-0 left-0 right-0 z-20 px-2.5 py-2
        bg-gradient-to-t from-black/85 via-black/50 to-transparent
        transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-1 text-white">
                    {/* play/pause */}
                    <button
                        onClick={togglePlay}
                        aria-label="play-pause"
                        className="shrink-0 w-8 h-8 flex items-center justify-center"
                    >
                        {isPlaying ? (
                            <Pause className="w-5 h-5" fill="white" />
                        ) : (
                            <Play className="w-5 h-5" fill="white" />
                        )}
                    </button>

                    {/* progress bar */}
                    <input
                        type="range"
                        min={0}
                        max={duration || 0}
                        step={0.01}
                        value={currentTime}
                        onMouseDown={() => setIsSeeking(true)}
                        onMouseUp={() => setIsSeeking(false)}
                        onChange={handleSeek}
                        className="flex-1 h-1 rounded-full appearance-none cursor-pointer accent-white min-w-0"
                        style={{
                            background: `linear-gradient(to right, white ${progressPercent}%, rgba(255,255,255,0.3) ${progressPercent}%)`,
                        }}
                    />

                    {/* thời gian */}
                    <span className="text-xs tabular-nums whitespace-nowrap shrink-0 flex items-center justify-center h-8 px-1">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>

                    {/* phụ đề */}
                    <button
                        onClick={toggleCaptions}
                        aria-label="captions"
                        className={`shrink-0 w-8 h-8 flex items-center justify-center ${captionsOn ? "text-white" : "text-white/60"
                            }`}
                    >
                        <Captions className="w-5 h-5" />
                    </button>

                    {/* cài đặt: độ phân giải & tốc độ phát */}
                    <div className="relative shrink-0 w-8 h-8 flex items-center justify-center">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSettingsView(settingsView ? null : "menu");
                            }}
                            aria-label="settings"
                            className="w-8 h-8 flex items-center justify-center"
                        >
                            <Settings className="w-5 h-5" />
                        </button>

                        {settingsView && (
                            <div
                                className="absolute bottom-8 right-0 bg-black/90 rounded-lg py-1 min-w-[130px] text-xs shadow-lg overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {settingsView === "menu" && (
                                    <>
                                        <button
                                            onClick={() => setSettingsView("speed")}
                                            className="flex justify-between w-full px-3 py-2 hover:bg-white/10 text-white"
                                        >
                                            <span>Tốc độ phát</span>
                                            <span className="text-white/50">{speed}x</span>
                                        </button>
                                        <button
                                            onClick={() => setSettingsView("quality")}
                                            className="flex justify-between w-full px-3 py-2 hover:bg-white/10 text-white"
                                        >
                                            <span>Độ phân giải</span>
                                            <span className="text-white/50">{currentQuality.label}</span>
                                        </button>
                                    </>
                                )}

                                {settingsView === "speed" && (
                                    <>
                                        <button
                                            onClick={() => setSettingsView("menu")}
                                            className="w-full text-left px-3 py-1.5 text-white/60 border-b border-white/10"
                                        >
                                            ‹ Quay lại
                                        </button>
                                        {SPEEDS.map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => changeSpeed(s)}
                                                className={`block w-full text-left px-3 py-1.5 hover:bg-white/10 ${s === speed ? "text-yellow-400" : "text-white"
                                                    }`}
                                            >
                                                {s}x
                                            </button>
                                        ))}
                                    </>
                                )}

                                {settingsView === "quality" && (
                                    <>
                                        <button
                                            onClick={() => setSettingsView("menu")}
                                            className="w-full text-left px-3 py-1.5 text-white/60 border-b border-white/10"
                                        >
                                            ‹ Quay lại
                                        </button>
                                        {qualityList.map((q) => (
                                            <button
                                                key={q.label}
                                                onClick={() => changeQuality(q)}
                                                className={`block w-full text-left px-3 py-1.5 hover:bg-white/10 ${q.label === currentQuality.label ? "text-yellow-400" : "text-white"
                                                    }`}
                                            >
                                                {q.label}
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* âm lượng — thanh trượt dạng đứng */}
                    <div className="relative shrink-0 w-8 h-8 flex items-center justify-center group">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleMute();
                            }}
                            aria-label="volume"
                            className="w-8 h-8 flex items-center justify-center"
                        >
                            {muted || volume === 0 ? (
                                <VolumeX className="w-5 h-5" />
                            ) : volume < 0.5 ? (
                                <Volume1 className="w-5 h-5" />
                            ) : (
                                <Volume2 className="w-5 h-5" />
                            )}
                        </button>

                        {/* vùng bọc kèm đệm dưới để chuột lướt từ nút lên thanh trượt không bị mất hover */}
                        <div
                            className="absolute bottom-full left-1/2 -translate-x-1/2 pb-2 opacity-0 invisible
              group-hover:opacity-100 group-hover:visible transition-opacity duration-150"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-black/90 rounded-lg p-2.5 flex flex-col items-center gap-2 shadow-lg">
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    value={muted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="volume-slider-vertical accent-white cursor-pointer"
                                />
                                <span className="text-[10px] tabular-nums text-white/70">
                                    {Math.round((muted ? 0 : volume) * 100)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* phóng to / thu nhỏ */}
                    <button
                        onClick={toggleFullscreen}
                        aria-label="fullscreen"
                        className="shrink-0 w-8 h-8 flex items-center justify-center"
                    >
                        {isFullscreen ? (
                            <Minimize className="w-5 h-5" />
                        ) : (
                            <Maximize className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>

            <style jsx>{`
                .volume-slider-vertical {
                    -webkit-appearance: slider-vertical;
                    writing-mode: vertical-lr;
                    direction: rtl;
                    width: 4px;
                    height: 80px;
                }
            `}</style>
        </div>
    );
}
