import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = (url: string) => {
    const socketRef = useRef<Socket>(null);

    useEffect(() => {
        const socket = io(url);
        socketRef.current = socket;

        return () => {
            socket.disconnect();
        };
    }, [url]);

    return socketRef.current;
};
