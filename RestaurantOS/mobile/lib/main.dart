import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'providers/auth_provider.dart';
import 'providers/cart_provider.dart';
import 'providers/pedido_provider.dart';
import 'services/socket_service.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';
import 'screens/menu_screen.dart';
import 'screens/cart_screen.dart';
import 'screens/tracking_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/kds_screen.dart';
import 'screens/mesas_screen.dart';
import 'screens/reservas_screen.dart';
import 'screens/notifications_screen.dart';
import 'screens/qr_scanner_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const RestaurantOSApp());
}

class RestaurantOSApp extends StatefulWidget {
  const RestaurantOSApp({super.key});

  @override
  State<RestaurantOSApp> createState() => _RestaurantOSAppState();
}

class _RestaurantOSAppState extends State<RestaurantOSApp> {
  bool _showSplash = true;

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()..init()),
        ChangeNotifierProvider(create: (_) => CartProvider()),
        ChangeNotifierProvider(create: (_) => PedidoProvider()),
      ],
      child: MaterialApp(
        title: 'RestaurantOS',
        theme: AppTheme.lightTheme,
        debugShowCheckedModeBanner: false,
        initialRoute: '/',
        onGenerateRoute: (settings) {
          switch (settings.name) {
            case '/':
              return MaterialPageRoute(
                builder: (_) => SplashScreen(
                  onComplete: () {},
                ),
              );

            case '/login':
              return MaterialPageRoute(
                builder: (_) => const LoginScreen(),
              );

            case '/home':
              return MaterialPageRoute(
                builder: (_) => const HomeScreen(),
              );

            case '/menu':
              final args = settings.arguments as Map<String, dynamic>?;
              return MaterialPageRoute(
                builder: (_) => MenuScreen(
                  mesaId: args?['mesaId'],
                  tenantSlug: args?['tenantSlug'],
                ),
              );

            case '/cart':
              return MaterialPageRoute(
                builder: (_) => const CartScreen(),
              );

            case '/tracking':
              final pedidoId = settings.arguments as String;
              return MaterialPageRoute(
                builder: (_) => TrackingScreen(pedidoId: pedidoId),
              );

            case '/dashboard':
              return MaterialPageRoute(
                builder: (_) => const DashboardScreen(),
              );

            case '/dashboard/cocina':
              return MaterialPageRoute(
                builder: (_) => const KDSScreen(tipo: 'cocina'),
              );

            case '/dashboard/barra':
              return MaterialPageRoute(
                builder: (_) => const KDSScreen(tipo: 'barra'),
              );

            case '/dashboard/mesas':
              return MaterialPageRoute(
                builder: (_) => const MesasScreen(),
              );

            case '/dashboard/reservas':
              return MaterialPageRoute(
                builder: (_) => const ReservasScreen(),
              );

            case '/dashboard/pedidos':
              return MaterialPageRoute(
                builder: (_) => const KDSScreen(tipo: 'cocina'),
              );

            case '/dashboard/inventario':
            case '/dashboard/caja':
            case '/dashboard/reportes':
            case '/dashboard/rrhh':
            case '/dashboard/marketing':
            case '/dashboard/compras':
            case '/dashboard/crm':
            case '/dashboard/sucursales':
            case '/dashboard/configuracion':
            case '/dashboard/white-label':
            case '/dashboard/bi':
              return MaterialPageRoute(
                builder: (_) => Scaffold(
                  appBar: AppBar(title: Text(settings.name!.split('/').last)),
                  body: Center(
                    child: Text(
                      '${settings.name!.split('/').last.toUpperCase()}\nPróximamente',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                          fontSize: 18, color: AppTheme.textSecondary),
                    ),
                  ),
                ),
              );

            case '/notifications':
              return MaterialPageRoute(
                builder: (_) => const NotificationsScreen(),
              );

            case '/scanner':
              return MaterialPageRoute(
                builder: (_) => QRScannerScreen(
                  onScanned: (code) {
                    // Parse QR: could be mesa URL or table code
                    debugPrint('QR scanned: $code');
                  },
                ),
              );

            default:
              return MaterialPageRoute(
                builder: (_) => const Scaffold(
                  body: Center(child: Text('404 - No encontrado')),
                ),
              );
          }
        },
      ),
    );
  }
}
