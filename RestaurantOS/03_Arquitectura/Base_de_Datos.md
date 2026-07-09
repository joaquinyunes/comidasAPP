# Diseño de Base de Datos — RestaurantOS

**Motor**: PostgreSQL 15+
**Estrategia multi-tenant**: Columna `tenant_id` + Row-Level Security (RLS)

---

## Convenciones

- Todas las tablas operativas tienen `tenant_id` (uuid)
- Todas las tablas tienen `id` (uuid) como PK
- Todas las tablas tienen `created_at`, `updated_at` (timestamptz)
- Tablas deSoft delete: `deleted_at` (timestamptz, nullable)
- Auditoría: `audit_log` append-only
- Índices compuestos: `(tenant_id, ...)` en casi todas las tablas

---

## Schema completo

### 1. Identidad y Accesos

```sql
-- Restaurantes (tenants)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  config JSONB DEFAULT '{}',
  plan VARCHAR(50) DEFAULT 'basico',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sucursales
CREATE TABLE sucursales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  nombre VARCHAR(255) NOT NULL,
  direccion TEXT,
  telefono VARCHAR(50),
  email VARCHAR(255),
  horario JSONB,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Usuarios
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  email VARCHAR(255 NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  avatar_url TEXT,
  password_hash TEXT,
  email_verificado BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Roles
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  permisos JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Relación usuario-rol
CREATE TABLE usuario_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  rol_id UUID NOT NULL REFERENCES roles(id),
  sucursal_id UUID REFERENCES sucursales(id),
  UNIQUE(usuario_id, rol_id, sucursal_id)
);

-- Sesiones (para refresh tokens)
CREATE TABLE sesiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  token_hash TEXT NOT NULL,
  expira_en TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2. Salón y Mesas

```sql
-- Sectores del restaurante
CREATE TABLE sectores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  sucursal_id UUID NOT NULL REFERENCES sucursales(id),
  nombre VARCHAR(100) NOT NULL,
  tipo VARCHAR(50), -- salón, terraza, barra, VIP, patio
  orden INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Mesas
CREATE TABLE mesas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  sucursal_id UUID NOT NULL REFERENCES sucursales(id),
  sector_id UUID NOT NULL REFERENCES sectores(id),
  numero VARCHAR(10) NOT NULL,
  capacidad INT NOT NULL DEFAULT 4,
  estado VARCHAR(50) DEFAULT 'libre',
  posicion_x FLOAT,
  posicion_y FLOAT,
  qr_code TEXT UNIQUE NOT NULL,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Estados posibles de mesa: libre, esperando_pedido, en_cocina, comiendo, esperando_cuenta, reservada, limpieza
```

### 3. Menú y Recetas

```sql
-- Categorías del menú
CREATE TABLE categorias_menu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  imagen_url TEXT,
  orden INT DEFAULT 0,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Productos (platos y bebidas)
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  categoria_id UUID NOT NULL REFERENCES categorias_menu(id),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  costo DECIMAL(10,2),
  margen DECIMAL(5,2),
  imagen_url TEXT,
  video_url TEXT,
  tiempo_preparacion_min INT,
  nivel_picante INT DEFAULT 0, -- 0-5
  calorias INT,
  proteinas DECIMAL(5,2),
  grasas DECIMAL(5,2),
  carbohidratos DECIMAL(5,2),
  alergenos TEXT[], -- array: ['gluten', 'lactosa', etc.]
  disponible BOOLEAN DEFAULT true,
  destacado BOOLEAN DEFAULT false,
  tipo VARCHAR(50) DEFAULT 'plato', -- plato, bebida, postre
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Ingredientes
CREATE TABLE ingredientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  nombre VARCHAR(255) NOT NULL,
  unidad_medida VARCHAR(50) NOT NULL, -- g, ml, unidad, porcion
  costo_unitario DECIMAL(10,4),
  proveedor_id UUID,
  stock_minimo DECIMAL(10,2),
  stock_maximo DECIMAL(10,2),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Recetas (qué ingredientes tiene cada producto)
CREATE TABLE recetas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  producto_id UUID NOT NULL REFERENCES productos(id),
  nombre VARCHAR(255),
  porciones INT DEFAULT 1,
  instrucciones TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ingredientes de cada receta
CREATE TABLE receta_ingredientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  receta_id UUID NOT NULL REFERENCES recetas(id),
  ingrediente_id UUID NOT NULL REFERENCES ingredientes(id),
  cantidad DECIMAL(10,3) NOT NULL,
  unidad VARCHAR(50) NOT NULL,
  opcional BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4. Pedidos y Cocina

