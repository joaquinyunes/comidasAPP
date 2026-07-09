class Mesa {
  final String id;
  final String tenantId;
  final String sucursalId;
  final String sectorId;
  final String numero;
  final int capacidad;
  final String estado;
  final double? posicionX;
  final double? posicionY;
  final String qrCode;
  final bool activa;

  Mesa({
    required this.id,
    required this.tenantId,
    required this.sucursalId,
    required this.sectorId,
    required this.numero,
    this.capacidad = 4,
    this.estado = 'libre',
    this.posicionX,
    this.posicionY,
    required this.qrCode,
    this.activa = true,
  });

  factory Mesa.fromJson(Map<String, dynamic> json) {
    return Mesa(
      id: json['id'] ?? '',
      tenantId: json['tenant_id'] ?? '',
      sucursalId: json['sucursal_id'] ?? '',
      sectorId: json['sector_id'] ?? '',
      numero: json['numero'] ?? '',
      capacidad: json['capacidad'] ?? 4,
      estado: json['estado'] ?? 'libre',
      posicionX: json['posicion_x']?.toDouble(),
      posicionY: json['posicion_y']?.toDouble(),
      qrCode: json['qr_code'] ?? '',
      activa: json['activa'] ?? true,
    );
  }

  String get estadoLabel {
    switch (estado) {
      case 'libre':
        return 'Libre';
      case 'esperando_pedido':
        return 'Esperando Pedido';
      case 'en_cocina':
        return 'En Cocina';
      case 'comiendo':
        return 'Comiendo';
      case 'esperando_cuenta':
        return 'Esperando Cuenta';
      case 'reservada':
        return 'Reservada';
      case 'limpieza':
        return 'Limpieza';
      default:
        return estado;
    }
  }
}

class Sector {
  final String id;
  final String tenantId;
  final String sucursalId;
  final String nombre;
  final String? tipo;
  final int orden;

  Sector({
    required this.id,
    required this.tenantId,
    required this.sucursalId,
    required this.nombre,
    this.tipo,
    this.orden = 0,
  });

  factory Sector.fromJson(Map<String, dynamic> json) {
    return Sector(
      id: json['id'] ?? '',
      tenantId: json['tenant_id'] ?? '',
      sucursalId: json['sucursal_id'] ?? '',
      nombre: json['nombre'] ?? '',
      tipo: json['tipo'],
      orden: json['orden'] ?? 0,
    );
  }
}
