export const createPeerConnection = () => {
    const config = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };
    return new RTCPeerConnection(config);
};