```sql
-- Pedidos
CREATE TABLE pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  sucursal_id UUID NOT NULL REFERENCES sucursales(id),
  mesa_id UUID REFERENCES mesas(id),
  cliente_id UUID REFERENCES clientes(id),
  mozo_id UUID REFERENCES usuarios(id),
  estado VARCHAR(50) DEFAULT 'recibido',
  tipo VARCHAR(50) DEFAULT 'mesa', -- mesa, delivery, retiro
  notas TEXT,
  total DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Estados posibles: recibido, aceptado, en_preparacion, listo, entregado, cerrado, cancelado

-- Items del pedido
CREATE TABLE pedido_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  pedido_id UUID NOT NULL REFERENCES pedidos(id),
  producto_id UUID NOT NULL REFERENCES productos(id),
  cantidad INT NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  notas TEXT,
  estado VARCHAR(50) DEFAULT 'recibido',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bitácora de eventos (timestamps de cada cambio)
CREATE TABLE pedido_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  pedido_id UUID NOT NULL REFERENCES pedidos(id),
  pedido_item_id UUID REFERENCES pedido_items(id),
  evento VARCHAR(100) NOT NULL, -- pedido_creado, item_en_preparacion, item_listo, etc.
  usuario_id UUID REFERENCES usuarios(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 5. Reservas

```sql
CREATE TABLE reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  sucursal_id UUID NOT NULL REFERENCES sucursales(id),
  mesa_id UUID REFERENCES mesas(id),
  cliente_id UUID REFERENCES clientes(id),
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  cantidad_personas INT NOT NULL,
  zona VARCHAR(50), -- interior, terraza, ventana, VIP
  occasion VARCHAR(100), -- cumpleaños, aniversario, etc.
  notas TEXT,
  estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, confirmada, no_show, cancelada
  recordatorio_enviado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 6. Inventario y Compras

```sql
-- Stock por ingrediente y sucursal
CREATE TABLE stock_por_sucursal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  sucursal_id UUID NOT NULL REFERENCES sucursales(id),
  ingrediente_id UUID NOT NULL REFERENCES ingredientes(id),
  cantidad_actual DECIMAL(10,3) NOT NULL DEFAULT 0,
  cantidad_reservada DECIMAL(10,3) DEFAULT 0,
  lote VARCHAR(100),
  fecha_vencimiento DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Movimientos de stock (audit log)
CREATE TABLE stock_movimientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  sucursal_id UUID NOT NULL REFERENCES sucursales(id),
  ingrediente_id UUID NOT NULL REFERENCES ingredientes(id),
  tipo VARCHAR(50) NOT NULL, -- entrada, salida, merma, ajuste, transferencia
  cantidad DECIMAL(10,3) NOT NULL,
  motivo TEXT,
  pedido_id UUID REFERENCES pedidos(id),
  usuario_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Proveedores
CREATE TABLE proveedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  nombre VARCHAR(255) NOT NULL,
  contacto_nombre VARCHAR(255),
  contacto_email VARCHAR(255),
  contacto_telefono VARCHAR(50),
  direccion TEXT,
  tiempo_entrega_dias INT,
  calificacion DECIMAL(3,2),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Catálogo de proveedor (qué vende cada proveedor y a qué precio)
CREATE TABLE proveedor_producto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  proveedor_id UUID NOT NULL REFERENCES proveedores(id),
  ingrediente_id UUID NOT NULL REFERENCES ingredientes(id),
  precio DECIMAL(10,4) NOT NULL,
  unidad VARCHAR(50) NOT NULL,
  tiempo_entrega_dias INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Órdenes de compra
CREATE TABLE ordenes_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  sucursal_id UUID NOT NULL REFERENCES sucursales(id),
  proveedor_id UUID NOT NULL REFERENCES proveedores(id),
  estado VARCHAR(50) DEFAULT 'borrador', -- borrador, enviada, confirmada, recibida, cancelada
  total DECIMAL(10,2),
  notas TEXT,
  usuario_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Items de orden de compra
CREATE TABLE ordenes_compra_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  orden_compra_id UUID NOT NULL REFERENCES ordenes_compra(id),
  ingrediente_id UUID NOT NULL REFERENCES ingredientes(id),
  cantidad DECIMAL(10,3) NOT NULL,
  precio_unitario DECIMAL(10,4) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 7. Caja y Pagos

```sql
-- Cajas (apertura/cierre)
CREATE TABLE cajas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  sucursal_id UUID NOT NULL REFERENCES sucursales(id),
  cajero_id UUID NOT NULL REFERENCES usuarios(id),
  monto_inicial DECIMAL(10,2) NOT NULL,
  monto_final DECIMAL(10,2),
  diferencia DECIMAL(10,2),
  estado VARCHAR(50) DEFAULT 'abierta', -- abierta, cerrada
  abierta_en TIMESTAMPTZ DEFAULT now(),
  cerrada_en TIMESTAMPTZ
);

-- Pagos
CREATE TABLE pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  pedido_id UUID NOT NULL REFERENCES pedidos(id),
  caja_id UUID REFERENCES cajas(id),
  monto DECIMAL(10,2) NOT NULL,
  propina DECIMAL(10,2) DEFAULT 0,
  metodo_pago VARCHAR(50) NOT NULL, -- efectivo, tarjeta_credito, tarjeta_debito, qr, transferencia
  estado VARCHAR(50) DEFAULT 'completado', -- pendiente, completado, reembolsado
  comprobante_url TEXT,
  facturacion_electronica_id VARCHAR(255),
  usuario_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 8. Clientes y CRM

