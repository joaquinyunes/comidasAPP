class AppConstants {
  static const String appName = 'RestaurantOS';
  static const String appVersion = '1.0.0';

  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000',
  );

  static const String socketUrl = String.fromEnvironment(
    'SOCKET_URL',
    defaultValue: 'http://localhost:3000',
  );

  static const int defaultPageSize = 20;
  static const int maxCartItems = 50;

  static const Duration animationDuration = Duration(milliseconds: 300);
  static const Duration splashDuration = Duration(seconds: 2);

  static const List<String> allowedRoles = [
    'admin',
    'gerente',
    'mozo',
    'cocinero',
    'cajero',
    'bartender',
  ];

  static const Map<String, String> pedidoEstados = {
    'recibido': 'Recibido',
    'aceptado': 'Aceptado',
    'en_preparacion': 'En Preparación',
    'listo': 'Listo',
    'entregado': 'Entregado',
    'cerrado': 'Cerrado',
    'cancelado': 'Cancelado',
  };

  static const Map<String, String> mesaEstados = {
    'libre': 'Libre',
    'esperando_pedido': 'Esperando Pedido',
    'en_cocina': 'En Cocina',
    'comiendo': 'Comiendo',
    'esperando_cuenta': 'Esperando Cuenta',
    'reservada': 'Reservada',
    'limpieza': 'Limpieza',
  };

  static const Map<String, String> reservaEstados = {
    'pendiente': 'Pendiente',
    'confirmada': 'Confirmada',
    'no_show': 'No Show',
    'cancelada': 'Cancelada',
  };
}
