import 'package:flutter/material.dart';
import '../models/usuario.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _auth = AuthService();

  Usuario? get usuario => _auth.usuario;
  bool get isAuthenticated => _auth.isAuthenticated;
  bool get isAdmin => _auth.usuario?.isAdmin ?? false;
  bool get isGerente => _auth.usuario?.isGerente ?? false;

  Future<void> init() async {
    await _auth.init();
    notifyListeners();
  }

  Future<void> login(String email, String password, {String? slug}) async {
    await _auth.login(email, password, slug: slug);
    notifyListeners();
  }

  Future<void> logout() async {
    await _auth.logout();
    notifyListeners();
  }
}
