class Cliente {
  final String id;
  final String tenantId;
  final String nombre;
  final String? email;
  final String? telefono;
  final DateTime? fechaNacimiento;
  final List<String>? alergias;
  final String? dieta;
  final Map<String, dynamic>? preferencias;
  final int puntos;
  final String nivel;
  final double totalGastado;
  final int totalVisitas;
  final DateTime? ultimaVisita;
  final bool optInMarketing;
  final DateTime createdAt;

  Cliente({
    required this.id,
    required this.tenantId,
    required this.nombre,
    this.email,
    this.telefono,
    this.fechaNacimiento,
    this.alergias,
    this.dieta,
    this.preferencias,
    this.puntos = 0,
    this.nivel = 'bronce',
    this.totalGastado = 0,
    this.totalVisitas = 0,
    this.ultimaVisita,
    this.optInMarketing = false,
    required this.createdAt,
  });

  factory Cliente.fromJson(Map<String, dynamic> json) {
    return Cliente(
      id: json['id'] ?? '',
      tenantId: json['tenant_id'] ?? '',
      nombre: json['nombre'] ?? '',
      email: json['email'],
      telefono: json['telefono'],
      fechaNacimiento: json['fecha_nacimiento'] != null
          ? DateTime.parse(json['fecha_nacimiento'])
          : null,
      alergias: json['alergias'] != null
          ? List<String>.from(json['alergias'])
          : null,
      dieta: json['dieta'],
      preferencias: json['preferencias'],
      puntos: json['puntos'] ?? 0,
      nivel: json['nivel'] ?? 'bronce',
      totalGastado: (json['total_gastado'] ?? 0).toDouble(),
      totalVisitas: json['total_visitas'] ?? 0,
      ultimaVisita: json['ultima_visita'] != null
          ? DateTime.parse(json['ultima_visita'])
          : null,
      optInMarketing: json['opt_in_marketing'] ?? false,
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
    );
  }

  String get nivelLabel {
    switch (nivel) {
      case 'bronce':
        return 'Bronce';
      case 'plata':
        return 'Plata';
      case 'oro':
        return 'Oro';
      case 'diamante':
        return 'Diamante';
      default:
        return nivel;
    }
  }
}
