import 'package:flutter/material.dart';
import '../models/producto.dart';

class CartItem {
  final Producto producto;
  int cantidad;
  String? notas;

  CartItem({required this.producto, this.cantidad = 1, this.notas});

  double get subtotal => producto.precio * cantidad;
}

class CartProvider extends ChangeNotifier {
  String? _sucursalId;
  String? _mesaId;
  final List<CartItem> _items = [];

  String? get sucursalId => _sucursalId;
  String? get mesaId => _mesaId;
  List<CartItem> get items => List.unmodifiable(_items);
  int get itemCount => _items.length;
  int get totalItems => _items.fold(0, (sum, item) => sum + item.cantidad);
  double get total => _items.fold(0, (sum, item) => sum + item.subtotal);
  bool get isEmpty => _items.isEmpty;

  void setMesa(String mesaId) {
    _mesaId = mesaId;
    notifyListeners();
  }

  void setSucursal(String sucursalId) {
    _sucursalId = sucursalId;
    notifyListeners();
  }

  void addItem(Producto producto, {String? notas}) {
    final index = _items.indexWhere(
      (item) => item.producto.id == producto.id && item.notas == notas,
    );

    if (index >= 0) {
      _items[index].cantidad++;
    } else {
      _items.add(CartItem(producto: producto, notas: notas));
    }
    notifyListeners();
  }

  void removeItem(String productoId) {
    _items.removeWhere((item) => item.producto.id == productoId);
    notifyListeners();
  }

  void updateQuantity(String productoId, int quantity) {
    final index = _items.indexWhere((item) => item.producto.id == productoId);
    if (index >= 0) {
      if (quantity <= 0) {
        _items.removeAt(index);
      } else {
        _items[index].cantidad = quantity;
      }
      notifyListeners();
    }
  }

  void clear() {
    _items.clear();
    _mesaId = null;
    notifyListeners();
  }

  List<Map<String, dynamic>> toPedidoItems() {
    return _items.map((item) => {
      'producto_id': item.producto.id,
      'cantidad': item.cantidad,
      'precio_unitario': item.producto.precio,
      if (item.notas != null) 'notas': item.notas,
    }).toList();
  }
}
