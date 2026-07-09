import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../config/constants.dart';
import 'auth_service.dart';

class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;
  SocketService._internal();

  IO.Socket? _socket;
  final AuthService _auth = AuthService();
  final StreamController<Map<String, dynamic>> _eventController =
      StreamController.broadcast();

  Stream<Map<String, dynamic>> get events => _eventController.stream;
  bool get isConnected => _socket?.connected ?? false;

  void connect() {
    if (_socket?.connected == true) return;

    _socket = IO.io(
      AppConstants.socketUrl,
      IO.OptionBuilder()
          .setAuth({
            'token': _auth.token,
            'tenantId': _auth.tenantId,
          })
          .setTransports(['websocket'])
          .enableAutoConnect()
          .build(),
    );

    _socket!.onConnect((_) {
      print('[Socket] Connected');
    });

    _socket!.onDisconnect((_) {
      print('[Socket] Disconnected');
    });

    _socket!.onError((error) {
      print('[Socket] Error: $error');
    });

    _socket!.on('mesa:estado_cambiado', (data) {
      _eventController.add({'type': 'mesa:estado_cambiado', 'data': data});
    });

    _socket!.on('pedido:nuevo', (data) {
      _eventController.add({'type': 'pedido:nuevo', 'data': data});
    });

    _socket!.on('pedido:item_listo', (data) {
      _eventController.add({'type': 'pedido:item_listo', 'data': data});
    });

    _socket!.on('stock:critico', (data) {
      _eventController.add({'type': 'stock:critico', 'data': data});
    });

    _socket!.on('notificacion:nueva', (data) {
      _eventController.add({'type': 'notificacion:nueva', 'data': data});
    });
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
  }

  void emit(String event, dynamic data) {
    _socket?.emit(event, data);
  }

  void on(String event, Function(dynamic) callback) {
    _socket?.on(event, callback);
  }

  void off(String event) {
    _socket?.off(event);
  }

  void dispose() {
    disconnect();
    _eventController.close();
  }
}
