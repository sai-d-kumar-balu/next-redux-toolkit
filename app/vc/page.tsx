'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import SimplePeer from 'simple-peer';
import { Phone, PhoneCall, PhoneOff, Video, VideoOff, Mic, MicOff, Settings, Users, Copy, Check } from 'lucide-react';

const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string, {
    transports: ['websocket'],
});

interface IncomingCallInfo {
    isSomeoneCalling: boolean;
    from: string;
    signalData: SimplePeer.SignalData;
}

export default function VideoCallPage() {
    const myVideoRef = useRef<HTMLVideoElement | null>(null);
    const peerVideoRef = useRef<HTMLVideoElement | null>(null);
    const connectionRef = useRef<SimplePeer.Instance | null>(null);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [userId, setUserId] = useState('');
    const [isCallAccepted, setIsCallAccepted] = useState(false);
    const [incominCallInfo, setIncominCallInfo] = useState<IncomingCallInfo | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((mediaStream) => {
                setStream(mediaStream);
                if (myVideoRef.current) {
                    myVideoRef.current.srcObject = mediaStream;
                }
            })
            .catch((error) => console.error('Error accessing media devices:', error));

        socket.on('incomingCall', handleIncomingCall);
        socket.on('callEnded', destroyConnection);

        return () => {
            socket.off('incomingCall', handleIncomingCall);
            socket.off('callEnded', destroyConnection);
        };
    }, []);

    const copyToClipboard = async (text: any) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const handleIncomingCall = ({
        from,
        signalData,
    }: {
        from: string;
        signalData: SimplePeer.SignalData;
    }) => {
        setIncominCallInfo({ isSomeoneCalling: true, from, signalData });
    };

    const initiateCall = () => {
        if (!userId) {
            alert('Enter user ID to initiate a call');
            return;
        }

        if (!stream) {
            console.error('No media stream available');
            return;
        }

        const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream: stream,
        });

        peer.on('signal', (signalData) => {
            socket.emit('initiateCall', { userId, signalData, myId: socket?.id });
        });

        peer.on('stream', (remoteStream) => {
            if (peerVideoRef.current) {
                peerVideoRef.current.srcObject = remoteStream;
            }
        });

        socket.on('callAccepted', (signal) => {
            setIsCallAccepted(true);
            peer.signal(signal);
        });

        connectionRef.current = peer;
    };

    const answerCall = () => {
        if (!stream || !incominCallInfo) return;

        setIsCallAccepted(true);

        const peer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream: stream,
        });

        peer.on('signal', (signal) => {
            socket.emit('answerCall', {
                signal,
                to: incominCallInfo.from,
            });
        });

        peer.on('stream', (remoteStream) => {
            if (peerVideoRef.current) {
                peerVideoRef.current.srcObject = remoteStream;
            }
        });

        peer.signal(incominCallInfo.signalData);

        connectionRef.current = peer;
    };

    const endCall = () => {
        if (incominCallInfo) {
            socket.emit('endCall', { to: incominCallInfo.from });
        }
        destroyConnection();
    };

    const destroyConnection = () => {
        connectionRef.current?.destroy();
        connectionRef.current = null;

        if (peerVideoRef.current) {
            peerVideoRef.current.srcObject = null;
        }

        setIsCallAccepted(false);
        setIncominCallInfo(null);
    };

    const toggleVideo = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
            }
        }
    };

    const toggleAudio = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);
            }
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 text-white p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <Video className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            VideoConnect Pro
                        </h1>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <Users className="w-6 h-6" />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className={`${isSidebarOpen ? 'block' : 'hidden'} md:block w-80 bg-black/30 backdrop-blur-lg border-r border-white/10 p-6`}>
                    <div className="space-y-8">
                        {/* User Info */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                            <h2 className="text-lg font-semibold mb-4 text-white flex items-center">
                                <Users className="w-5 h-5 mr-2 text-purple-400" />
                                Your Identity
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-300 mb-1">Your ID:</p>
                                    <div className="flex items-center space-x-2">
                                        <p className="font-mono text-purple-300 bg-black/30 px-3 py-2 rounded-lg text-sm flex-1 truncate">
                                            {socket?.id}
                                        </p>
                                        <button
                                            onClick={() => copyToClipboard(socket?.id)}
                                            className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-colors"
                                        >
                                            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-purple-400" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-gray-400">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span>Online</span>
                                </div>
                            </div>
                        </div>

                        {/* Call Controls */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                            <h2 className="text-lg font-semibold mb-4 text-white flex items-center">
                                <PhoneCall className="w-5 h-5 mr-2 text-green-400" />
                                Start Call
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-300 mb-2">Enter User ID:</label>
                                    <input
                                        type="text"
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        placeholder="user_123456789"
                                        className="w-full p-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors"
                                    />
                                </div>
                                <button
                                    onClick={initiateCall}
                                    disabled={!userId}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                                >
                                    <Phone className="w-5 h-5" />
                                    <span>Start Call</span>
                                </button>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                            <h2 className="text-lg font-semibold mb-4 text-white flex items-center">
                                <Settings className="w-5 h-5 mr-2 text-gray-400" />
                                Quick Controls
                            </h2>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={toggleVideo}
                                    className={`p-3 rounded-xl flex items-center justify-center space-x-2 transition-colors ${isVideoEnabled
                                            ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                        }`}
                                >
                                    {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                                </button>
                                <button
                                    onClick={toggleAudio}
                                    className={`p-3 rounded-xl flex items-center justify-center space-x-2 transition-colors ${isAudioEnabled
                                            ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                        }`}
                                >
                                    {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-6">
                    <div className="container mx-auto h-full">
                        {/* Video Container */}
                        <div className="flex flex-col lg:flex-row gap-6 mb-6 h-full">
                            {/* My Video */}
                            <div className="flex-1 bg-black/20 backdrop-blur-lg rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                                <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-white/10">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium text-white flex items-center">
                                            <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                                            You
                                        </h3>
                                        <div className="flex space-x-2">
                                            <div className={`w-2 h-2 rounded-full ${isVideoEnabled ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                            <div className={`w-2 h-2 rounded-full ${isAudioEnabled ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative">
                                    <video
                                        ref={myVideoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-auto max-h-[500px] object-cover"
                                    />
                                    {!isVideoEnabled && (
                                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                            <div className="text-center">
                                                <VideoOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                                <p className="text-gray-400">Camera is off</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Peer Video */}
                            {isCallAccepted && (
                                <div className="flex-1 bg-black/20 backdrop-blur-lg rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                                    <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-b border-white/10">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium text-white flex items-center">
                                                <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                                                {incominCallInfo?.from || userId || 'Peer'}
                                            </h3>
                                            <div className="flex space-x-2">
                                                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <video
                                        ref={peerVideoRef}
                                        autoPlay
                                        playsInline
                                        className="w-full h-auto max-h-[500px] object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Call Controls */}
                        <div className="bg-black/20 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
                            {isCallAccepted ? (
                                <div className="flex justify-center space-x-4">
                                    <button
                                        onClick={toggleVideo}
                                        className={`p-4 rounded-2xl transition-all duration-200 ${isVideoEnabled
                                                ? 'bg-slate-600/50 text-white hover:bg-slate-600/70'
                                                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                            }`}
                                    >
                                        {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                                    </button>
                                    <button
                                        onClick={toggleAudio}
                                        className={`p-4 rounded-2xl transition-all duration-200 ${isAudioEnabled
                                                ? 'bg-slate-600/50 text-white hover:bg-slate-600/70'
                                                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                            }`}
                                    >
                                        {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                                    </button>
                                    <button
                                        onClick={endCall}
                                        className="p-4 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg"
                                    >
                                        <PhoneOff className="w-6 h-6" />
                                    </button>
                                </div>
                            ) : (
                                incominCallInfo?.isSomeoneCalling && (
                                    <div className="text-center">
                                        <div className="mb-6 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-white/10">
                                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Phone className="w-8 h-8 text-white animate-bounce" />
                                            </div>
                                            <p className="text-white text-lg mb-2">Incoming Call</p>
                                            <p className="text-gray-300">
                                                <span className="font-semibold text-purple-300">{incominCallInfo.from}</span> is calling...
                                            </p>
                                        </div>
                                        <div className="flex justify-center space-x-6">
                                            <button
                                                onClick={answerCall}
                                                className="p-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg"
                                            >
                                                <Phone className="w-6 h-6" />
                                            </button>
                                            <button
                                                onClick={destroyConnection}
                                                className="p-4 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg"
                                            >
                                                <PhoneOff className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}