```sql
-- Clientes
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefono VARCHAR(50),
  fecha_nacimiento DATE,
  alergias TEXT[],
  dieta VARCHAR(100),
  preferencias JSONB DEFAULT '{}',
  puntos INT DEFAULT 0,
  nivel VARCHAR(50) DEFAULT 'bronce', -- bronce, plata, oro, diamante
  total_gastado DECIMAL(10,2) DEFAULT 0,
  total_visitas INT DEFAULT 0,
  ultima_visita TIMESTAMPTZ,
  opt_in_marketing BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Favoritos del cliente
CREATE TABLE cliente_favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  producto_id UUID NOT NULL REFERENCES productos(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 9. Marketing y Fidelización

```sql
-- Campañas
CREATE TABLE campanas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  nombre VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- email, whatsapp, sms, push
  segmento JSONB, -- filtros de segmentación
  contenido TEXT,
  programada_para TIMESTAMPTZ,
  estado VARCHAR(50) DEFAULT 'borrador', -- borrador, programada, enviada
  estadisticas JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Cupones
CREATE TABLE cupones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  codigo VARCHAR(50) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- porcentaje, monto_fijo, producto_gratis
  valor DECIMAL(10,2),
  uso_maximo INT,
  uso_actual INT DEFAULT 0,
  vigente_desde TIMESTAMPTZ,
  vigente_hasta TIMESTAMPTZ,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Historial de puntos
CREATE TABLE puntos_historial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  tipo VARCHAR(50) NOT NULL, -- acumulacion, canje, ajuste
  puntos INT NOT NULL,
  motivo TEXT,
  pedido_id UUID REFERENCES pedidos(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 10. RRHH

```sql
-- Empleados (extiende usuarios)
CREATE TABLE empleados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  sucursal_id UUID NOT NULL REFERENCES sucursales(id),
  cargo VARCHAR(100),
  fecha_ingreso DATE,
  salario_base DECIMAL(10,2),
  tipo_contrato VARCHAR(50),
  estado VARCHAR(50) DEFAULT 'activo',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Turnos
CREATE TABLE turnos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  empleado_id UUID NOT NULL REFERENCES empleados(id),
  sucursal_id UUID NOT NULL REFERENCES sucursales(id),
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  estado VARCHAR(50) DEFAULT 'asignado', -- asignado, completado, ausente
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Asistencia
CREATE TABLE asistencia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  empleado_id UUID NOT NULL REFERENCES empleados(id),
  turno_id UUID REFERENCES turnos(id),
  entrada TIMESTAMPTZ,
  salida TIMESTAMPTZ,
  horas_trabajadas DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 11. Auditoría

```sql
-- Log de auditoría (append-only, sin delete)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  usuario_id UUID REFERENCES usuarios(id),
  accion VARCHAR(100) NOT NULL, -- create, update, delete, login, logout, etc.
  entidad VARCHAR(100) NOT NULL,
  entidad_id UUID,
  valor_anterior JSONB,
  valor_nuevo JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Índices críticos

```sql
-- Multi-tenant: filtro base
CREATE INDEX idx_tenant ON pedidos(tenant_id);
CREATE INDEX idx_tenant ON mesas(tenant_id);

-- Mesas en tiempo real
CREATE INDEX idx_mesas_estado ON mesas(tenant_id, sucursal_id, estado);

-- Pedidos activos
CREATE INDEX idx_pedidos_activos ON pedidos(tenant_id, sucursal_id, estado);

-- Bitácora
CREATE INDEX idx_pedido_eventos ON pedido_eventos(pedido_id, created_at);

-- Stock
CREATE INDEX idx_stock_sucursal ON stock_por_sucursal(tenant_id, sucursal_id, ingrediente_id);

-- Clientes
CREATE INDEX idx_clientes_tenant ON clientes(tenant_id);

-- Auditoría
CREATE INDEX idx_audit_entidad ON audit_log(tenant_id, entidad, entidad_id);
CREATE INDEX idx_audit_fecha ON audit_log(tenant_id, created_at);
```

---

## RLS (Row-Level Security)

```sql
-- Función para obtener tenant actual (se setea por conexión)
CREATE OR REPLACE FUNCTION set_current_tenant(tenant_uuid UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_tenant', tenant_uuid::TEXT, true);
END;
$$ LANGUAGE plpgsql;

-- Policy para cada tabla operativa
CREATE POLICY tenant_isolation ON pedidos
  USING (tenant_id = current_setting('app.current_tenant')::UUID);

CREATE POLICY tenant_isolation ON mesas
  USING (tenant_id = current_setting('app.current_tenant')::UUID);

-- Repetir para TODAS las tablas operativas
```
