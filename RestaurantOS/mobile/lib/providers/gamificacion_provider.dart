import 'package:flutter/material.dart';
import '../models/gamificacion.dart';
import '../models/challenge.dart';
import '../services/gamificacion_service.dart';

class GamificacionProvider extends ChangeNotifier {
  final GamificacionService _service = GamificacionService();

  GamificacionCliente? _perfil;
  List<PuntosHistorial> _historial = [];
  List<Badge> _badgesDisponibles = [];
  List<ClienteBadge> _badgesCliente = [];
  List<Challenge> _challenges = [];
  List<ChallengeProgreso> _progresoChallenges = [];
  List<LeaderboardEntry> _leaderboard = [];
  bool _isLoading = false;
  String? _error;

  GamificacionCliente? get perfil => _perfil;
  List<PuntosHistorial> get historial => _historial;
  List<Badge> get badgesDisponibles => _badgesDisponibles;
  List<ClienteBadge> get badgesCliente => _badgesCliente;
  List<Challenge> get challenges => _challenges;
  List<ChallengeProgreso> get progresoChallenges => _progresoChallenges;
  List<LeaderboardEntry> get leaderboard => _leaderboard;
  bool get isLoading => _isLoading;
  String? get error => _error;

  int get totalBadges => _badgesCliente.length;
  int get challengesCompletados =>
      _progresoChallenges.where((p) => p.completado).length;

  Future<void> loadPerfil(String clienteId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _perfil = await _service.getPerfilGamificacion(clienteId);
      _historial = await _service.getHistorialPuntos(clienteId);
      _badgesCliente = await _service.getBadgesCliente(clienteId);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadBadges() async {
    try {
      _badgesDisponibles = await _service.getBadgesDisponibles();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> loadChallenges() async {
    _isLoading = true;
    notifyListeners();

    try {
      _challenges = await _service.getChallengesActivos();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadChallengesConProgreso(String clienteId) async {
    _isLoading = true;
    notifyListeners();

    try {
      _challenges = await _service.getChallengesActivos();
      _progresoChallenges = await _service.getProgresoChallenges(clienteId);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadLeaderboard({String periodo = 'mensual'}) async {
    _isLoading = true;
    notifyListeners();

    try {
      _leaderboard = await _service.getLeaderboard(periodo: periodo);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> unirseChallenge(String challengeId, String clienteId) async {
    try {
      await _service.unirseChallenge(challengeId, clienteId);
      await loadChallengesConProgreso(clienteId);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  ChallengeProgreso? getProgreso(String challengeId) {
    try {
      return _progresoChallenges.firstWhere(
        (p) => p.challengeId == challengeId,
      );
    } catch (_) {
      return null;
    }
  }
}
