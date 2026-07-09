class Pedido {
  final String id;
  final String tenantId;
  final String sucursalId;
  final String? mesaId;
  final String? clienteId;
  final String? mozoId;
  final String estado;
  final String tipo;
  final String? notas;
  final double total;
  final List<PedidoItem> items;
  final DateTime createdAt;
  final DateTime? updatedAt;

  Pedido({
    required this.id,
    required this.tenantId,
    required this.sucursalId,
    this.mesaId,
    this.clienteId,
    this.mozoId,
    this.estado = 'recibido',
    this.tipo = 'mesa',
    this.notas,
    this.total = 0,
    this.items = const [],
    required this.createdAt,
    this.updatedAt,
  });

  factory Pedido.fromJson(Map<String, dynamic> json) {
    return Pedido(
      id: json['id'] ?? '',
      tenantId: json['tenant_id'] ?? '',
      sucursalId: json['sucursal_id'] ?? '',
      mesaId: json['mesa_id'],
      clienteId: json['cliente_id'],
      mozoId: json['mozo_id'],
      estado: json['estado'] ?? 'recibido',
      tipo: json['tipo'] ?? 'mesa',
      notas: json['notas'],
      total: (json['total'] ?? 0).toDouble(),
      items: json['items'] != null
          ? (json['items'] as List).map((i) => PedidoItem.fromJson(i)).toList()
          : [],
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : null,
    );
  }

  String get estadoLabel {
    switch (estado) {
      case 'recibido':
        return 'Recibido';
      case 'aceptado':
        return 'Aceptado';
      case 'en_preparacion':
        return 'En Preparación';
      case 'listo':
        return 'Listo';
      case 'entregado':
        return 'Entregado';
      case 'cerrado':
        return 'Cerrado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return estado;
    }
  }
}

class PedidoItem {
  final String id;
  final String pedidoId;
  final String productoId;
  final int cantidad;
  final double precioUnitario;
  final double subtotal;
  final String? notas;
  final String estado;
  final String? productoNombre;
  final String? productoImagen;

  PedidoItem({
    required this.id,
    required this.pedidoId,
    required this.productoId,
    this.cantidad = 1,
    required this.precioUnitario,
    required this.subtotal,
    this.notas,
    this.estado = 'recibido',
    this.productoNombre,
    this.productoImagen,
  });

  factory PedidoItem.fromJson(Map<String, dynamic> json) {
    return PedidoItem(
      id: json['id'] ?? '',
      pedidoId: json['pedido_id'] ?? '',
      productoId: json['producto_id'] ?? '',
      cantidad: json['cantidad'] ?? 1,
      precioUnitario: (json['precio_unitario'] ?? 0).toDouble(),
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      notas: json['notas'],
      estado: json['estado'] ?? 'recibido',
      productoNombre: json['producto_nombre'],
      productoImagen: json['producto_imagen'],
    );
  }
}

class PedidoEvento {
  final String id;
  final String pedidoId;
  final String? pedidoItemId;
  final String evento;
  final String? usuarioId;
  final Map<String, dynamic>? metadata;
  final DateTime createdAt;

  PedidoEvento({
    required this.id,
    required this.pedidoId,
    this.pedidoItemId,
    required this.evento,
    this.usuarioId,
    this.metadata,
    required this.createdAt,
  });

  factory PedidoEvento.fromJson(Map<String, dynamic> json) {
    return PedidoEvento(
      id: json['id'] ?? '',
      pedidoId: json['pedido_id'] ?? '',
      pedidoItemId: json['pedido_item_id'],
      evento: json['evento'] ?? '',
      usuarioId: json['usuario_id'],
      metadata: json['metadata'],
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
    );
  }
}
