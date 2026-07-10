import '../models/gamificacion.dart';
import '../models/challenge.dart';
import 'api_service.dart';

class GamificacionService {
  static final GamificacionService _instance = GamificacionService._internal();
  factory GamificacionService() => _instance;
  GamificacionService._internal();

  final ApiService _api = ApiService();

  // Gamificación del cliente
  Future<GamificacionCliente> getPerfilGamificacion(String clienteId) async {
    try {
      final response = await _api.get('/api/clientes/$clienteId/gamificacion');
      return GamificacionCliente.fromJson(response['data'] ?? response);
    } catch (e) {
      return _getMockGamificacion(clienteId);
    }
  }

  Future<List<PuntosHistorial>> getHistorialPuntos(String clienteId) async {
    try {
      final response = await _api.get('/api/clientes/$clienteId/puntos');
      final data = response['data'] ?? response;
      return (data as List)
          .map((p) => PuntosHistorial.fromJson(p))
          .toList();
    } catch (e) {
      return _getMockHistorial();
    }
  }

  // Badges
  Future<List<Badge>> getBadgesDisponibles() async {
    try {
      final response = await _api.get('/api/badges');
      final data = response['data'] ?? response;
      return (data as List).map((b) => Badge.fromJson(b)).toList();
    } catch (e) {
      return _getMockBadges();
    }
  }

  Future<List<ClienteBadge>> getBadgesCliente(String clienteId) async {
    try {
      final response = await _api.get('/api/clientes/$clienteId/badges');
      final data = response['data'] ?? response;
      return (data as List)
          .map((b) => ClienteBadge.fromJson(b))
          .toList();
    } catch (e) {
      return [];
    }
  }

  // Challenges
  Future<List<Challenge>> getChallengesActivos() async {
    try {
      final response = await _api.get('/api/challenges', queryParams: {'activo': 'true'});
      final data = response['data'] ?? response;
      return (data as List).map((c) => Challenge.fromJson(c)).toList();
    } catch (e) {
      return _getMockChallenges();
    }
  }

  Future<List<ChallengeProgreso>> getProgresoChallenges(String clienteId) async {
    try {
      final response =
          await _api.get('/api/clientes/$clienteId/challenges');
      final data = response['data'] ?? response;
      return (data as List)
          .map((p) => ChallengeProgreso.fromJson(p))
          .toList();
    } catch (e) {
      return [];
    }
  }

  Future<void> unirseChallenge(String challengeId, String clienteId) async {
    await _api.post('/api/challenges/$challengeId/join', body: {
      'cliente_id': clienteId,
    });
  }

  // Leaderboard
  Future<List<LeaderboardEntry>> getLeaderboard({String periodo = 'mensual'}) async {
    try {
      final response =
          await _api.get('/api/leaderboard', queryParams: {'periodo': periodo});
      final data = response['data'] ?? response;
      return (data as List)
          .map((e) => LeaderboardEntry.fromJson(e))
          .toList();
    } catch (e) {
      return _getMockLeaderboard();
    }
  }

  // Canjear puntos
  Future<void> canjearPuntos(String clienteId, int puntos, String motivo) async {
    await _api.post('/api/clientes/$clienteId/puntos/canjear', body: {
      'puntos': puntos,
      'motivo': motivo,
    });
  }

  // === MOCK DATA ===

  GamificacionCliente _getMockGamificacion(String clienteId) {
    return GamificacionCliente(
      clienteId: clienteId,
      puntosTotales: 2450,
      puntosDisponibles: 1200,
      puntosCanjeados: 1250,
      rachaDias: 7,
      maxRachaDias: 14,
      pedidosTotales: 38,
      montoTotalGastado: 45600,
      nivelActual: 'oro',
      puntosParaSiguienteNivel: 5000,
      badges: [],
      ultimaActividad: DateTime.now().subtract(const Duration(hours: 3)),
      stats: {
        'pedidos_esta_semana': 5,
        'gasto_esta_semana': 3200,
        'productos_favoritos': ['Milanesa Napolitana', 'Empanadas x12'],
      },
    );
  }

  List<PuntosHistorial> _getMockHistorial() {
    return [
      PuntosHistorial(
        id: '1', clienteId: 'c1', tipo: 'acumulacion',
        puntos: 150, motivo: 'Pedido #1234',
        createdAt: DateTime.now().subtract(const Duration(hours: 2)),
      ),
      PuntosHistorial(
        id: '2', clienteId: 'c1', tipo: 'bono',
        puntos: 50, motivo: 'Racha de 7 días',
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
      ),
      PuntosHistorial(
        id: '3', clienteId: 'c1', tipo: 'acumulacion',
        puntos: 200, motivo: 'Pedido #1230',
        createdAt: DateTime.now().subtract(const Duration(days: 2)),
      ),
      PuntosHistorial(
        id: '4', clienteId: 'c1', tipo: 'canje',
        puntos: -300, motivo: 'Descuento en Milanesa',
        createdAt: DateTime.now().subtract(const Duration(days: 3)),
      ),
      PuntosHistorial(
        id: '5', clienteId: 'c1', tipo: 'acumulacion',
        puntos: 80, motivo: 'Completaste challenge "Primer pedido del día"',
        createdAt: DateTime.now().subtract(const Duration(days: 4)),
      ),
    ];
  }

