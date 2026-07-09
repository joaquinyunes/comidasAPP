import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../models/mesa.dart';
import '../services/api_service.dart';

class MesasScreen extends StatefulWidget {
  const MesasScreen({super.key});

  @override
  State<MesasScreen> createState() => _MesasScreenState();
}

class _MesasScreenState extends State<MesasScreen> {
  final ApiService _api = ApiService();
  List<Mesa> _mesas = [];
  bool _isLoading = true;
  String _vista = 'grid'; // grid or list

  @override
  void initState() {
    super.initState();
    _loadMesas();
  }

  Future<void> _loadMesas() async {
    setState(() => _isLoading = true);
    try {
      final response = await _api.get('/api/mesas');
      final data = response['data'] ?? response;
      _mesas = (data as List).map((m) => Mesa.fromJson(m)).toList();
    } catch (e) {
      _mesas = _getMockMesas();
    } finally {
      setState(() => _isLoading = false);
    }
  }

  List<Mesa> _getMockMesas() {
    return List.generate(20, (i) => Mesa(
      id: 'mesa-${i + 1}',
      tenantId: 't1',
      sucursalId: 's1',
      sectorId: 'sec1',
      numero: '${i + 1}',
      capacidad: [2, 4, 4, 6, 8][i % 5],
      estado: ['libre', 'comiendo', 'esperando_pedido', 'libre', 'reservada'][i % 5],
      qrCode: 'QR-${i + 1}',
    ));
  }

  @override
  Widget build(BuildContext context) {
    final libreCount = _mesas.where((m) => m.estado == 'libre').length;
    final ocupadasCount = _mesas.length - libreCount;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Plano de Mesas'),
        actions: [
          IconButton(
            icon: Icon(_vista == 'grid' ? Icons.list : Icons.grid_view),
            onPressed: () => setState(() =>
                _vista = _vista == 'grid' ? 'list' : 'grid'),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      _buildLegendItem('Libre', AppTheme.successColor, libreCount),
                      const SizedBox(width: 16),
                      _buildLegendItem('Ocupada', AppTheme.primaryColor, ocupadasCount),
                      const SizedBox(width: 16),
                      _buildLegendItem('Reservada', AppTheme.warningColor,
                          _mesas.where((m) => m.estado == 'reservada').length),
                    ],
                  ),
                ),
                Expanded(
                  child: _vista == 'grid' ? _buildGridView() : _buildListView(),
                ),
              ],
            ),
    );
  }

  Widget _buildLegendItem(String label, Color color, int count) {
    return Row(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(3),
          ),
        ),
        const SizedBox(width: 4),
        Text('$label ($count)',
            style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
      ],
    );
  }

  Widget _buildGridView() {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        mainAxisSpacing: 8,
        crossAxisSpacing: 8,
      ),
      itemCount: _mesas.length,
      itemBuilder: (context, index) {
        final mesa = _mesas[index];
        return GestureDetector(
          onTap: () => _showMesaDetail(mesa),
          child: Container(
            decoration: BoxDecoration(
              color: _getMesaColor(mesa.estado).withOpacity(0.15),
              border: Border.all(
                color: _getMesaColor(mesa.estado),
                width: 2,
              ),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  mesa.numero,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: _getMesaColor(mesa.estado),
                  ),
                ),
                Text(
                  '${mesa.capacidad}',
                  style: TextStyle(
                    fontSize: 11,
                    color: _getMesaColor(mesa.estado),
                  ),
                ),
                Icon(
                  Icons.person,
                  size: 14,
                  color: _getMesaColor(mesa.estado),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildListView() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _mesas.length,
      itemBuilder: (context, index) {
        final mesa = _mesas[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: _getMesaColor(mesa.estado).withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Center(
                child: Text(
                  mesa.numero,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: _getMesaColor(mesa.estado),
                  ),
                ),
              ),
            ),
            title: Text('Mesa ${mesa.numero}'),
            subtitle: Text('${mesa.capacidad} personas'),
            trailing: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: _getMesaColor(mesa.estado).withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                mesa.estadoLabel,
                style: TextStyle(
                  fontSize: 11,
                  color: _getMesaColor(mesa.estado),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            onTap: () => _showMesaDetail(mesa),
          ),
        );
      },
    );
  }

  void _showMesaDetail(Mesa mesa) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppTheme.dividerColor,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Mesa ${mesa.numero}',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            _buildDetailRow('Estado', mesa.estadoLabel),
            _buildDetailRow('Capacidad', '${mesa.capacidad} personas'),
            _buildDetailRow('QR Code', mesa.qrCode),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Cerrar'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(context);
                      _cambiarEstado(mesa);
                    },
                    child: const Text('Cambiar Estado'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(color: AppTheme.textSecondary)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  void _cambiarEstado(Mesa mesa) {
    final estados = ['libre', 'comiendo', 'esperando_pedido', 'limpieza'];
    showModalBottomSheet(
      context: context,
      builder: (context) => Column(
        mainAxisSize: MainAxisSize.min,
        children: estados.map((estado) {
          final label = {'libre': 'Libre', 'comiendo': 'Comiendo',
              'esperando_pedido': 'Esperando Pedido', 'limpieza': 'Limpieza'}[estado] ?? estado;
          return ListTile(
            title: Text(label),
            trailing: Radio<String>(
              value: estado,
              groupValue: mesa.estado,
              onChanged: (value) {
                Navigator.pop(context);
              },
            ),
          );
        }).toList(),
      ),
    );
  }

  Color _getMesaColor(String estado) {
    switch (estado) {
      case 'libre':
        return AppTheme.successColor;
      case 'comiendo':
        return AppTheme.primaryColor;
      case 'esperando_pedido':
        return Colors.blue;
      case 'reservada':
        return AppTheme.warningColor;
      case 'limpieza':
        return AppTheme.textSecondary;
      default:
        return AppTheme.textLight;
    }
  }
}
