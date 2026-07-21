// ============================================
// WEBSOCKET CLIENT - Reconexión robusta
// ============================================

type WSEventHandler = (data: any) => void;

interface WSClientOptions {
  url?: string;
  token?: string;
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
}

export class WSClient {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, WSEventHandler[]>();
  private url: string;
  private token?: string;
  private retryCount = 0;
  private maxRetries: number;
  private baseDelay: number;
  private maxDelay: number;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalClose = false;
  private connected = false;

  constructor(options: WSClientOptions = {}) {
    const protocol = typeof window !== "undefined"
      ? window.location.protocol === "https:" ? "wss:" : "ws:"
      : "ws:";
    const host = typeof window !== "undefined" ? window.location.host : "localhost:3000";

    this.url = options.url || `${protocol}//${host}/ws`;
    this.token = options.token;
    this.maxRetries = options.maxRetries ?? 10;
    this.baseDelay = options.baseDelay ?? 1000;
    this.maxDelay = options.maxDelay ?? 30000;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.intentionalClose = false;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.connected = true;
        this.retryCount = 0;
        console.log("[WS] Conectado");

        if (this.token) {
          this.ws!.send(JSON.stringify({ tipo: "auth", token: this.token }));
        }

        this.emit("connected", null);
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.tipo) {
            this.emit(msg.tipo, msg);
          }
        } catch {}
      };

      this.ws.onclose = (event) => {
        this.connected = false;
        console.log(`[WS] Desconectado (código: ${event.code})`);

        if (!this.intentionalClose) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch (err) {
      console.error("[WS] Error creando conexión:", err);
      this.scheduleReconnect();
    }
  }

  disconnect() {
    this.intentionalClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
    this.connected = false;
  }

  send(data: Record<string, unknown>) {
    if (!this.connected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("[WS] No conectado, mensaje no enviado");
      return false;
    }
    this.ws.send(JSON.stringify(data));
    return true;
  }

  on(event: string, handler: WSEventHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
    return () => {
      const list = this.handlers.get(event);
      if (list) {
        const idx = list.indexOf(handler);
        if (idx >= 0) list.splice(idx, 1);
      }
    };
  }

  isConnected() {
    return this.connected;
  }

  private emit(event: string, data: any) {
    const list = this.handlers.get(event);
    if (list) {
      list.forEach((handler) => {
        try { handler(data); } catch (err) { console.error(`[WS] Error handler ${event}:`, err); }
      });
    }
  }

  private scheduleReconnect() {
    if (this.retryCount >= this.maxRetries) {
      console.error(`[WS] Máximo de reintentos alcanzado (${this.maxRetries})`);
      this.emit("maxRetriesReached", null);
      return;
    }

    const delay = Math.min(this.baseDelay * Math.pow(2, this.retryCount), this.maxDelay);
    const jitter = delay * 0.1 * Math.random();

    console.log(`[WS] Reconnecting en ${(delay + jitter).toFixed(0)}ms (intento ${this.retryCount + 1}/${this.maxRetries})`);

    this.reconnectTimer = setTimeout(() => {
      this.retryCount++;
      this.connect();
    }, delay + jitter);
  }
}

// Instancia singleton para uso global
let globalClient: WSClient | null = null;

export function getWSClient(options?: WSClientOptions): WSClient {
  if (!globalClient) {
    globalClient = new WSClient(options);
  }
  return globalClient;
}

export function resetWSClient() {
  globalClient?.disconnect();
  globalClient = null;
}
