import { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3001"); // Đổi URL nếu deploy

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [unreadCount, setUnreadCount] = useState(0);
    const [isTabFocused, setIsTabFocused] = useState(true);

    useEffect(() => {
        socket.on("previousMessages", (oldMessages) => {
            setMessages(oldMessages);
        });

        socket.on("newMessage", (msg) => {
            setMessages((prev) => [...prev, msg]);

            if (!isTabFocused) {
                setUnreadCount((count) => count + 1);
                playNotificationSound();
            }
        });

        return () => {
            socket.off("newMessage");
        };
    }, [isTabFocused]);

    useEffect(() => {
        const handleFocus = () => {
            setIsTabFocused(true);
            setUnreadCount(0);
        };
        const handleBlur = () => setIsTabFocused(false);

        window.addEventListener("focus", handleFocus);
        window.addEventListener("blur", handleBlur);

        return () => {
            window.removeEventListener("focus", handleFocus);
            window.removeEventListener("blur", handleBlur);
        };
    }, []);

    useEffect(() => {
        document.title = unreadCount > 0 ? `(${unreadCount}) Chat App` : "Chat App";
    }, [unreadCount]);

    const sendMessage = () => {
        if (message.trim()) {
            socket.emit("sendMessage", message);
            setMessage("");
        }
    };

    const playNotificationSound = () => {
        const audio = new Audio("/noti.wav");
        audio.play().catch((error) => console.error("Audio error:", error));
    };

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-4">
                <h2 className="text-xl font-bold text-center mb-2">Chat Realtime</h2>
                <div className="h-64 overflow-y-auto border p-2">
                    {messages.map((msg, idx) => (
                        <p key={idx} className="text-gray-700 p-1">{msg}</p>
                    ))}
                </div>
                <div className="mt-2 flex">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        className="flex-1 p-2 border rounded-l"
                        placeholder="Nhập tin nhắn..."
                    />
                    <button onClick={sendMessage} className="bg-blue-500 text-white p-2 rounded-r">
                        Gửi
                    </button>
                </div>
            </div>
        </div>
    );
}
