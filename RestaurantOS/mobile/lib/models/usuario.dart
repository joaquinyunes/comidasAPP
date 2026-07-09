class Usuario {
  final String id;
  final String tenantId;
  final String email;
  final String nombre;
  final String? telefono;
  final String? avatarUrl;
  final bool emailVerificado;
  final bool activo;
  final List<String> roles;
  final String? tenantNombre;
  final String? tenantSlug;

  Usuario({
    required this.id,
    required this.tenantId,
    required this.email,
    required this.nombre,
    this.telefono,
    this.avatarUrl,
    this.emailVerificado = false,
    this.activo = true,
    this.roles = const [],
    this.tenantNombre,
    this.tenantSlug,
  });

  factory Usuario.fromJson(Map<String, dynamic> json) {
    return Usuario(
      id: json['id'] ?? '',
      tenantId: json['tenant_id'] ?? '',
      email: json['email'] ?? '',
      nombre: json['nombre'] ?? '',
      telefono: json['telefono'],
      avatarUrl: json['avatar_url'],
      emailVerificado: json['email_verificado'] ?? false,
      activo: json['activo'] ?? true,
      roles: json['roles'] != null ? List<String>.from(json['roles']) : [],
      tenantNombre: json['tenant_nombre'],
      tenantSlug: json['tenant_slug'],
    );
  }

  bool get isAdmin => roles.contains('admin');
  bool get isGerente => roles.contains('gerente') || isAdmin;
  bool get isMozo => roles.contains('mozo');
  bool get isCocinero => roles.contains('cocinero');
  bool get isCajero => roles.contains('cajero');

  String? get iniciales {
    final parts = nombre.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return nombre.isNotEmpty ? nombre[0].toUpperCase() : null;
  }
}

class LoginResponse {
  final String token;
  final String refreshToken;
  final Usuario usuario;

  LoginResponse({
    required this.token,
    required this.refreshToken,
    required this.usuario,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      token: json['token'] ?? '',
      refreshToken: json['refresh_token'] ?? '',
      usuario: Usuario.fromJson(json['usuario'] ?? {}),
    );
  }
}
