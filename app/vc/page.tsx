"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { createPeerConnection } from "../utils/webrtc";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

export default function VideoCallPage() {
    const roomId = "room1";
    const localRef = useRef<HTMLVideoElement>(null);
    const remoteRef = useRef<HTMLVideoElement>(null);
    const pcRef = useRef<RTCPeerConnection>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [remoteUserConnected, setRemoteUserConnected] = useState(false);

    useEffect(() => {
        const start = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (localRef.current) localRef.current.srcObject = stream;

                const pc = createPeerConnection();
                pcRef.current = pc;

                stream.getTracks().forEach((track) => pc.addTrack(track, stream));

                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.emit("ice-candidate", { roomId, candidate: event.candidate });
                    }
                };

                pc.ontrack = (event) => {
                    if (remoteRef.current) {
                        remoteRef.current.srcObject = event.streams[0];
                        setRemoteUserConnected(true);
                    }
                };

                socket.emit("join-room", roomId);
                setIsConnected(true);

                socket.on("user-joined", async () => {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    socket.emit("offer", { roomId, offer });
                });

                socket.on("offer", async ({ offer }) => {
                    await pc.setRemoteDescription(new RTCSessionDescription(offer));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    socket.emit("answer", { roomId, answer });
                });

                socket.on("answer", async ({ answer }) => {
                    await pc.setRemoteDescription(new RTCSessionDescription(answer));
                });

                socket.on("ice-candidate", async ({ candidate }) => {
                    try {
                        await pc.addIceCandidate(candidate);
                    } catch (e) {
                        console.error("Error adding received ice candidate", e);
                    }
                });
            } catch (error) {
                console.error("Error accessing media devices:", error);
            }
        };

        start();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white">
            {/* Header */}
            <div className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Video Consultation Room
                    </h1>
                    <div className="mt-2 flex items-center justify-center space-x-2">
                        <span className="text-sm sm:text-base text-gray-400">Room ID:</span>
                        <span className="text-sm sm:text-base text-emerald-400 font-mono bg-gray-800 px-2 py-1 rounded-md">
                            {roomId}
                        </span>
                    </div>
                </div>
            </div>

            {/* Video Grid Container */}
            <div className="px-4 sm:px-6 lg:px-8 pb-8">
                <div className="max-w-7xl mx-auto">
                    {/* Desktop/Tablet Layout */}
                    <div className="hidden sm:grid sm:grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Local Video */}
                        <div className="relative group">
                            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-700 hover:border-blue-500 transition-all duration-300">
                                <div className="aspect-video relative">
                                    <video
                                        ref={localRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold">You</span>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                            <span className="text-xs text-gray-200">Live</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Remote Video */}
                        <div className="relative group">
                            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-700 hover:border-emerald-500 transition-all duration-300">
                                <div className="aspect-video relative">
                                    {!remoteUserConnected && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                            <div className="text-center">
                                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                                                    <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <p className="text-gray-400 text-sm">Waiting for remote user...</p>
                                            </div>
                                        </div>
                                    )}
                                    <video
                                        ref={remoteRef}
                                        autoPlay
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold">Remote User</span>
                                        <div className="flex items-center space-x-2">
                                            {remoteUserConnected ? (
                                                <>
                                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                    <span className="text-xs text-gray-200">Connected</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                    <span className="text-xs text-gray-200">Waiting...</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="sm:hidden space-y-4">
                        {/* Remote Video (Primary on mobile) */}
                        <div className="relative">
                            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
                                <div className="aspect-video relative">
                                    {!remoteUserConnected && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                            <div className="text-center">
                                                <div className="w-12 h-12 mx-auto mb-3 bg-gray-700 rounded-full flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <p className="text-gray-400 text-xs">Waiting for remote user...</p>
                                            </div>
                                        </div>
                                    )}
                                    <video
                                        ref={remoteRef}
                                        autoPlay
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold">Remote User</span>
                                        <div className="flex items-center space-x-1">
                                            {remoteUserConnected ? (
                                                <>
                                                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                                                    <span className="text-xs text-gray-200">Connected</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
                                                    <span className="text-xs text-gray-200">Waiting...</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Local Video (Picture-in-Picture style on mobile) */}
                        <div className="relative">
                            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
                                <div className="aspect-video relative">
                                    <video
                                        ref={localRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold">You</span>
                                        <div className="flex items-center space-x-1">
                                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                                            <span className="text-xs text-gray-200">Live</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Status */}
            <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm border-t border-gray-800 p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full animate-pulse ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                <span className="text-sm font-medium">
                                    {isConnected ? 'Connected to server' : 'Disconnected'}
                                </span>
                            </div>
                            <div className="w-px h-4 bg-gray-600"></div>
                            <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full animate-pulse ${remoteUserConnected ? 'bg-emerald-400' : 'bg-yellow-400'}`}></div>
                                <span className="text-sm font-medium">
                                    {remoteUserConnected ? 'Remote user connected' : 'Waiting for remote user'}
                                </span>
                            </div>
                        </div>

                        <div className="text-xs text-gray-400">
                            WebRTC Video Call • End-to-End Encrypted
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}