import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getVideoFeed, incrementVideoView } from '../../services/videoApi';
import { toggleLike, getLikesCount } from '../../services/activityApi';
import { useAuthStore } from '../../store/authStore';

const VideoCard = ({ video, isActive }) => {
    const videoRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    // Social State
    const [isLiked, setIsLiked] = useState(false); // Ideally fetch from DB if user liked
    const [likesCount, setLikesCount] = useState(video.likes_count || 0);

    const { user } = useAuthStore();

    useEffect(() => {
        if (isActive && videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(e => console.log('Autoplay blocked', e));
            setIsPlaying(true);
            incrementVideoView(video.id);
        } else if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isActive, video.id]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleLike = async () => {
        if (!user) return;

        // Optimistic Update
        const newStatus = !isLiked;
        setIsLiked(newStatus);
        setLikesCount(prev => newStatus ? prev + 1 : prev - 1);

        const { error } = await toggleLike(video.id, user.id);
        if (error) {
            // Revert
            setIsLiked(!newStatus);
            setLikesCount(prev => newStatus ? prev - 1 : prev + 1);
            console.error(error);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: video.title,
                    text: video.description,
                    url: window.location.href // Or deep link to video
                });
            } catch (error) {
                console.log('Error sharing', error);
            }
        } else {
            alert('Compartilhamento não suportado neste navegador.');
        }
    };

    return (
        <div className="relative w-full h-full bg-black snap-start shrink-0">
            {/* Video Player */}
            <video
                ref={videoRef}
                src={video.video_url}
                className="w-full h-full object-cover"
                loop
                muted={isMuted}
                playsInline
                onClick={togglePlay}
                poster={video.thumbnail_url}
            />

            {/* Overlay Info */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none" />

            <div className="absolute bottom-20 left-4 right-16 text-white z-10 pointer-events-auto">
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-[#13ec5b] text-black font-bold text-xs rounded-md uppercase">
                        {video.category}
                    </span>
                </div>
                <h3 className="font-bold text-lg leading-tight mb-1">{video.title}</h3>
                <p className="text-sm opacity-90 line-clamp-2">{video.description}</p>

                {/* Author info if any */}
                {video.users && (
                    <div className="flex items-center gap-2 mt-3">
                        <div className="size-6 rounded-full bg-gray-600 overflow-hidden">
                            {video.users.avatar_url && <img src={video.users.avatar_url} className="w-full h-full object-cover" />}
                        </div>
                        <span className="text-xs font-bold">{video.users.name || 'FitCrat Coach'}</span>
                    </div>
                )}
            </div>

            {/* Side Actions */}
            <div className="absolute bottom-24 right-2 text-white flex flex-col items-center gap-6 z-10 pointer-events-auto">
                <button
                    className="flex flex-col items-center gap-1 group"
                    onClick={handleLike}
                >
                    <div className="size-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center transition-transform active:scale-90">
                        <span className={`material-symbols-outlined text-2xl ${isLiked ? 'text-red-500 icon-filled' : ''}`}>favorite</span>
                    </div>
                    <span className="text-xs font-bold">{likesCount}</span>
                </button>

                <button className="flex flex-col items-center gap-1 group">
                    <div className="size-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center transition-transform active:scale-90">
                        <span className="material-symbols-outlined text-2xl">chat</span>
                    </div>
                    <span className="text-xs font-bold">0</span>
                </button>

                <button
                    className="flex flex-col items-center gap-1 group"
                    onClick={handleShare}
                >
                    <div className="size-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center transition-transform active:scale-90">
                        <span className="material-symbols-outlined text-2xl">share</span>
                    </div>
                    <span className="text-xs font-bold">Share</span>
                </button>

                <button
                    className="flex flex-col items-center gap-1 group"
                    onClick={() => setIsMuted(!isMuted)}
                >
                    <div className="size-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center transition-transform active:scale-90">
                        <span className="material-symbols-outlined text-2xl">
                            {isMuted ? 'volume_off' : 'volume_up'}
                        </span>
                    </div>
                </button>
            </div>

            {/* Play/Pause Indicator */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/50 p-4 rounded-full backdrop-blur-sm">
                        <span className="material-symbols-outlined text-4xl text-white">play_arrow</span>
                    </div>
                </div>
            )}
        </div>
    );
};

const VideoFeed = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeVideoIndex, setActiveVideoIndex] = useState(0);
    const containerRef = useRef(null);

    useEffect(() => {
        loadVideos();
    }, []);

    const loadVideos = async () => {
        setLoading(true);
        const { data } = await getVideoFeed();
        if (data) setVideos(data);
        setLoading(false);
    };

    const handleScroll = () => {
        if (!containerRef.current) return;

        const { scrollTop, clientHeight } = containerRef.current;
        const index = Math.round(scrollTop / clientHeight);

        if (activeVideoIndex !== index) {
            setActiveVideoIndex(index);
        }
    };

    return (
        <div className="bg-black h-screen w-full relative">
            {loading ? (
                <div className="flex h-full items-center justify-center text-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#13ec5b]"></div>
                </div>
            ) : videos.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-white text-center px-6">
                    <div className="text-6xl mb-4">📹</div>
                    <h2 className="text-xl font-bold mb-2">Sem vídeos ainda</h2>
                    <p className="text-gray-400">Volte mais tarde para ver dicas exclusivas.</p>
                </div>
            ) : (
                <div
                    ref={containerRef}
                    className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
                    onScroll={handleScroll}
                >
                    {videos.map((video, index) => (
                        <div key={video.id} className="h-full w-full snap-start">
                            <VideoCard
                                video={video}
                                isActive={index === activeVideoIndex}
                            />
                        </div>
                    ))}

                    {/* Bottom Padding for Nav */}
                    <div className="h-16 w-full snap-start bg-black"></div>
                </div>
            )}

            {/* Top Bar Overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 pointer-events-none">
                <h1 className="text-white font-bold text-lg drop-shadow-md">Dicas</h1>
                <button className="pointer-events-auto size-10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white drop-shadow-md">search</span>
                </button>
            </div>
        </div>
    );
};

export default VideoFeed;