  List<Badge> _getMockBadges() {
    return [
      Badge(
        id: 'b1', tenantId: 't1', nombre: 'Primer Pedido',
        descripcion: 'Realizaste tu primer pedido', iconUrl: '🎉',
        color: '#27AE60', categoria: 'pedidos', puntosRequeridos: 0,
      ),
      Badge(
        id: 'b2', tenantId: 't1', nombre: 'Frecuente',
        descripcion: '10 pedidos realizados', iconUrl: '🔥',
        color: '#E74C3C', categoria: 'pedidos', puntosRequeridos: 100,
      ),
      Badge(
        id: 'b3', tenantId: 't1', nombre: 'Explorador',
        descripcion: 'Pediste 5 platos diferentes', iconUrl: '🗺️',
        color: '#3498DB', categoria: 'exploracion', puntosRequeridos: 50,
      ),
      Badge(
        id: 'b4', tenantId: 't1', nombre: 'Racha de Fuego',
        descripcion: '7 días consecutivos pidiendo', iconUrl: '🔥',
        color: '#FF6B35', categoria: 'fidelidad', puntosRequeridos: 200,
      ),
      Badge(
        id: 'b5', tenantId: 't1', nombre: 'Gurú del Sabor',
        descripcion: 'Dejaste 10 reseñas', iconUrl: '⭐',
        color: '#F1C40F', categoria: 'social', puntosRequeridos: 150,
      ),
      Badge(
        id: 'b6', tenantId: 't1', nombre: 'VIP',
        descripcion: 'Acumulaste 5000 puntos', iconUrl: '👑',
        color: '#9B59B6', categoria: 'especial', puntosRequeridos: 5000,
      ),
    ];
  }

  List<Challenge> _getMockChallenges() {
    final now = DateTime.now();
    return [
      Challenge(
        id: 'ch1', tenantId: 't1',
        nombre: 'Primero del Día',
        descripcion: 'Hacé tu primer pedido antes de las 12:00',
        tipo: 'diario', categoria: 'pedidos',
        icono: '🌅', color: '#F39C12',
        metaObjetivo: 1, unidadMeta: 'pedidos',
        puntosRecompensa: 30,
        fechaInicio: DateTime(now.year, now.month, now.day),
        fechaFin: DateTime(now.year, now.month, now.day, 23, 59),
        participantes: 45, completados: 12,
      ),
      Challenge(
        id: 'ch2', tenantId: 't1',
        nombre: 'Maratón Semanal',
        descripcion: 'Hacé 5 pedidos esta semana',
        tipo: 'semanal', categoria: 'volumen',
        icono: '🏃', color: '#E74C3C',
        metaObjetivo: 5, unidadMeta: 'pedidos',
        puntosRecompensa: 150,
        fechaInicio: now.subtract(Duration(days: now.weekday - 1)),
        fechaFin: now.add(Duration(days: 7 - now.weekday)),
        participantes: 89, completados: 23,
      ),
      Challenge(
        id: 'ch3', tenantId: 't1',
        nombre: 'Explorador de Sabores',
        descripcion: 'Probá 3 platos nuevos este mes',
        tipo: 'mensual', categoria: 'exploracion',
        icono: '🗺️', color: '#3498DB',
        metaObjetivo: 3, unidadMeta: 'productos',
        puntosRecompensa: 250,
        fechaInicio: DateTime(now.year, now.month, 1),
        fechaFin: DateTime(now.year, now.month + 1, 0, 23, 59),
        participantes: 120, completados: 45,
      ),
      Challenge(
        id: 'ch4', tenantId: 't1',
        nombre: 'Noche Especial',
        descripcion: 'Hacé un pedido de más de $5000 entre semana',
        tipo: 'especial', categoria: 'volumen',
        icono: '🌙', color: '#9B59B6',
        metaObjetivo: 1, unidadMeta: 'pedidos',
        puntosRecompensa: 200,
        fechaInicio: now.subtract(const Duration(days: 30)),
        fechaFin: now.add(const Duration(days: 30)),
        participantes: 34, completados: 8,
      ),
    ];
  }

  List<LeaderboardEntry> _getMockLeaderboard() {
    return [
      LeaderboardEntry(
        posicion: 1, clienteId: 'c5', clienteNombre: 'María García',
        puntos: 4200, nivel: 3, nivelNombre: 'oro', pedidosMes: 18,
      ),
      LeaderboardEntry(
        posicion: 2, clienteId: 'c2', clienteNombre: 'Carlos López',
        puntos: 3800, nivel: 3, nivelNombre: 'oro', pedidosMes: 15,
      ),
      LeaderboardEntry(
        posicion: 3, clienteId: 'c1', clienteNombre: 'Yo',
        puntos: 2450, nivel: 3, nivelNombre: 'oro', pedidosMes: 12, esYo: true,
      ),
      LeaderboardEntry(
        posicion: 4, clienteId: 'c3', clienteNombre: 'Ana Martínez',
        puntos: 2100, nivel: 2, nivelNombre: 'plata', pedidosMes: 10,
      ),
      LeaderboardEntry(
        posicion: 5, clienteId: 'c4', clienteNombre: 'Pedro Ruiz',
        puntos: 1800, nivel: 2, nivelNombre: 'plata', pedidosMes: 8,
      ),
      LeaderboardEntry(
        posicion: 6, clienteId: 'c6', clienteNombre: 'Lucía Fernández',
        puntos: 1500, nivel: 2, nivelNombre: 'plata', pedidosMes: 7,
      ),
      LeaderboardEntry(
        posicion: 7, clienteId: 'c7', clienteNombre: 'Diego Sánchez',
        puntos: 1200, nivel: 1, nivelNombre: 'bronce', pedidosMes: 5,
      ),
    ];
  }
}
