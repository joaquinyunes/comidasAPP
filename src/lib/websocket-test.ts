// ============================================
// WEBSOCKET TEST - Herramienta de debugging
// ============================================

interface WSTestEvent {
  tipo: string;
  payload: Record<string, unknown>;
}

export class WebSocketTester {
  private ws: WebSocket | null = null;
  private url: string;
  private logs: { time: string; direction: "in" | "out" | "error"; data: string }[] = [];
  private onLog?: (log: (typeof this.logs)[0]) => void;

  constructor(url?: string) {
    this.url = url || `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws`;
  }

  connect(token?: string) {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.addLog("in", "Conectado al servidor WebSocket");
      if (token) {
        this.send({ tipo: "auth", token });
      }
    };

    this.ws.onmessage = (event) => {
      this.addLog("in", event.data);
    };

    this.ws.onerror = (event) => {
      this.addLog("error", "Error en conexión WebSocket");
    };

    this.ws.onclose = (event) => {
      this.addLog("in", `Desconectado (código: ${event.code}, razón: ${event.reason})`);
    };
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
  }

  send(event: WSTestEvent | Record<string, unknown>) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.addLog("error", "No hay conexión WebSocket activa");
      return false;
    }
    const data = JSON.stringify(event);
    this.ws.send(data);
    this.addLog("out", data);
    return true;
  }

  suscribir(eventos: string[]) {
    return this.send({ tipo: "suscribir", eventos });
  }

  testPedidoNuevo(pedidoId?: string) {
    return this.send({
      tipo: "pedido:nuevo",
      pedido: {
        id: pedidoId || `test-${Date.now()}`,
        mesaNumero: "TEST-1",
        sector: "cocina",
        mozo: "Tester",
        items: [
          {
            id: `item-${Date.now()}`,
            nombre: "Pizza Test",
            cantidad: 1,
            notas: "Generado por tester",
            estado: "recibido",
          },
        ],
        tiempoEspera: 0,
        prioridad: "normal",
      },
    });
  }

  testItemEstado(pedidoId: string, itemId: string, estado: string) {
    return this.send({ tipo: "kds:completar", pedidoId, itemId });
  }

  testPago(pedidoId: string) {
    return this.send({
      tipo: "pago:procesar",
      pedidoId,
      metodo: "efectivo",
      monto: 1500,
    });
  }

  onMessage(callback: (log: (typeof this.logs)[0]) => void) {
    this.onLog = callback;
  }

  getLogs() {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  private addLog(direction: "in" | "out" | "error", data: string) {
    const entry = {
      time: new Date().toLocaleTimeString("es-AR"),
      direction,
      data,
    };
    this.logs.push(entry);
    this.onLog?.(entry);
    if (this.logs.length > 200) {
      this.logs = this.logs.slice(-200);
    }
  }
}

// Función de utilidad para testing rápido desde consola
export function debugWS() {
  const tester = new WebSocketTester();
  tester.onMessage((log) => {
    const style = log.direction === "out"
      ? "color: blue"
      : log.direction === "error"
        ? "color: red"
        : "color: green";
    console.log(`%c[${log.time}] ${log.direction.toUpperCase()}: ${log.data}`, style);
  });
  tester.connect();
  (window as any).__wsTester = tester;
  console.log("🔌 WebSocketTester conectado. Usá window.__wsTester para interactuar.");
  return tester;
}
