import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../models/producto.dart';
import '../providers/cart_provider.dart';
import '../services/pedido_service.dart';
import '../widgets/producto_card.dart';

class MenuScreen extends StatefulWidget {
  final String? mesaId;
  final String? tenantSlug;

  const MenuScreen({super.key, this.mesaId, this.tenantSlug});

  @override
  State<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen> {
  final PedidoService _pedidoService = PedidoService();
  final TextEditingController _searchController = TextEditingController();

  List<Producto> _productos = [];
  List<Categoria> _categorias = [];
  List<Producto> _filteredProductos = [];
  String? _selectedCategoria;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadMenu();
  }

  Future<void> _loadMenu() async {
    setState(() => _isLoading = true);
    try {
      final productos = await _pedidoService.getMenuPublico();
      final categorias = await _pedidoService.getCategorias();
      setState(() {
        _productos = productos;
        _categorias = categorias;
        _filteredProductos = productos;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _filterByCategory(String? categoriaId) {
    setState(() {
      _selectedCategoria = categoriaId;
      if (categoriaId == null) {
        _filteredProductos = _productos;
      } else {
        _filteredProductos =
            _productos.where((p) => p.categoriaId == categoriaId).toList();
      }
    });
  }

  void _search(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredProductos = _selectedCategoria != null
            ? _productos
                .where((p) => p.categoriaId == _selectedCategoria)
                .toList()
            : _productos;
      } else {
        _filteredProductos = _productos
            .where((p) => p.nombre.toLowerCase().contains(query.toLowerCase()))
            .toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Menú'),
        actions: [
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.shopping_cart_outlined),
                onPressed: () => Navigator.pushNamed(context, '/cart'),
              ),
              if (cart.totalItems > 0)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: AppTheme.primaryColor,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      '${cart.totalItems}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              onChanged: _search,
              decoration: InputDecoration(
                hintText: 'Buscar platos...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          _search('');
                        },
                      )
                    : null,
              ),
            ),
          ),
          SizedBox(
            height: 40,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: const Text('Todos'),
                    selected: _selectedCategoria == null,
                    onSelected: (_) => _filterByCategory(null),
                    selectedColor: AppTheme.primaryColor.withOpacity(0.1),
                    labelStyle: TextStyle(
                      color: _selectedCategoria == null
                          ? AppTheme.primaryColor
                          : AppTheme.textPrimary,
                    ),
                  ),
                ),
                ..._categorias.map((cat) => Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: FilterChip(
                        label: Text(cat.nombre),
                        selected: _selectedCategoria == cat.id,
                        onSelected: (_) => _filterByCategory(cat.id),
                        selectedColor: AppTheme.primaryColor.withOpacity(0.1),
                        labelStyle: TextStyle(
                          color: _selectedCategoria == cat.id
                              ? AppTheme.primaryColor
                              : AppTheme.textPrimary,
                        ),
                      ),
                    )),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredProductos.isEmpty
                    ? const Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.restaurant_menu,
                                size: 64, color: AppTheme.textLight),
                            SizedBox(height: 16),
                            Text(
                              'No se encontraron platos',
                              style: TextStyle(
                                  color: AppTheme.textSecondary, fontSize: 16),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadMenu,
                        child: GridView.builder(
                          padding: const EdgeInsets.all(16),
                          gridDelegate:
                              const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            childAspectRatio: 0.75,
                            mainAxisSpacing: 12,
                            crossAxisSpacing: 12,
                          ),
                          itemCount: _filteredProductos.length,
                          itemBuilder: (context, index) {
                            return ProductoCard(
                              producto: _filteredProductos[index],
                              onTap: () => _showProductDetail(
                                  _filteredProductos[index]),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  void _showProductDetail(Producto producto) {
    final cart = context.read<CartProvider>();
    int cantidad = 1;
    String? notas;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return DraggableScrollableSheet(
              initialChildSize: 0.7,
              maxChildSize: 0.9,
              minChildSize: 0.5,
              expand: false,
              builder: (context, scrollController) {
                return SingleChildScrollView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(24),
                  child: Column(
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
                      if (producto.imagenUrl != null)
                        ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.network(
                            producto.imagenUrl!,
                            height: 200,
                            width: double.infinity,
                            fit: BoxFit.cover,
                          ),
                        ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              producto.nombre,
                              style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          Text(
                            '\$${producto.precio.toStringAsFixed(2)}',
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.primaryColor,
                            ),
                          ),
                        ],
                      ),
                      if (producto.descripcion != null) ...[
                        const SizedBox(height: 8),
                        Text(
                          producto.descripcion!,
                          style: const TextStyle(
                            color: AppTheme.textSecondary,
                            fontSize: 14,
                          ),
                        ),
                      ],
                      if (producto.tiempoPreparacionMin != null) ...[
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(Icons.timer_outlined,
                                size: 16, color: AppTheme.textSecondary),
                            const SizedBox(width: 4),
                            Text(
                              '${producto.tiempoPreparacionMin} min',
                              style: const TextStyle(
                                  color: AppTheme.textSecondary),
                            ),
                          ],
                        ),
                      ],
                      if (producto.nivelPicante > 0) ...[
                        const SizedBox(height: 8),
                        Row(
                          children: List.generate(
                            5,
                            (i) => Icon(
                              Icons.local_fire_department,
                              size: 20,
                              color: i < producto.nivelPicante
                                  ? Colors.orange
                                  : AppTheme.textLight,
                            ),
                          ),
                        ),
                      ],
                      const SizedBox(height: 16),
                      TextField(
                        maxLines: 2,
                        decoration: const InputDecoration(
                          hintText: 'Notas especiales (ej: sin cebolla)',
                          border: OutlineInputBorder(),
                        ),
                        onChanged: (value) => notas = value,
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          IconButton(
                            onPressed: cantidad > 1
                                ? () => setModalState(() => cantidad--)
                                : null,
                            icon: const Icon(Icons.remove_circle_outline),
                            iconSize: 32,
                            color: AppTheme.primaryColor,
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: Text(
                              '$cantidad',
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          IconButton(
                            onPressed: () => setModalState(() => cantidad++),
                            icon: const Icon(Icons.add_circle_outline),
                            iconSize: 32,
                            color: AppTheme.primaryColor,
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () {
                            for (var i = 0; i < cantidad; i++) {
                              cart.addItem(producto, notas: notas);
                            }
                            Navigator.pop(context);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(
                                    '${producto.nombre} agregado al carrito'),
                                backgroundColor: AppTheme.successColor,
                              ),
                            );
                          },
                          child: Text(
                            'Agregar — \$${(producto.precio * cantidad).toStringAsFixed(2)}',
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            );
          },
        );
      },
    );
  }
}
