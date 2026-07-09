import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/usuario.dart';
import 'api_service.dart';

class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  final ApiService _api = ApiService();
  Usuario? _usuario;
  String? _token;
  String? _refreshToken;
  String? _tenantId;

  Usuario? get usuario => _usuario;
  String? get token => _token;
  String? get tenantId => _tenantId ?? _usuario?.tenantId;
  bool get isAuthenticated => _token != null && _usuario != null;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
    _refreshToken = prefs.getString('refresh_token');
    _tenantId = prefs.getString('tenant_id');

    final userJson = prefs.getString('usuario');
    if (userJson != null) {
      _usuario = Usuario.fromJson(jsonDecode(userJson));
    }
  }

  Future<LoginResponse> login(String email, String password, {String? slug}) async {
    final response = await _api.post('/api/auth/login', body: {
      'email': email,
      'password': password,
      if (slug != null) 'slug': slug,
    });

    final loginResponse = LoginResponse.fromJson(response['data'] ?? response);
    await _saveSession(loginResponse);
    return loginResponse;
  }

  Future<void> refresh() async {
    if (_refreshToken == null) throw ApiException('No refresh token');

    final response = await _api.post('/api/auth/refresh', body: {
      'refresh_token': _refreshToken,
    });

    final data = response['data'] ?? response;
    _token = data['token'];
    _refreshToken = data['refresh_token'];

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', _token!);
    await prefs.setString('refresh_token', _refreshToken!);
  }

  Future<void> logout() async {
    try {
      await _api.post('/api/auth/logout');
    } catch (_) {}

    _usuario = null;
    _token = null;
    _refreshToken = null;
    _tenantId = null;

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('refresh_token');
    await prefs.remove('tenant_id');
    await prefs.remove('usuario');
  }

  Future<void> setTenant(String tenantId) async {
    _tenantId = tenantId;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('tenant_id', tenantId);
  }

  Future<void> _saveSession(LoginResponse response) async {
    _token = response.token;
    _refreshToken = response.refreshToken;
    _usuario = response.usuario;
    _tenantId = response.usuario.tenantId;

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', response.token);
    await prefs.setString('refresh_token', response.refreshToken);
    await prefs.setString('tenant_id', response.usuario.tenantId);
    await prefs.setString('usuario', jsonEncode(response.usuario.toJson()));
  }
}
