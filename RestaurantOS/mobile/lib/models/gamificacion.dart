class Badge {
  final String id;
  final String tenantId;
  final String nombre;
  final String descripcion;
  final String iconUrl;
  final String color;
  final String categoria; // pedidos, fidelidad, social, especial
  final int puntosRequeridos;
  final int orden;
  final bool activo;
  final DateTime? createdAt;

  Badge({
    required this.id,
    required this.tenantId,
    required this.nombre,
    required this.descripcion,
    this.iconUrl = '',
    this.color = '#E23744',
    this.categoria = 'pedidos',
    this.puntosRequeridos = 0,
    this.orden = 0,
    this.activo = true,
    this.createdAt,
  });

  factory Badge.fromJson(Map<String, dynamic> json) {
    return Badge(
      id: json['id'] ?? '',
      tenantId: json['tenant_id'] ?? '',
      nombre: json['nombre'] ?? '',
      descripcion: json['descripcion'] ?? '',
      iconUrl: json['icon_url'] ?? '',
      color: json['color'] ?? '#E23744',
      categoria: json['categoria'] ?? 'pedidos',
      puntosRequeridos: json['puntos_requeridos'] ?? 0,
      orden: json['orden'] ?? 0,
      activo: json['activo'] ?? true,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'tenant_id': tenantId,
    'nombre': nombre,
    'descripcion': descripcion,
    'icon_url': iconUrl,
    'color': color,
    'categoria': categoria,
    'puntos_requeridos': puntosRequeridos,
    'orden': orden,
    'activo': activo,
  };
}

class ClienteBadge {
  final String id;
  final String clienteId;
  final String badgeId;
  final DateTime desbloqueadoEn;
  final Badge? badge;

  ClienteBadge({
    required this.id,
    required this.clienteId,
    required this.badgeId,
    required this.desbloqueadoEn,
    this.badge,
  });

  factory ClienteBadge.fromJson(Map<String, dynamic> json) {
    return ClienteBadge(
      id: json['id'] ?? '',
      clienteId: json['cliente_id'] ?? '',
      badgeId: json['badge_id'] ?? '',
      desbloqueadoEn: DateTime.parse(
          json['desbloqueado_en'] ?? DateTime.now().toIso8601String()),
      badge: json['badge'] != null ? Badge.fromJson(json['badge']) : null,
    );
  }
}

class GamificacionCliente {
  final String clienteId;
  final int puntosTotales;
  final int puntosDisponibles;
  final int puntosCanjeados;
  final int rachaDias;
  final int maxRachaDias;
  final int pedidosTotales;
  final double montoTotalGastado;
  final String nivelActual;
  final int puntosParaSiguienteNivel;
  final List<ClienteBadge> badges;
  final DateTime? ultimaActividad;
  final Map<String, dynamic>? stats;

  GamificacionCliente({
    required this.clienteId,
    this.puntosTotales = 0,
    this.puntosDisponibles = 0,
    this.puntosCanjeados = 0,
    this.rachaDias = 0,
    this.maxRachaDias = 0,
    this.pedidosTotales = 0,
    this.montoTotalGastado = 0,
    this.nivelActual = 'bronce',
    this.puntosParaSiguienteNivel = 100,
    this.badges = const [],
    this.ultimaActividad,
    this.stats,
  });

  factory GamificacionCliente.fromJson(Map<String, dynamic> json) {
    return GamificacionCliente(
      clienteId: json['cliente_id'] ?? '',
      puntosTotales: json['puntos_totales'] ?? 0,
      puntosDisponibles: json['puntos_disponibles'] ?? 0,
      puntosCanjeados: json['puntos_canjeados'] ?? 0,
      rachaDias: json['racha_dias'] ?? 0,
      maxRachaDias: json['max_racha_dias'] ?? 0,
      pedidosTotales: json['pedidos_totales'] ?? 0,
      montoTotalGastado: (json['monto_total_gastado'] ?? 0).toDouble(),
      nivelActual: json['nivel_actual'] ?? 'bronce',
      puntosParaSiguienteNivel: json['puntos_para_siguiente_nivel'] ?? 100,
      badges: json['badges'] != null
          ? (json['badges'] as List)
              .map((b) => ClienteBadge.fromJson(b))
              .toList()
          : [],
      ultimaActividad: json['ultima_actividad'] != null
          ? DateTime.parse(json['ultima_actividad'])
          : null,
      stats: json['stats'],
    );
  }

  double get progresoNivel {
    if (puntosParaSiguienteNivel == 0) return 1.0;
    return (puntosTotales / puntosParaSiguienteNivel).clamp(0.0, 1.0);
  }

  String get nivelEmoji {
    switch (nivelActual) {
      case 'bronce':
        return '🥉';
      case 'plata':
        return '🥈';
      case 'oro':
        return '🥇';
      case 'diamante':
        return '💎';
      case 'platino':
        return '👑';
      default:
        return '⭐';
    }
  }
}

class PuntosHistorial {
  final String id;
  final String clienteId;
  final String tipo; // acumulacion, canje, ajuste, bono
  final int puntos;
  final String? motivo;
  final String? pedidoId;
  final DateTime createdAt;

  PuntosHistorial({
    required this.id,
    required this.clienteId,
    required this.tipo,
    required this.puntos,
    this.motivo,
    this.pedidoId,
    required this.createdAt,
  });

  factory PuntosHistorial.fromJson(Map<String, dynamic> json) {
    return PuntosHistorial(
      id: json['id'] ?? '',
      clienteId: json['cliente_id'] ?? '',
      tipo: json['tipo'] ?? 'acumulacion',
      puntos: json['puntos'] ?? 0,
      motivo: json['motivo'],
      pedidoId: json['pedido_id'],
      createdAt: DateTime.parse(
          json['created_at'] ?? DateTime.now().toIso8601String()),
    );
  }

  bool get isPositive => tipo != 'canje';
}
