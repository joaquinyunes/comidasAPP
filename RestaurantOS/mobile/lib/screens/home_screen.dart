import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../providers/auth_provider.dart';
import '../providers/cart_provider.dart';
import '../providers/pedido_provider.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final isStaff = auth.isAdmin || auth.isGerente;

    final pages = isStaff
        ? [
            _buildCustomerTab(),
            _buildOrdersTab(),
            _buildDashboardTab(),
          ]
        : [
            _buildCustomerTab(),
            _buildOrdersTab(),
            _buildProfileTab(),
          ];

    return Scaffold(
      body: pages[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        items: [
          const BottomNavigationBarItem(
            icon: Icon(Icons.restaurant_menu),
            label: 'Menú',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.receipt_long),
            label: 'Mis Pedidos',
          ),
          BottomNavigationBarItem(
            icon: Icon(isStaff ? Icons.dashboard : Icons.person),
            label: isStaff ? 'Dashboard' : 'Perfil',
          ),
        ],
      ),
    );
  }

  Widget _buildCustomerTab() {
    return Navigator(
      onGenerateRoute: (settings) => MaterialPageRoute(
        builder: (_) => const _MenuHomeView(),
      ),
    );
  }

  Widget _buildOrdersTab() {
    return Navigator(
      onGenerateRoute: (settings) => MaterialPageRoute(
        builder: (_) => const _OrdersHomeView(),
      ),
    );
  }

  Widget _buildDashboardTab() {
    return Navigator(
      onGenerateRoute: (settings) => MaterialPageRoute(
        builder: (_) => const _DashboardHomeView(),
      ),
    );
  }

  Widget _buildProfileTab() {
    final auth = context.watch<AuthProvider>();
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          const SizedBox(height: 40),
          CircleAvatar(
            radius: 50,
            backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
            child: Text(
              auth.usuario?.iniciales ?? 'U',
              style: const TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryColor,
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            auth.usuario?.nombre ?? '',
            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          ),
          Text(
            auth.usuario?.email ?? '',
            style: const TextStyle(color: AppTheme.textSecondary),
          ),
          const SizedBox(height: 32),
          _buildProfileTile(Icons.person_outline, 'Editar Perfil'),
          _buildProfileTile(Icons.notifications_outlined, 'Notificaciones'),
          _buildProfileTile(Icons.favorite_outline, 'Favoritos'),
          _buildProfileTile(Icons.history, 'Historial de Pedidos'),
          _buildProfileTile(Icons.star_outline, 'Mis Puntos'),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () => auth.logout(),
              icon: const Icon(Icons.logout, color: AppTheme.errorColor),
              label: const Text('Cerrar Sesión',
                  style: TextStyle(color: AppTheme.errorColor)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileTile(IconData icon, String title) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon, color: AppTheme.primaryColor),
        title: Text(title),
        trailing: const Icon(Icons.chevron_right),
      ),
    );
  }
}

class _MenuHomeView extends StatelessWidget {
  const _MenuHomeView();

  @override
  Widget build(BuildContext context) {
    return Navigator(
      onGenerateRoute: (settings) =>
          MaterialPageRoute(builder: (_) => const _MenuContent()),
    );
  }
}

class _MenuContent extends StatelessWidget {
  const _MenuContent();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('RestaurantOS')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: const BoxDecoration(
                gradient: AppTheme.primaryGradient,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.restaurant_menu,
                  size: 50, color: Colors.white),
            ),
            const SizedBox(height: 24),
            const Text(
              'RestaurantOS',
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Bienvenido a tu restaurante',
              style: TextStyle(color: AppTheme.textSecondary, fontSize: 16),
            ),
            const SizedBox(height: 40),
            ElevatedButton.icon(
              onPressed: () => Navigator.pushNamed(context, '/menu'),
              icon: const Icon(Icons.restaurant_menu),
              label: const Text('Ver Menú'),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: () => Navigator.pushNamed(context, '/scanner'),
              icon: const Icon(Icons.qr_code_scanner),
              label: const Text('Escanear QR de Mesa'),
            ),
          ],
        ),
      ),
    );
  }
}

class _OrdersHomeView extends StatelessWidget {
  const _OrdersHomeView();

  @override
  Widget build(BuildContext context) {
    final pedidoProvider = context.watch<PedidoProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Mis Pedidos')),
      body: pedidoProvider.pedidos.isEmpty
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.receipt_long,
                      size: 80, color: AppTheme.textLight),
                  SizedBox(height: 16),
                  Text(
                    'Sin pedidos recientes',
                    style:
                        TextStyle(fontSize: 18, color: AppTheme.textSecondary),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: pedidoProvider.pedidos.length,
              itemBuilder: (context, index) {
                final pedido = pedidoProvider.pedidos[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    title: Text(
                      'Pedido #${pedido.id.substring(0, 8).toUpperCase()}',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    subtitle: Text(
                      '\$${pedido.total.toStringAsFixed(2)} • ${pedido.items.length} items',
                    ),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => Navigator.pushNamed(
                      context,
                      '/tracking',
                      arguments: pedido.id,
                    ),
                  ),
                );
              },
            ),
    );
  }
}

class _DashboardHomeView extends StatelessWidget {
  const _DashboardHomeView();

  @override
  Widget build(BuildContext context) {
    return Navigator(
      onGenerateRoute: (settings) =>
          MaterialPageRoute(builder: (_) => const _DashboardContent()),
    );
  }
}

class _DashboardContent extends StatelessWidget {
  const _DashboardContent();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Dashboard')),
      body: const Center(
        child: Text('Dashboard Content'),
      ),
    );
  }
}
