import '../models/pedido.dart';
import '../models/producto.dart';
import 'api_service.dart';

class PedidoService {
  static final PedidoService _instance = PedidoService._internal();
  factory PedidoService() => _instance;
  PedidoService._internal();

  final ApiService _api = ApiService();

  Future<List<Producto>> getMenuPublico() async {
    final response = await _api.get('/api/productos/publico');
    final data = response['data'] ?? response;
    return (data as List).map((p) => Producto.fromJson(p)).toList();
  }

  Future<List<Categoria>> getCategorias() async {
    final response = await _api.get('/api/categorias');
    final data = response['data'] ?? response;
    return (data as List).map((c) => Categoria.fromJson(c)).toList();
  }

  Future<Pedido> crearPedido({
    required String sucursalId,
    String? mesaId,
    String? clienteId,
    required List<Map<String, dynamic>> items,
    String? notas,
    String tipo = 'mesa',
  }) async {
    final response = await _api.post('/api/pedidos', body: {
      'sucursal_id': sucursalId,
      if (mesaId != null) 'mesa_id': mesaId,
      if (clienteId != null) 'cliente_id': clienteId,
      'tipo': tipo,
      if (notas != null) 'notas': notas,
      'items': items,
    });
    return Pedido.fromJson(response['data'] ?? response);
  }

  Future<List<Pedido>> getPedidos({String? estado, String? sucursalId}) async {
    final params = <String, String>{};
    if (estado != null) params['estado'] = estado;
    if (sucursalId != null) params['sucursal_id'] = sucursalId;

    final response = await _api.get('/api/pedidos', queryParams: params);
    final data = response['data'] ?? response;
    return (data as List).map((p) => Pedido.fromJson(p)).toList();
  }

  Future<Pedido> getPedido(String id) async {
    final response = await _api.get('/api/pedidos/$id');
    return Pedido.fromJson(response['data'] ?? response);
  }

  Future<Pedido> cambiarEstadoPedido(String id, String estado) async {
    final response = await _api.put('/api/pedidos/$id/estado', body: {
      'estado': estado,
    });
    return Pedido.fromJson(response['data'] ?? response);
  }

  Future<Pedido> cambiarEstadoItem(
      String pedidoId, String itemId, String estado) async {
    final response = await _api.put(
      '/api/pedidos/$pedidoId/items/$itemId/estado',
      body: {'estado': estado},
    );
    return Pedido.fromJson(response['data'] ?? response);
  }

  Future<List<PedidoEvento>> getTimeline(String pedidoId) async {
    final response = await _api.get('/api/pedidos/$pedidoId/timeline');
    final data = response['data'] ?? response;
    return (data as List).map((e) => PedidoEvento.fromJson(e)).toList();
  }
}
