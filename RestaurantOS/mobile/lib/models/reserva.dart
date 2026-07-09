class Reserva {
  final String id;
  final String tenantId;
  final String sucursalId;
  final String? mesaId;
  final String? clienteId;
  final DateTime fecha;
  final String hora;
  final int cantidadPersonas;
  final String? zona;
  final String? occasion;
  final String? notas;
  final String estado;
  final bool recordatorioEnviado;
  final DateTime createdAt;

  Reserva({
    required this.id,
    required this.tenantId,
    required this.sucursalId,
    this.mesaId,
    this.clienteId,
    required this.fecha,
    required this.hora,
    required this.cantidadPersonas,
    this.zona,
    this.occasion,
    this.notas,
    this.estado = 'pendiente',
    this.recordatorioEnviado = false,
    required this.createdAt,
  });

  factory Reserva.fromJson(Map<String, dynamic> json) {
    return Reserva(
      id: json['id'] ?? '',
      tenantId: json['tenant_id'] ?? '',
      sucursalId: json['sucursal_id'] ?? '',
      mesaId: json['mesa_id'],
      clienteId: json['cliente_id'],
      fecha: DateTime.parse(json['fecha'] ?? DateTime.now().toIso8601String()),
      hora: json['hora'] ?? '',
      cantidadPersonas: json['cantidad_personas'] ?? 1,
      zona: json['zona'],
      occasion: json['occasion'],
      notas: json['notas'],
      estado: json['estado'] ?? 'pendiente',
      recordatorioEnviado: json['recordatorio_enviado'] ?? false,
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
    );
  }

  String get estadoLabel {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'confirmada':
        return 'Confirmada';
      case 'no_show':
        return 'No Show';
      case 'cancelada':
        return 'Cancelada';
      default:
        return estado;
    }
  }
}

class Disponibilidad {
  final String hora;
  final bool disponible;
  final int mesasDisponibles;

  Disponibilidad({
    required this.hora,
    required this.disponible,
    required this.mesasDisponibles,
  });

  factory Disponibilidad.fromJson(Map<String, dynamic> json) {
    return Disponibilidad(
      hora: json['hora'] ?? '',
      disponible: json['disponible'] ?? false,
      mesasDisponibles: json['mesas_disponibles'] ?? 0,
    );
  }
}
