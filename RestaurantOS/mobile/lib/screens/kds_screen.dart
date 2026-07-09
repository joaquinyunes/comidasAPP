import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../config/constants.dart';
import '../models/pedido.dart';
import '../providers/pedido_provider.dart';
import '../services/socket_service.dart';

class KDSScreen extends StatefulWidget {
  final String tipo;
  const KDSScreen({super.key, this.tipo = 'cocina'});

  @override
  State<KDSScreen> createState() => _KDSScreenState();
}

class _KDSScreenState extends State<KDSScreen> {
  final SocketService _socket = SocketService();

  @override
  void initState() {
    super.initState();
    _socket.connect();
    _listenEvents();
  }

  void _listenEvents() {
    _socket.on('pedido:nuevo', (data) {
      context.read<PedidoProvider>().actualizarPedidoRealtime(data);
      _showNotification('Nuevo pedido recibido');
    });

    _socket.on('pedido:item_listo', (data) {
      final pedidoId = data['pedido_id'];
      final itemId = data['item_id'];
      context.read<PedidoProvider>().actualizarItemRealtime(pedidoId, itemId, 'listo');
    });
  }

  void _showNotification(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppTheme.primaryColor,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  void dispose() {
    _socket.off('pedido:nuevo');
    _socket.off('pedido:item_listo');
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PedidoProvider>();
    final pedidos = provider.pedidosActivos;

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.tipo == 'cocina' ? 'KDS Cocina' : 'KDS Barra'),
        actions: [
          IconButton(
            icon: Icon(
              _socket.isConnected ? Icons.wifi : Icons.wifi_off,
              color: _socket.isConnected ? AppTheme.successColor : AppTheme.errorColor,
            ),
            onPressed: () {
              if (!_socket.isConnected) _socket.connect();
            },
          ),
        ],
      ),
      body: provider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : pedidos.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        widget.tipo == 'cocina' ? Icons.kitchen : Icons.local_bar,
                        size: 80,
                        color: AppTheme.textLight,
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Sin pedidos pendientes',
                        style: TextStyle(
                            fontSize: 18, color: AppTheme.textSecondary),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Esperando nuevos pedidos...',
                        style: TextStyle(color: AppTheme.textLight),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: () => provider.loadPedidos(),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: pedidos.length,
                    itemBuilder: (context, index) {
                      return _buildPedidoCard(pedidos[index]);
                    },
                  ),
                ),
    );
  }

  Widget _buildPedidoCard(Pedido pedido) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '#${pedido.id.substring(0, 8).toUpperCase()}',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: _getPedidoColor(pedido.estado)
                            .withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        pedido.estadoLabel,
                        style: TextStyle(
                          color: _getPedidoColor(pedido.estado),
                          fontWeight: FontWeight.w600,
                          fontSize: 12,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      _getTimeAgo(pedido.createdAt),
                      style: const TextStyle(
                        color: AppTheme.textSecondary,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            if (pedido.mesaId != null) ...[
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.table_restaurant,
                      size: 14, color: AppTheme.textSecondary),
                  const SizedBox(width: 4),
                  Text(
                    'Mesa ${pedido.mesaId!.substring(0, 4)}',
                    style: const TextStyle(
                        fontSize: 12, color: AppTheme.textSecondary),
                  ),
                ],
              ),
            ],
            const SizedBox(height: 12),
            ...pedido.items.map((item) => _buildItemRow(pedido, item)),
            if (pedido.notas != null && pedido.notas!.isNotEmpty) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppTheme.warningColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline,
                        size: 16, color: AppTheme.warningColor),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        pedido.notas!,
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppTheme.warningColor,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () =>
                        _avanzarPedido(pedido, 'aceptado'),
                    child: const Text('Aceptar'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () =>
                        _avanzarPedido(pedido, 'en_preparacion'),
                    child: const Text('Cocinar'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildItemRow(Pedido pedido, PedidoItem item) {
    final isReady = item.estado == 'listo';

    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: isReady
                  ? AppTheme.successColor.withOpacity(0.1)
                  : AppTheme.surfaceColor,
              borderRadius: BorderRadius.circular(6),
            ),
            child: Center(
              child: Text(
                '${item.cantidad}',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                  color:
                      isReady ? AppTheme.successColor : AppTheme.textPrimary,
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              item.productoNombre ?? 'Item',
              style: TextStyle(
                decoration: isReady ? TextDecoration.lineThrough : null,
                color: isReady ? AppTheme.textLight : AppTheme.textPrimary,
              ),
            ),
          ),
          if (!isReady)
            IconButton(
              onPressed: () =>
                  _toggleItemReady(pedido, item),
              icon: const Icon(Icons.check_circle_outline, size: 22),
              color: AppTheme.successColor,
            )
          else
            const Icon(Icons.check_circle, size: 22, color: AppTheme.successColor),
        ],
      ),
    );
  }

  Future<void> _avanzarPedido(Pedido pedido, String nuevoEstado) async {
    await context.read<PedidoProvider>().cambiarEstado(pedido.id, nuevoEstado);
  }

  Future<void> _toggleItemReady(Pedido pedido, PedidoItem item) async {
    final nuevoEstado = item.estado == 'listo' ? 'recibido' : 'listo';
    await context
        .read<PedidoProvider>()
        .cambiarEstado(pedido.id, nuevoEstado);
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

  String _getTimeAgo(DateTime date) {
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 1) return 'Ahora';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m';
    if (diff.inHours < 24) return '${diff.inHours}h';
    return '${diff.inDays}d';
  }
}
