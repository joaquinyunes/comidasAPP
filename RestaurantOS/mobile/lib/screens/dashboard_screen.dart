import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../config/constants.dart';
import '../providers/pedido_provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final ApiService _api = ApiService();
  Map<String, dynamic>? _resumen;
  bool _isLoading = true;
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadDashboard();
  }

  Future<void> _loadDashboard() async {
    setState(() => _isLoading = true);
    try {
      final response = await _api.get('/api/dashboard/resumen');
      _resumen = response['data'] ?? response;
    } catch (e) {
      // Use mock data
      _resumen = {
        'ventas_hoy': 15420.50,
        'pedidos_hoy': 47,
        'ticket_promedio': 328.10,
        'mesas_activas': 12,
        'mesas_totales': 20,
        'ocupacion_pct': 60,
      };
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Hola, ${auth.usuario?.nombre ?? 'Admin'}',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const Text(
              'Resumen del día',
              style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () => Navigator.pushNamed(context, '/notifications'),
          ),
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => Navigator.pushNamed(context, '/configuracion'),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadDashboard,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildKPICards(),
                    const SizedBox(height: 20),
                    _buildPedidosActivos(),
                    const SizedBox(height: 20),
                    _buildVentasChart(),
                    const SizedBox(height: 20),
                    _buildAccesosRapidos(),
                  ],
                ),
              ),
            ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() => _selectedIndex = index);
          switch (index) {
            case 0:
              break;
            case 1:
              Navigator.pushNamed(context, '/dashboard/pedidos');
              break;
            case 2:
              Navigator.pushNamed(context, '/dashboard/cocina');
              break;
            case 3:
              Navigator.pushNamed(context, '/dashboard/inventario');
              break;
            case 4:
              Navigator.pushNamed(context, '/dashboard/reportes');
              break;
          }
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.receipt), label: 'Pedidos'),
          BottomNavigationBarItem(icon: Icon(Icons.kitchen), label: 'Cocina'),
          BottomNavigationBarItem(
              icon: Icon(Icons.inventory_2), label: 'Stock'),
          BottomNavigationBarItem(
              icon: Icon(Icons.analytics), label: 'Reportes'),
        ],
      ),
    );
  }

  Widget _buildKPICards() {
    if (_resumen == null) return const SizedBox();

    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.5,
      children: [
        _buildKPI(
          'Ventas Hoy',
          '\$${(_resumen!['ventas_hoy'] ?? 0).toStringAsFixed(0)}',
          Icons.attach_money,
          AppTheme.successColor,
        ),
        _buildKPI(
          'Pedidos',
          '${_resumen!['pedidos_hoy'] ?? 0}',
          Icons.receipt_long,
          AppTheme.primaryColor,
        ),
        _buildKPI(
          'Ticket Prom.',
          '\$${(_resumen!['ticket_promedio'] ?? 0).toStringAsFixed(0)}',
          Icons.trending_up,
          AppTheme.accentColor,
        ),
        _buildKPI(
          'Ocupación',
          '${_resumen!['ocupacion_pct'] ?? 0}%',
          Icons.table_restaurant,
          AppTheme.warningColor,
        ),
      ],
    );
  }

  Widget _buildKPI(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.cardDecoration.copyWith(
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: color, size: 28),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 12,
                  color: AppTheme.textSecondary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPedidosActivos() {
    final pedidos = context.watch<PedidoProvider>().pedidosActivos;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Pedidos Activos',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            TextButton(
              onPressed: () =>
                  Navigator.pushNamed(context, '/dashboard/pedidos'),
              child: const Text('Ver todos'),
            ),
          ],
        ),
        if (pedidos.isEmpty)
          Container(
            padding: const EdgeInsets.all(24),
            decoration: AppTheme.cardDecoration,
            child: const Center(
              child: Text(
                'No hay pedidos activos',
                style: TextStyle(color: AppTheme.textSecondary),
              ),
            ),
          )
        else
          ...pedidos.take(5).map((pedido) => Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor:
                        _getPedidoColor(pedido.estado).withOpacity(0.1),
                    child: Icon(
                      _getPedidoIcon(pedido.estado),
                      color: _getPedidoColor(pedido.estado),
                      size: 20,
                    ),
                  ),
                  title: Text(
                    'Pedido #${pedido.id.substring(0, 8).toUpperCase()}',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  subtitle: Text(
                    '${pedido.items.length} items — \$${pedido.total.toStringAsFixed(2)}',
                    style: const TextStyle(
                        fontSize: 13, color: AppTheme.textSecondary),
                  ),
                  trailing: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: _getPedidoColor(pedido.estado).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      pedido.estadoLabel,
                      style: TextStyle(
                        fontSize: 11,
                        color: _getPedidoColor(pedido.estado),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              )),
      ],
    );
  }

  Widget _buildVentasChart() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Ventas por Hora',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 200,
              child: BarChart(
                BarChartData(
                  alignment: BarChartAlignment.spaceAround,
                  maxY: 5000,
                  barGroups: [
                    _makeBarGroup(0, 1200),
                    _makeBarGroup(1, 2800),
                    _makeBarGroup(2, 4200),
                    _makeBarGroup(3, 3800),
                    _makeBarGroup(4, 5000),
                    _makeBarGroup(5, 3200),
                    _makeBarGroup(6, 2100),
                  ],
                  titlesData: FlTitlesData(
                    show: true,
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (value, meta) {
                          final hours = ['11', '12', '13', '14', '15', '16', '17'];
                          if (value.toInt() < hours.length) {
                            return Text('${hours[value.toInt()]}:00',
                                style: const TextStyle(fontSize: 11));
                          }
                          return const Text('');
                        },
                      ),
                    ),
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 40,
                        getTitlesWidget: (value, meta) {
                          return Text('\$${(value / 1000).toInt()}k',
                              style: const TextStyle(fontSize: 10));
                        },
                      ),
                    ),
                    topTitles:
                        const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    rightTitles:
                        const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  ),
                  borderData: FlBorderData(show: false),
                  gridData: const FlGridData(show: false),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  BarChartGroupData _makeBarGroup(int x, double y) {
    return BarChartGroupData(
      x: x,
      barRods: [
        BarChartRodData(
          toY: y,
          color: AppTheme.primaryColor,
          width: 20,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(6)),
        ),
      ],
    );
  }

  Widget _buildAccesosRapidos() {
    final accesos = [
      {'icon': Icons.kitchen, 'label': 'Cocina', 'route': '/dashboard/cocina'},
      {'icon': Icons.payment, 'label': 'Caja', 'route': '/dashboard/caja'},
      {'icon': Icons.calendar_month, 'label': 'Reservas', 'route': '/dashboard/reservas'},
      {'icon': Icons.people, 'label': 'RRHH', 'route': '/dashboard/rrhh'},
      {'icon': Icons.campaign, 'label': 'Marketing', 'route': '/dashboard/marketing'},
      {'icon': Icons.store, 'label': 'Sucursales', 'route': '/dashboard/sucursales'},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Accesos Rápidos',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 3,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1,
          children: accesos.map((acceso) {
            return GestureDetector(
              onTap: () => Navigator.pushNamed(context, acceso['route'] as String),
              child: Container(
                decoration: AppTheme.cardDecoration,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      acceso['icon'] as IconData,
                      size: 32,
                      color: AppTheme.primaryColor,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      acceso['label'] as String,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Color _getPedidoColor(String estado) {
    switch (estado) {
      case 'recibido':
        return AppTheme.warningColor;
      case 'aceptado':
        return Colors.blue;
      case 'en_preparacion':
        return AppTheme.accentColor;
      case 'listo':
        return AppTheme.successColor;
      default:
        return AppTheme.textSecondary;
    }
  }

  IconData _getPedidoIcon(String estado) {
    switch (estado) {
      case 'recibido':
        return Icons.new_releases;
      case 'aceptado':
        return Icons.check;
      case 'en_preparacion':
        return Icons.hourglass_top;
      case 'listo':
        return Icons.done_all;
      default:
        return Icons.receipt;
    }
  }
}
