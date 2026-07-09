class Producto {
  final String id;
  final String tenantId;
  final String categoriaId;
  final String nombre;
  final String? descripcion;
  final double precio;
  final double? costo;
  final String? imagenUrl;
  final int? tiempoPreparacionMin;
  final int nivelPicante;
  final int? calorias;
  final double? proteinas;
  final double? grasas;
  final double? carbohidratos;
  final List<String>? alergenos;
  final bool disponible;
  final bool destacado;
  final String tipo;
  final String? categoriaNombre;

  Producto({
    required this.id,
    required this.tenantId,
    required this.categoriaId,
    required this.nombre,
    this.descripcion,
    required this.precio,
    this.costo,
    this.imagenUrl,
    this.tiempoPreparacionMin,
    this.nivelPicante = 0,
    this.calorias,
    this.proteinas,
    this.grasas,
    this.carbohidratos,
    this.alergenos,
    this.disponible = true,
    this.destacado = false,
    this.tipo = 'plato',
    this.categoriaNombre,
  });

  factory Producto.fromJson(Map<String, dynamic> json) {
    return Producto(
      id: json['id'] ?? '',
      tenantId: json['tenant_id'] ?? '',
      categoriaId: json['categoria_id'] ?? '',
      nombre: json['nombre'] ?? '',
      descripcion: json['descripcion'],
      precio: (json['precio'] ?? 0).toDouble(),
      costo: json['costo']?.toDouble(),
      imagenUrl: json['imagen_url'],
      tiempoPreparacionMin: json['tiempo_preparacion_min'],
      nivelPicante: json['nivel_picante'] ?? 0,
      calorias: json['calorias'],
      proteinas: json['proteinas']?.toDouble(),
      grasas: json['grasas']?.toDouble(),
      carbohidratos: json['carbohidratos']?.toDouble(),
      alergenos: json['alergenos'] != null
          ? List<String>.from(json['alergenos'])
          : null,
      disponible: json['disponible'] ?? true,
      destacado: json['destacado'] ?? false,
      tipo: json['tipo'] ?? 'plato',
      categoriaNombre: json['categoria_nombre'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tenant_id': tenantId,
      'categoria_id': categoriaId,
      'nombre': nombre,
      'descripcion': descripcion,
      'precio': precio,
      'imagen_url': imagenUrl,
      'tiempo_preparacion_min': tiempoPreparacionMin,
      'nivel_picante': nivelPicante,
      'calorias': calorias,
      'alergenos': alergenos,
      'disponible': disponible,
      'destacado': destacado,
      'tipo': tipo,
    };
  }
}

class Categoria {
  final String id;
  final String tenantId;
  final String nombre;
  final String? descripcion;
  final String? imagenUrl;
  final int orden;
  final bool activa;

  Categoria({
    required this.id,
    required this.tenantId,
    required this.nombre,
    this.descripcion,
    this.imagenUrl,
    this.orden = 0,
    this.activa = true,
  });

  factory Categoria.fromJson(Map<String, dynamic> json) {
    return Categoria(
      id: json['id'] ?? '',
      tenantId: json['tenant_id'] ?? '',
      nombre: json['nombre'] ?? '',
      descripcion: json['descripcion'],
      imagenUrl: json['imagen_url'],
      orden: json['orden'] ?? 0,
      activa: json['activa'] ?? true,
    );
  }
}
