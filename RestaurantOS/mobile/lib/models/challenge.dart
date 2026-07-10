class Challenge {
  final String id;
  final String tenantId;
  final String nombre;
  final String descripcion;
  final String tipo; // diario, semanal, mensual, especial
  final String categoria; // pedidos,社会, volumen, exploracion
  final String icono;
  final String color;
  final int metaObjetivo;
  final String unidadMeta; // pedidos, pesos, dias, productos
  final int puntosRecompensa;
  final String? badgeRecompensaId;
  final DateTime fechaInicio;
  final DateTime fechaFin;
  final bool activo;
  final int participantes;
  final int completados;

  Challenge({
    required this.id,
    required this.tenantId,
    required this.nombre,
    required this.descripcion,
    this.tipo = 'diario',
    this.categoria = 'pedidos',
    this.icono = '🏆',
    this.color = '#FF6B35',
    this.metaObjetivo = 1,
    this.unidadMeta = 'pedidos',
    this.puntosRecompensa = 50,
    this.badgeRecompensaId,
    required this.fechaInicio,
    required this.fechaFin,
    this.activo = true,
    this.participantes = 0,
    this.completados = 0,
  });

  factory Challenge.fromJson(Map<String, dynamic> json) {
    return Challenge(
      id: json['id'] ?? '',
      tenantId: json['tenant_id'] ?? '',
      nombre: json['nombre'] ?? '',
      descripcion: json['descripcion'] ?? '',
      tipo: json['tipo'] ?? 'diario',
      categoria: json['categoria'] ?? 'pedidos',
      icono: json['icono'] ?? '🏆',
      color: json['color'] ?? '#FF6B35',
      metaObjetivo: json['meta_objetivo'] ?? 1,
      unidadMeta: json['unidad_meta'] ?? 'pedidos',
      puntosRecompensa: json['puntos_recompensa'] ?? 50,
      badgeRecompensaId: json['badge_recompensa_id'],
      fechaInicio: DateTime.parse(
          json['fecha_inicio'] ?? DateTime.now().toIso8601String()),
      fechaFin: DateTime.parse(
          json['fecha_fin'] ?? DateTime.now().add(const Duration(days: 1)).toIso8601String()),
      activo: json['activo'] ?? true,
      participantes: json['participantes'] ?? 0,
      completados: json['completados'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'tenant_id': tenantId,
    'nombre': nombre,
    'descripcion': descripcion,
    'tipo': tipo,
    'categoria': categoria,
    'icono': icono,
    'color': color,
    'meta_objetivo': metaObjetivo,
    'unidad_meta': unidadMeta,
    'puntos_recompensa': puntosRecompensa,
    'badge_recompensa_id': badgeRecompensaId,
    'fecha_inicio': fechaInicio.toIso8601String(),
    'fecha_fin': fechaFin.toIso8601String(),
    'activo': activo,
  };

  String get tipoLabel {
    switch (tipo) {
      case 'diario':
        return 'Diario';
      case 'semanal':
        return 'Semanal';
      case 'mensual':
        return 'Mensual';
      case 'especial':
        return 'Especial';
      default:
        return tipo;
    }
  }

  bool get estaActivo => activo && DateTime.now().isAfter(fechaInicio) && DateTime.now().isBefore(fechaFin);
}

class ChallengeProgreso {
  final String id;
  final String challengeId;
  final String clienteId;
  final int progresoActual;
  final int metaObjetivo;
  final bool completado;
  final DateTime? completadoEn;
  final bool recompensaCanjeada;

  ChallengeProgreso({
    required this.id,
    required this.challengeId,
    required this.clienteId,
    this.progresoActual = 0,
    required this.metaObjetivo,
    this.completado = false,
    this.completadoEn,
    this.recompensaCanjeada = false,
  });

  factory ChallengeProgreso.fromJson(Map<String, dynamic> json) {
    return ChallengeProgreso(
      id: json['id'] ?? '',
      challengeId: json['challenge_id'] ?? '',
      clienteId: json['cliente_id'] ?? '',
      progresoActual: json['progreso_actual'] ?? 0,
      metaObjetivo: json['meta_objetivo'] ?? 1,
      completado: json['completado'] ?? false,
      completadoEn: json['completado_en'] != null
          ? DateTime.parse(json['completado_en'])
          : null,
      recompensaCanjeada: json['recompensa_canjeada'] ?? false,
    );
  }

  double get porcentaje => metaObjetivo > 0
      ? (progresoActual / metaObjetivo).clamp(0.0, 1.0)
      : 0.0;
}

class LeaderboardEntry {
  final int posicion;
  final String clienteId;
  final String clienteNombre;
  final String? clienteAvatar;
  final int puntos;
  final int nivel;
  final String nivelNombre;
  final int pedidosMes;
  final bool esYo;

  LeaderboardEntry({
    required this.posicion,
    required this.clienteId,
    required this.clienteNombre,
    this.clienteAvatar,
    this.puntos = 0,
    this.nivel = 0,
    this.nivelNombre = 'bronce',
    this.pedidosMes = 0,
    this.esYo = false,
  });

  factory LeaderboardEntry.fromJson(Map<String, dynamic> json) {
    return LeaderboardEntry(
      posicion: json['posicion'] ?? 0,
      clienteId: json['cliente_id'] ?? '',
      clienteNombre: json['cliente_nombre'] ?? '',
      clienteAvatar: json['cliente_avatar'],
      puntos: json['puntos'] ?? 0,
      nivel: json['nivel'] ?? 0,
      nivelNombre: json['nivel_nombre'] ?? 'bronce',
      pedidosMes: json['pedidos_mes'] ?? 0,
      esYo: json['es_yo'] ?? false,
    );
  }

  String get nivelEmoji {
    switch (nivelNombre) {
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
