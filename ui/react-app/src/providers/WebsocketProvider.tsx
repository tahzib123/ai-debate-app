import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import useWebSocket from "react-use-websocket";

type MessageListener = (event: MessageEvent) => void;

export interface WebSocketProviderProps {
  url: string;
  protocols?: string | string[];
  reconnectAttempts?: number; // how many times to try reconnecting
  reconnectInterval?: number; // ms between reconnection attempts
  children: React.ReactNode;
  share?: boolean; // forward to react-use-websocket options (share socket between hooks)
}

export interface WebSocketContextValue {
  sendMessage: (message: string) => void;
  sendJsonMessage: (payload: any) => void;
  lastMessage: MessageEvent | null;
  readyState: number;
  isOpen: boolean;
  close: (code?: number, reason?: string) => void;
  subscribe: (listener: MessageListener) => () => void;
  reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(
  undefined
);

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  url,
  protocols,
  reconnectAttempts = Infinity,
  reconnectInterval = 3000,
  children,
  share = true,
}) => {
  // message listeners registry
  const listenersRef = useRef<Set<MessageListener>>(new Set());

  const {
    sendMessage,
    sendJsonMessage,
    lastMessage,
    readyState,
    getWebSocket,
    // the hook automatically handles onOpen/onClose/onError callbacks via options if you want them
  } = useWebSocket(
    url,
    {
      share,
      retryOnError: true,
      reconnectAttempts,
      // react-use-websocket expects a number for reconnectInterval (ms)
      reconnectInterval,
      // Let the hook do automatic reconnects; more advanced logic can be added here
    },
    protocols ? ({ protocols } as any) : undefined
  );

  // Forward incoming messages to registered listeners
  useEffect(() => {
    if (!lastMessage) return;
    for (const listener of listenersRef.current) {
      try {
        listener(lastMessage);
      } catch (err) {
        // swallow listener errors so one bad listener doesn't break others
        // optionally log here
        // console.error("ws listener error", err);
      }
    }
  }, [lastMessage]);

  const subscribe = useCallback((listener: MessageListener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const close = useCallback(
    (code?: number, reason?: string) => {
      const ws = getWebSocket?.(); // may be undefined if not connected yet
      if (ws) {
        ws.close(code, reason);
      }
    },
    [getWebSocket]
  );

  // reconnect helper — tries to close and rely on the hook's reconnect logic
  const reconnect = useCallback(() => {
    const ws = getWebSocket?.();
    if (ws && ws.readyState !== WebSocket.CLOSED) {
      try {
        ws.close();
      } catch (e) {
        /* ignore */
      }
    }
    // hook will attempt to reconnect according to its options
  }, [getWebSocket]);

  const value = useMemo<WebSocketContextValue>(
    () => ({
      sendMessage: (message: string) => sendMessage(message),
      sendJsonMessage: (payload: any) => sendJsonMessage(payload),
      lastMessage: lastMessage ?? null,
      readyState,
      isOpen: readyState === WebSocket.OPEN,
      close,
      subscribe,
      reconnect,
    }),
    [
      sendMessage,
      sendJsonMessage,
      lastMessage,
      readyState,
      close,
      subscribe,
      reconnect,
    ]
  );

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Hook to consume the context
export const useWebSocketClient = (): WebSocketContextValue => {
  const ctx = useContext(WebSocketContext);
  if (!ctx)
    throw new Error(
      "useWebSocketClient must be used inside a WebSocketProvider"
    );
  return ctx;
};
