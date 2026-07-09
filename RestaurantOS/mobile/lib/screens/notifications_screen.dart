import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../services/api_service.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final ApiService _api = ApiService();
  List<Map<String, dynamic>> _notificaciones = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() => _isLoading = true);
    try {
      final response = await _api.get('/api/notificaciones');
      final data = response['data'] ?? response;
      _notificaciones = List<Map<String, dynamic>>.from(data);
    } catch (e) {
      _notificaciones = _getMockNotifications();
    } finally {
      setState(() => _isLoading = false);
    }
  }

  List<Map<String, dynamic>> _getMockNotifications() {
    return [
      {
        'id': '1',
        'tipo': 'pedido',
        'titulo': 'Nuevo pedido #ABC123',
        'mensaje': 'Mesa 5 - 3 platos, 2 bebidas',
        'leida': false,
        'created_at': DateTime.now().subtract(const Duration(minutes: 5)).toIso8601String(),
      },
      {
        'id': '2',
        'tipo': 'stock',
        'titulo': 'Stock bajo - Tomate',
        'mensaje': 'Quedan 2kg de tomate en sucursal central',
        'leida': false,
        'created_at': DateTime.now().subtract(const Duration(minutes: 30)).toIso8601String(),
      },
      {
        'id': '3',
        'tipo': 'reserva',
        'titulo': 'Nueva reserva',
        'mensaje': 'García - 6 personas - 20:00 - Terraza',
        'leida': true,
        'created_at': DateTime.now().subtract(const Duration(hours: 2)).toIso8601String(),
      },
      {
        'id': '4',
        'tipo': 'caja',
        'titulo': 'Caja cerrada',
        'mensaje': 'Sucursal Norte cerrada con \$45,200',
        'leida': true,
        'created_at': DateTime.now().subtract(const Duration(hours: 5)).toIso8601String(),
      },
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notificaciones'),
        actions: [
          TextButton(
            onPressed: _markAllAsRead,
            child: const Text('Marcar todo leído'),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _notificaciones.isEmpty
              ? const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.notifications_none,
                          size: 80, color: AppTheme.textLight),
                      SizedBox(height: 16),
                      Text(
                        'Sin notificaciones',
                        style: TextStyle(
                            fontSize: 18, color: AppTheme.textSecondary),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadNotifications,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(8),
                    itemCount: _notificaciones.length,
                    itemBuilder: (context, index) {
                      final notif = _notificaciones[index];
                      final isRead = notif['leida'] == true;

                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        color: isRead ? null : AppTheme.primaryColor.withOpacity(0.03),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor:
                                _getNotifColor(notif['tipo']).withOpacity(0.1),
                            child: Icon(
                              _getNotifIcon(notif['tipo']),
                              color: _getNotifColor(notif['tipo']),
                              size: 20,
                            ),
                          ),
                          title: Text(
                            notif['titulo'] ?? '',
                            style: TextStyle(
                              fontWeight:
                                  isRead ? FontWeight.normal : FontWeight.bold,
                            ),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 4),
                              Text(
                                notif['mensaje'] ?? '',
                                style: const TextStyle(
                                    fontSize: 13, color: AppTheme.textSecondary),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                _formatTime(DateTime.parse(
                                    notif['created_at'])),
                                style: const TextStyle(
                                    fontSize: 11, color: AppTheme.textLight),
                              ),
                            ],
                          ),
                          trailing: !isRead
                              ? const Icon(Icons.circle,
                                  size: 8, color: AppTheme.primaryColor)
                              : null,
                        ),
                      );
                    },
                  ),
                ),
    );
  }

  void _markAllAsRead() {
    setState(() {
      for (var notif in _notificaciones) {
        notif['leida'] = true;
      }
    });
  }

  Color _getNotifColor(String? tipo) {
    switch (tipo) {
      case 'pedido':
        return AppTheme.primaryColor;
      case 'stock':
        return AppTheme.warningColor;
      case 'reserva':
        return Colors.blue;
      case 'caja':
        return AppTheme.successColor;
      default:
        return AppTheme.textSecondary;
    }
  }

  IconData _getNotifIcon(String? tipo) {
    switch (tipo) {
      case 'pedido':
        return Icons.receipt_long;
      case 'stock':
        return Icons.warning_amber;
      case 'reserva':
        return Icons.calendar_today;
      case 'caja':
        return Icons.payments;
      default:
        return Icons.notifications;
    }
  }

  String _formatTime(DateTime date) {
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 1) return 'Ahora';
    if (diff.inMinutes < 60) return 'Hace ${diff.inMinutes} min';
    if (diff.inHours < 24) return 'Hace ${diff.inHours}h';
    return 'Hace ${diff.inDays}d';
  }
}
