import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

type ChatMessage = {
  id: string;
  senderId: string;
  timestamp: string; // ISO string
  text: string;
};

const STORAGE_KEYS = {
  clientId: "chat_client_id",
};

function getOrCreateClientId(): string {
  const existing = localStorage.getItem(STORAGE_KEYS.clientId);
  if (existing) return existing;
  const id =
    (globalThis.crypto as Crypto | undefined)?.randomUUID?.() ??
    `client_${Math.random().toString(16).slice(2)}_${Date.now()}`;
  localStorage.setItem(STORAGE_KEYS.clientId, id);
  return id;
}

export default function ChatPage() {
  const clientId = useMemo(() => getOrCreateClientId(), []);

  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());

  const socketUrl = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:3000";

  useEffect(() => {
    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected:", socket.id);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket.IO connect_error:", err?.message ?? err);
    });

    socket.on("chat:message", (payload: ChatMessage) => {
      // Dedupe for the optimistic-send case.
      if (seenMessageIdsRef.current.has(payload.id)) return;
      seenMessageIdsRef.current.add(payload.id);

      setMessages((prev) => [...prev, payload]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [socketUrl]);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSend = () => {
    const text = messageText.trim();
    if (!text) return;

    const id =
      (globalThis.crypto as Crypto | undefined)?.randomUUID?.() ??
      `msg_${Math.random().toString(16).slice(2)}_${Date.now()}`;

    const payload: ChatMessage = {
      id,
      senderId: clientId,
      timestamp: new Date().toISOString(),
      text,
    };

    // Optimistic UI (instant in sender), but we dedupe when server echoes back.
    seenMessageIdsRef.current.add(id);
    setMessages((prev) => [...prev, payload]);

    socketRef.current?.emit("chat:message", payload);
    setMessageText("");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h1 className="text-2xl font-bold">Chat</h1>
          <div className="text-sm text-gray-600">
            {isConnected ? "Connected" : "Connecting..."}
          </div>
        </div>

        <div className="h-[420px] overflow-y-auto border rounded-lg p-3 bg-gray-50 space-y-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={
                m.senderId === clientId
                  ? "flex justify-end"
                  : "flex justify-start"
              }
            >
              <div
                className={
                  m.senderId === clientId
                    ? "max-w-[80%] bg-blue-600 text-white rounded-lg px-3 py-2"
                    : "max-w-[80%] bg-gray-200 text-gray-900 rounded-lg px-3 py-2"
                }
              >
                <div className="text-xs opacity-90 mb-1">
                  {m.senderId.slice(0, 8)} • {formatTime(m.timestamp)}
                </div>
                <div className="whitespace-pre-wrap break-words">{m.text}</div>
              </div>
            </div>
          ))}
          {messages.length === 0 ? (
            <div className="text-gray-500 text-sm">
              No messages yet. Send something!
            </div>
          ) : null}
        </div>

        <div className="flex gap-2 mt-4">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-60"
            disabled={!messageText.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

