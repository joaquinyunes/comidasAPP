import 'package:flutter/material.dart';
import '../models/pedido.dart';
import '../services/pedido_service.dart';

class PedidoProvider extends ChangeNotifier {
  final PedidoService _pedidoService = PedidoService();

  List<Pedido> _pedidos = [];
  Pedido? _pedidoActual;
  List<PedidoEvento> _timeline = [];
  List<Pedido> _historial = [];
  bool _isLoading = false;
  String? _error;

  List<Pedido> get pedidos => _pedidos;
  Pedido? get pedidoActual => _pedidoActual;
  List<PedidoEvento> get timeline => _timeline;
  List<Pedido> get historial => _historial;
  bool get isLoading => _isLoading;
  String? get error => _error;

  List<Pedido> get pedidosActivos =>
      _pedidos.where((p) => !['cerrado', 'cancelado'].contains(p.estado)).toList();

  Future<void> loadPedidos({String? estado, String? sucursalId}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _pedidos = await _pedidoService.getPedidos(
        estado: estado,
        sucursalId: sucursalId,
      );
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadPedido(String id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _pedidoActual = await _pedidoService.getPedido(id);
      _timeline = await _pedidoService.getTimeline(id);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<Pedido?> crearPedido({
    required String sucursalId,
    String? mesaId,
    String? clienteId,
    required List<Map<String, dynamic>> items,
    String? notas,
    String tipo = 'mesa',
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final pedido = await _pedidoService.crearPedido(
        sucursalId: sucursalId,
        mesaId: mesaId,
        clienteId: clienteId,
        items: items,
        notas: notas,
        tipo: tipo,
      );
      _pedidos.insert(0, pedido);
      notifyListeners();
      return pedido;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> cambiarEstado(String pedidoId, String estado) async {
    try {
      final updated = await _pedidoService.cambiarEstadoPedido(pedidoId, estado);
      final index = _pedidos.indexWhere((p) => p.id == pedidoId);
      if (index >= 0) _pedidos[index] = updated;
      if (_pedidoActual?.id == pedidoId) _pedidoActual = updated;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  void actualizarPedidoRealtime(Map<String, dynamic> data) {
    final pedido = Pedido.fromJson(data);
    final index = _pedidos.indexWhere((p) => p.id == pedido.id);
    if (index >= 0) {
      _pedidos[index] = pedido;
    } else {
      _pedidos.insert(0, pedido);
    }
    if (_pedidoActual?.id == pedido.id) {
      _pedidoActual = pedido;
    }
    notifyListeners();
  }

  void actualizarItemRealtime(String pedidoId, String itemId, String estado) {
    final index = _pedidos.indexWhere((p) => p.id == pedidoId);
    if (index >= 0) {
      final pedido = _pedidos[index];
      final items = pedido.items.map((item) {
        if (item.id == itemId) {
          return PedidoItem(
            id: item.id,
            pedidoId: item.pedidoId,
            productoId: item.productoId,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            subtotal: item.subtotal,
            notas: item.notas,
            estado: estado,
            productoNombre: item.productoNombre,
            productoImagen: item.productoImagen,
          );
        }
        return item;
      }).toList();
      _pedidos[index] = Pedido(
        id: pedido.id,
        tenantId: pedido.tenantId,
        sucursalId: pedido.sucursalId,
        mesaId: pedido.mesaId,
        clienteId: pedido.clienteId,
        mozoId: pedido.mozoId,
        estado: pedido.estado,
        tipo: pedido.tipo,
        notas: pedido.notas,
        total: pedido.total,
        items: items,
        createdAt: pedido.createdAt,
        updatedAt: DateTime.now(),
      );
    }
    notifyListeners();
  }
}
