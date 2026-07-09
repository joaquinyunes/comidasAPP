import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../config/constants.dart';
import '../providers/pedido_provider.dart';

class TrackingScreen extends StatefulWidget {
  final String pedidoId;
  const TrackingScreen({super.key, required this.pedidoId});

  @override
  State<TrackingScreen> createState() => _TrackingScreenState();
}

class _TrackingScreenState extends State<TrackingScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PedidoProvider>().loadPedido(widget.pedidoId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PedidoProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Seguimiento del Pedido')),
      body: provider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : provider.pedidoActual == null
              ? const Center(child: Text('Pedido no encontrado'))
              : _buildTracking(provider),
    );
  }

  Widget _buildTracking(PedidoProvider provider) {
    final pedido = provider.pedidoActual!;
    final steps = [
      'recibido',
      'aceptado',
      'en_preparacion',
      'listo',
      'entregado',
    ];
    final currentIndex = steps.indexOf(pedido.estado);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Pedido #${pedido.id.substring(0, 8).toUpperCase()}',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: _getStatusColor(pedido.estado).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          pedido.estadoLabel,
                          style: TextStyle(
                            color: _getStatusColor(pedido.estado),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildProgressSteps(steps, currentIndex),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Items del Pedido',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ...pedido.items.map((item) => Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Row(
                          children: [
                            Container(
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                color: _getStatusColor(item.estado)
                                    .withOpacity(0.1),
                                shape: BoxShape.circle,
                              ),
                              child: Center(
                                child: Text(
                                  '${item.cantidad}',
                                  style: TextStyle(
                                    color: _getStatusColor(item.estado),
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                item.productoNombre ?? 'Item',
                                style: const TextStyle(fontSize: 15),
                              ),
                            ),
                            Icon(
                              _getItemStatusIcon(item.estado),
                              size: 20,
                              color: _getStatusColor(item.estado),
                            ),
                          ],
                        ),
                      )),
                  const Divider(),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total',
                          style: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.bold)),
                      Text(
                        '\$${pedido.total.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryColor,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          if (provider.timeline.isNotEmpty) ...[
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Historial',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    ...provider.timeline.reversed.map((evento) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 8,
                                height: 8,
                                margin: const EdgeInsets.only(top: 6),
                                decoration: const BoxDecoration(
                                  color: AppTheme.primaryColor,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      _eventoLabel(evento.evento),
                                      style: const TextStyle(
                                          fontWeight: FontWeight.w500),
                                    ),
                                    Text(
                                      _formatTime(evento.createdAt),
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: AppTheme.textSecondary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        )),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildProgressSteps(List<String> steps, int currentIndex) {
    return Row(
      children: List.generate(steps.length, (index) {
        final isActive = index <= currentIndex;
        final isCurrent = index == currentIndex;

        return Expanded(
          child: Column(
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: isActive ? AppTheme.primaryColor : AppTheme.dividerColor,
                  shape: BoxShape.circle,
                  border: isCurrent
                      ? Border.all(color: AppTheme.primaryColor, width: 3)
                      : null,
                ),
                child: Center(
                  child: isActive
                      ? const Icon(Icons.check, size: 16, color: Colors.white)
                      : Text(
                          '${index + 1}',
                          style: TextStyle(
                            fontSize: 12,
                            color: isActive ? Colors.white : AppTheme.textSecondary,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                _stepLabel(steps[index]),
                style: TextStyle(
                  fontSize: 10,
                  color: isActive
                      ? AppTheme.textPrimary
                      : AppTheme.textSecondary,
                  fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                ),
                textAlign: TextAlign.center,
              ),
              if (index < steps.length - 1)
                Container(
                  margin: const EdgeInsets.only(top: 4),
                  height: 2,
                  color: index < currentIndex
                      ? AppTheme.primaryColor
                      : AppTheme.dividerColor,
                ),
            ],
          ),
        );
      }),
    );
  }

  String _stepLabel(String step) {
    switch (step) {
      case 'recibido':
        return 'Recibido';
      case 'aceptado':
        return 'Aceptado';
      case 'en_preparacion':
        return 'Preparando';
      case 'listo':
        return 'Listo';
      case 'entregado':
        return 'Entregado';
      default:
        return step;
    }
  }

  String _eventoLabel(String evento) {
    switch (evento) {
      case 'pedido_creado':
        return 'Pedido creado';
      case 'pedido_aceptado':
        return 'Pedido aceptado';
      case 'item_en_preparacion':
        return 'Item en preparación';
      case 'item_listo':
        return 'Item listo';
      case 'pedido_entregado':
        return 'Pedido entregado';
      case 'pedido_cerrado':
        return 'Pedido cerrado';
      default:
        return evento;
    }
  }

  Color _getStatusColor(String estado) {
    switch (estado) {
      case 'recibido':
        return AppTheme.warningColor;
      case 'aceptado':
        return Colors.blue;
      case 'en_preparacion':
        return AppTheme.accentColor;
      case 'listo':
        return AppTheme.successColor;
      case 'entregado':
        return AppTheme.successColor;
      case 'cerrado':
        return AppTheme.textSecondary;
      case 'cancelado':
        return AppTheme.errorColor;
      default:
        return AppTheme.textSecondary;
    }
  }

  IconData _getItemStatusIcon(String estado) {
    switch (estado) {
      case 'recibido':
        return Icons.receipt_long;
      case 'en_preparacion':
        return Icons.hourglass_top;
      case 'listo':
        return Icons.check_circle;
      case 'entregado':
        return Icons.done_all;
      default:
        return Icons.circle;
    }
  }

  String _formatTime(DateTime date) {
    return '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
  }
}
