import 'package:flutter/material.dart';
import 'package:table_calendar/table_calendar.dart';
import '../config/theme.dart';
import '../models/reserva.dart';
import '../services/api_service.dart';

class ReservasScreen extends StatefulWidget {
  const ReservasScreen({super.key});

  @override
  State<ReservasScreen> createState() => _ReservasScreenState();
}

class _ReservasScreenState extends State<ReservasScreen> {
  final ApiService _api = ApiService();
  CalendarFormat _calendarFormat = CalendarFormat.month;
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;
  List<Reserva> _reservas = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _selectedDay = DateTime.now();
    _loadReservas();
  }

  Future<void> _loadReservas() async {
    setState(() => _isLoading = true);
    try {
      final response = await _api.get('/api/reservas');
      final data = response['data'] ?? response;
      _reservas = (data as List).map((r) => Reserva.fromJson(r)).toList();
    } catch (e) {
      _reservas = _getMockReservas();
    } finally {
      setState(() => _isLoading = false);
    }
  }

  List<Reserva> _getMockReservas() {
    return [
      Reserva(
        id: 'r1', tenantId: 't1', sucursalId: 's1',
        fecha: DateTime.now(), hora: '12:30', cantidadPersonas: 4,
        zona: 'Terraza', clienteId: 'c1',
        estado: 'confirmada', createdAt: DateTime.now(),
      ),
      Reserva(
        id: 'r2', tenantId: 't1', sucursalId: 's1',
        fecha: DateTime.now(), hora: '13:00', cantidadPersonas: 2,
        zona: 'Interior', clienteId: 'c2',
        estado: 'pendiente', createdAt: DateTime.now(),
      ),
      Reserva(
        id: 'r3', tenantId: 't1', sucursalId: 's1',
        fecha: DateTime.now().add(const Duration(days: 1)),
        hora: '20:00', cantidadPersonas: 8, zona: 'VIP',
        occasion: 'Cumpleaños', clienteId: 'c3',
        estado: 'pendiente', createdAt: DateTime.now(),
      ),
      Reserva(
        id: 'r4', tenantId: 't1', sucursalId: 's1',
        fecha: DateTime.now().add(const Duration(days: 2)),
        hora: '19:30', cantidadPersonas: 6,
        zona: 'Terraza', clienteId: 'c4',
        estado: 'confirmada', createdAt: DateTime.now(),
      ),
    ];
  }

  List<Reserva> get _reservasDelDia {
    if (_selectedDay == null) return [];
    return _reservas.where((r) =>
        r.fecha.year == _selectedDay!.year &&
        r.fecha.month == _selectedDay!.month &&
        r.fecha.day == _selectedDay!.day).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Reservas'),
        actions: [
          IconButton(
            icon: const Icon(Icons.calendar_today),
            onPressed: () => setState(() => _focusedDay = DateTime.now()),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showNewReservaDialog(),
        child: const Icon(Icons.add),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                TableCalendar(
                  locale: 'es_ES',
                  firstDay: DateTime.now().subtract(const Duration(days: 365)),
                  lastDay: DateTime.now().add(const Duration(days: 365)),
                  focusedDay: _focusedDay,
                  calendarFormat: _calendarFormat,
                  selectedDayPredicate: (day) =>
                      isSameDay(_selectedDay, day),
                  onDaySelected: (selectedDay, focusedDay) {
                    setState(() {
                      _selectedDay = selectedDay;
                      _focusedDay = focusedDay;
                    });
                  },
                  onFormatChanged: (format) {
                    setState(() => _calendarFormat = format);
                  },
                  eventLoader: (day) {
                    return _reservas.where((r) =>
                        isSameDay(r.fecha, day)).toList();
                  },
                  calendarStyle: const CalendarStyle(
                    todayDecoration: BoxDecoration(
                      color: AppTheme.primaryColor,
                      shape: BoxShape.circle,
                    ),
                    selectedDecoration: BoxDecoration(
                      color: AppTheme.secondaryColor,
                      shape: BoxShape.circle,
                    ),
                    markerDecoration: BoxDecoration(
                      color: AppTheme.accentColor,
                      shape: BoxShape.circle,
                    ),
                    markersMaxCount: 3,
                  ),
                  headerStyle: const HeaderStyle(
                    formatButtonVisible: true,
                    titleCentered: true,
                  ),
                ),
                const SizedBox(height: 8),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: [
                      Text(
                        'Reservas del ${_selectedDay?.day ?? ""}',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const Spacer(),
                      Text(
                        '${_reservasDelDia.length} reserva(s)',
                        style: const TextStyle(
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                Expanded(
                  child: _reservasDelDia.isEmpty
                      ? const Center(
                          child: Text(
                            'Sin reservas este día',
                            style: TextStyle(color: AppTheme.textSecondary),
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: _reservasDelDia.length,
                          itemBuilder: (context, index) {
                            return _buildReservaCard(_reservasDelDia[index]);
                          },
                        ),
                ),
              ],
            ),
    );
  }

  Widget _buildReservaCard(Reserva reserva) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: _getReservaColor(reserva.estado).withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Center(
                child: Text(
                  reserva.hora.substring(0, 5),
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: _getReservaColor(reserva.estado),
                    fontSize: 12,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${reserva.cantidadPersonas} personas',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${reserva.zona ?? "Sin zona"}${reserva.occasion != null ? " • ${reserva.occasion}" : ""}',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: _getReservaColor(reserva.estado).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    reserva.estadoLabel,
                    style: TextStyle(
                      fontSize: 11,
                      color: _getReservaColor(reserva.estado),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (reserva.estado == 'pendiente') ...[
                      IconButton(
                        onPressed: () => _confirmarReserva(reserva),
                        icon: const Icon(Icons.check, size: 18),
                        color: AppTheme.successColor,
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
                      const SizedBox(width: 8),
                      IconButton(
                        onPressed: () => _cancelarReserva(reserva),
                        icon: const Icon(Icons.close, size: 18),
                        color: AppTheme.errorColor,
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _confirmarReserva(Reserva reserva) {
    setState(() {
      final index = _reservas.indexWhere((r) => r.id == reserva.id);
      if (index >= 0) {
        _reservas[index] = Reserva(
          id: reserva.id,
          tenantId: reserva.tenantId,
          sucursalId: reserva.sucursalId,
          mesaId: reserva.mesaId,
          clienteId: reserva.clienteId,
          fecha: reserva.fecha,
          hora: reserva.hora,
          cantidadPersonas: reserva.cantidadPersonas,
          zona: reserva.zona,
          occasion: reserva.occasion,
          notas: reserva.notas,
          estado: 'confirmada',
          createdAt: reserva.createdAt,
        );
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Reserva confirmada'),
        backgroundColor: AppTheme.successColor,
      ),
    );
  }

  void _cancelarReserva(Reserva reserva) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancelar Reserva'),
        content: const Text('¿Estás seguro de cancelar esta reserva?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('No'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              setState(() {
                final index = _reservas.indexWhere((r) => r.id == reserva.id);
                if (index >= 0) {
                  _reservas[index] = Reserva(
                    id: reserva.id,
                    tenantId: reserva.tenantId,
                    sucursalId: reserva.sucursalId,
                    fecha: reserva.fecha,
                    hora: reserva.hora,
                    cantidadPersonas: reserva.cantidadPersonas,
                    zona: reserva.zona,
                    estado: 'cancelada',
                    createdAt: reserva.createdAt,
                  );
                }
              });
            },
            child: const Text('Sí, cancelar',
                style: TextStyle(color: AppTheme.errorColor)),
          ),
        ],
      ),
    );
  }

  void _showNewReservaDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
            left: 24,
            right: 24,
            top: 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Nueva Reserva',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              TextField(
                decoration: const InputDecoration(
                  labelText: 'Nombre del cliente',
                  prefixIcon: Icon(Icons.person),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Personas',
                        prefixIcon: Icon(Icons.group),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      decoration: const InputDecoration(
                        labelText: 'Hora',
                        prefixIcon: Icon(Icons.access_time),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(
                  labelText: 'Zona',
                  prefixIcon: Icon(Icons.location_on),
                ),
                items: const [
                  DropdownMenuItem(value: 'interior', child: Text('Interior')),
                  DropdownMenuItem(value: 'terraza', child: Text('Terraza')),
                  DropdownMenuItem(value: 'barra', child: Text('Barra')),
                  DropdownMenuItem(value: 'vip', child: Text('VIP')),
                ],
                onChanged: (value) {},
              ),
              const SizedBox(height: 12),
              TextField(
                decoration: const InputDecoration(
                  labelText: 'Ocasión (opcional)',
                  prefixIcon: Icon(Icons.celebration),
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Reserva creada'),
                        backgroundColor: AppTheme.successColor,
                      ),
                    );
                  },
                  child: const Text('Crear Reserva'),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        );
      },
    );
  }

  Color _getReservaColor(String estado) {
    switch (estado) {
      case 'confirmada':
        return AppTheme.successColor;
      case 'pendiente':
        return AppTheme.warningColor;
      case 'cancelada':
        return AppTheme.errorColor;
      case 'no_show':
        return AppTheme.textSecondary;
      default:
        return AppTheme.textSecondary;
    }
  }
}
