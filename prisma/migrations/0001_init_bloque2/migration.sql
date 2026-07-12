-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "logo_url" TEXT,
    "plan" VARCHAR(50) NOT NULL DEFAULT 'basico',
    "config" JSONB NOT NULL DEFAULT '{}',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sucursales" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "direccion" TEXT,
    "telefono" VARCHAR(50),
    "email" VARCHAR(255),
    "horario" JSONB,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sucursales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "telefono" VARCHAR(50),
    "avatar_url" TEXT,
    "password_hash" TEXT NOT NULL,
    "email_verificado" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "permisos" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_roles" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "rol_id" UUID NOT NULL,
    "sucursal_id" UUID,

    CONSTRAINT "usuario_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesiones" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expira_en" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sesiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sectores" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "sucursal_id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "tipo" VARCHAR(50),
    "orden" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sectores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mesas" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "sucursal_id" UUID NOT NULL,
    "sector_id" UUID NOT NULL,
    "numero" VARCHAR(10) NOT NULL,
    "capacidad" INTEGER NOT NULL DEFAULT 4,
    "estado" VARCHAR(50) NOT NULL DEFAULT 'libre',
    "posicion_x" DOUBLE PRECISION,
    "posicion_y" DOUBLE PRECISION,
    "qr_code" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mesas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_menu" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "imagen_url" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorias_menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "categoria_id" UUID NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(10,2) NOT NULL,
    "costo" DECIMAL(10,2),
    "margen" DECIMAL(5,2),
    "imagen_url" TEXT,
    "video_url" TEXT,
    "tiempo_preparacion_min" INTEGER,
    "nivelPicante" INTEGER NOT NULL DEFAULT 0,
    "calorias" INTEGER,
    "proteinas" DECIMAL(5,2),
    "grasas" DECIMAL(5,2),
    "carbohidratos" DECIMAL(5,2),
    "alergenos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "tipo" VARCHAR(50) NOT NULL DEFAULT 'plato',
    "estacion" VARCHAR(50),
    "idiomas" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredientes" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "unidad_medida" VARCHAR(50) NOT NULL,
    "costo_unitario" DECIMAL(10,4),
    "proveedor_id" UUID,
    "stock_minimo" DECIMAL(10,2),
    "stock_maximo" DECIMAL(10,2),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingredientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recetas" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "producto_id" UUID NOT NULL,
    "nombre" VARCHAR(255),
    "porciones" INTEGER NOT NULL DEFAULT 1,
    "instrucciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recetas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receta_ingredientes" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "receta_id" UUID NOT NULL,
    "ingrediente_id" UUID NOT NULL,
    "cantidad" DECIMAL(10,3) NOT NULL,
    "unidad" VARCHAR(50) NOT NULL,
    "opcional" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receta_ingredientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "sucursal_id" UUID NOT NULL,
    "mesa_id" UUID,
    "cliente_id" UUID,
    "mozo_id" UUID,
    "creado_por_id" UUID,
    "estado" VARCHAR(50) NOT NULL DEFAULT 'recibido',
    "tipo" VARCHAR(50) NOT NULL DEFAULT 'mesa',
    "hora_programada" TIMESTAMP(3),
    "notas" TEXT,
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_items" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "pedido_id" UUID NOT NULL,
    "producto_id" UUID NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "notas" TEXT,
    "estado" VARCHAR(50) NOT NULL DEFAULT 'recibido',
    "hora_enviado" TIMESTAMP(3),
    "hora_listo" TIMESTAMP(3),
    "hora_entregado" TIMESTAMP(3),
    "anulado" BOOLEAN NOT NULL DEFAULT false,
    "motivo_anulacion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedido_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_eventos" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "pedido_id" UUID NOT NULL,
    "pedido_item_id" UUID,
    "evento" VARCHAR(100) NOT NULL,
    "usuario_id" UUID,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedido_eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "sucursal_id" UUID NOT NULL,
    "mesa_id" UUID,
    "cliente_id" UUID,
    "fecha" DATE NOT NULL,
    "hora" TIME NOT NULL,
    "cantidad_personas" INTEGER NOT NULL,
    "zona" VARCHAR(50),
    "occasion" VARCHAR(100),
    "notas" TEXT,
    "estado" VARCHAR(50) NOT NULL DEFAULT 'pendiente',
    "recordatorio_enviado" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cajas" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "sucursal_id" UUID NOT NULL,
    "cajero_id" UUID NOT NULL,
    "monto_inicial" DECIMAL(10,2) NOT NULL,
    "monto_final" DECIMAL(10,2),
    "diferencia" DECIMAL(10,2),
    "estado" VARCHAR(50) NOT NULL DEFAULT 'abierta',
    "abierta_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cerrada_en" TIMESTAMP(3),

    CONSTRAINT "cajas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "pedido_id" UUID NOT NULL,
    "caja_id" UUID,
    "monto" DECIMAL(10,2) NOT NULL,
    "propina" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "metodo_pago" VARCHAR(50) NOT NULL,
    "estado" VARCHAR(50) NOT NULL DEFAULT 'completado',
    "comprobante_url" TEXT,
    "usuario_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empleados" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "sucursal_id" UUID NOT NULL,
    "cargo" VARCHAR(100),
    "fecha_ingreso" TIMESTAMP(3),
    "salario_base" DECIMAL(10,2),
    "tipo_contrato" VARCHAR(50),
    "estado" VARCHAR(50) NOT NULL DEFAULT 'activo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empleados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turnos" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "empleado_id" UUID NOT NULL,
    "sucursal_id" UUID NOT NULL,
    "fecha" DATE NOT NULL,
    "hora_inicio" TIME NOT NULL,
    "hora_fin" TIME NOT NULL,
    "estado" VARCHAR(50) NOT NULL DEFAULT 'asignado',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "turnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asistencia" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "empleado_id" UUID NOT NULL,
    "turno_id" UUID,
    "sucursal_id" UUID,
    "tipo" VARCHAR(20),
    "entrada" TIMESTAMP(3),
    "salida" TIMESTAMP(3),
    "break_inicio" TIMESTAMP(3),
    "break_fin" TIMESTAMP(3),
    "horas_trabajadas" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asistencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "telefono" VARCHAR(50),
    "fecha_nacimiento" TIMESTAMP(3),
    "alergias" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dieta" VARCHAR(100),
    "preferencias" JSONB NOT NULL DEFAULT '{}',
    "puntos" INTEGER NOT NULL DEFAULT 0,
    "nivel" VARCHAR(50) NOT NULL DEFAULT 'bronce',
    "total_gastado" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_visitas" INTEGER NOT NULL DEFAULT 0,
    "ultima_visita" TIMESTAMP(3),
    "opt_in_marketing" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente_favoritos" (
    "id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "producto_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cliente_favoritos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "contacto_nombre" TEXT,
    "contacto_email" TEXT,
    "contacto_telefono" VARCHAR(50),
    "direccion" TEXT,
    "tiempo_entrega_dias" INTEGER,
    "calificacion" DECIMAL(3,2),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedor_producto" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "proveedor_id" UUID NOT NULL,
    "ingrediente_id" UUID NOT NULL,
    "precio" DECIMAL(10,4) NOT NULL,
    "unidad" VARCHAR(50) NOT NULL,
    "tiempo_entrega_dias" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proveedor_producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_por_sucursal" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "sucursal_id" UUID NOT NULL,
    "ingrediente_id" UUID NOT NULL,
    "cantidad_actual" DECIMAL(10,3) NOT NULL,
    "cantidad_reservada" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "lote" VARCHAR(100),
    "fecha_vencimiento" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_por_sucursal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movimientos" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "sucursal_id" UUID NOT NULL,
    "ingrediente_id" UUID NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "cantidad" DECIMAL(10,3) NOT NULL,
    "motivo" TEXT,
    "origen" VARCHAR(50),
    "pedido_id" UUID,
    "usuario_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movimientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes_compra" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "sucursal_id" UUID NOT NULL,
    "proveedor_id" UUID NOT NULL,
    "estado" VARCHAR(50) NOT NULL DEFAULT 'borrador',
    "total" DECIMAL(10,2),
    "notas" TEXT,
    "usuario_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ordenes_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes_compra_items" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "orden_compra_id" UUID NOT NULL,
    "ingrediente_id" UUID NOT NULL,
    "cantidad" DECIMAL(10,3) NOT NULL,
    "precio_unitario" DECIMAL(10,4) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ordenes_compra_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campanas" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "tipo" VARCHAR(50) NOT NULL,
    "estado" VARCHAR(50) NOT NULL DEFAULT 'borrador',
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3),
    "publico_objetivo" JSONB,
    "contenido" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campanas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cupones" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "descripcion" VARCHAR(200) NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "usos_maximos" INTEGER NOT NULL,
    "usos_actuales" INTEGER NOT NULL DEFAULT 0,
    "usos_por_cliente" INTEGER NOT NULL DEFAULT 1,
    "minimo_compra" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "productos_aplicables" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "categorias_aplicables" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cupones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "puntos_historial" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "puntos" INTEGER NOT NULL,
    "motivo" TEXT,
    "pedido_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "puntos_historial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "usuario_id" UUID,
    "tipo" VARCHAR(50) NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "usuario_id" UUID,
    "accion" VARCHAR(100) NOT NULL,
    "entidad" VARCHAR(100) NOT NULL,
    "entidad_id" UUID,
    "valor_anterior" JSONB,
    "valor_nuevo" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitas_mesa" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "cliente_id" UUID,
    "mesa_id" UUID NOT NULL,
    "sucursal_id" UUID NOT NULL,
    "personas" INTEGER,
    "monto" DECIMAL(10,2),
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visitas_mesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_plantillas" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "sucursal_id" UUID,
    "tipo" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checklist_plantillas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_items" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "plantilla_id" UUID NOT NULL,
    "descripcion" TEXT NOT NULL,
    "obligatorio" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_ejecuciones" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "plantilla_id" UUID NOT NULL,
    "sucursal_id" UUID NOT NULL,
    "turno_id" UUID,
    "usuario_id" UUID NOT NULL,
    "completo" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checklist_ejecuciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_ejecucion_items" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "ejecucion_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "valor" TEXT,
    "marcado" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checklist_ejecucion_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anulaciones" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "pedido_item_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "motivo" TEXT NOT NULL,
    "motivo_libre" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anulaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zonas_reparto" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "sucursal_id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "tiempo_estimado_min" INTEGER NOT NULL,
    "poligono" JSONB,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zonas_reparto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignaciones_reparto" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "pedido_id" UUID NOT NULL,
    "empleado_id" UUID NOT NULL,
    "zona_id" UUID,
    "estado" VARCHAR(50) NOT NULL DEFAULT 'asignado',
    "hora_salida" TIMESTAMP(3),
    "hora_entrega" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asignaciones_reparto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipos" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "sucursal_id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "tipo" VARCHAR(50),
    "ubicacion" TEXT,
    "frecuencia_mantenimiento_dias" INTEGER,
    "ultima_intervencion" TIMESTAMP(3),
    "proxima_intervencion" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_temperatura" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "equipo_id" UUID NOT NULL,
    "sucursal_id" UUID NOT NULL,
    "temperatura" DECIMAL(5,2) NOT NULL,
    "rango_min" DECIMAL(5,2),
    "rango_max" DECIMAL(5,2),
    "fuera_de_rango" BOOLEAN NOT NULL DEFAULT false,
    "usuario_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_temperatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipo_intervenciones" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "equipo_id" UUID NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "costo" DECIMAL(10,2),
    "proveedor" TEXT,
    "usuario_id" UUID,
    "realizado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipo_intervenciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedbacks" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "sucursal_id" UUID NOT NULL,
    "pedido_id" UUID,
    "mesa_id" UUID,
    "calificacion" VARCHAR(20) NOT NULL,
    "motivo" TEXT,
    "turno_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promociones" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "tipo" VARCHAR(50) NOT NULL,
    "condicion" JSONB NOT NULL DEFAULT '{}',
    "descuento" JSONB NOT NULL DEFAULT '{}',
    "dia_inicio" TIMESTAMP(3),
    "dia_fin" TIMESTAMP(3),
    "hora_inicio" TIME,
    "hora_fin" TIME,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promociones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modulos" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "clave" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT false,
    "limite" INTEGER,
    "activado_en" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modulos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "sucursales_tenant_id_idx" ON "sucursales"("tenant_id");

-- CreateIndex
CREATE INDEX "usuarios_tenant_id_idx" ON "usuarios"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_tenant_id_email_key" ON "usuarios"("tenant_id", "email");

-- CreateIndex
CREATE INDEX "roles_tenant_id_idx" ON "roles"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_tenant_id_nombre_key" ON "roles"("tenant_id", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_roles_usuario_id_rol_id_sucursal_id_key" ON "usuario_roles"("usuario_id", "rol_id", "sucursal_id");

-- CreateIndex
CREATE INDEX "sesiones_usuario_id_idx" ON "sesiones"("usuario_id");

-- CreateIndex
CREATE INDEX "sectores_tenant_id_sucursal_id_idx" ON "sectores"("tenant_id", "sucursal_id");

-- CreateIndex
CREATE UNIQUE INDEX "mesas_qr_code_key" ON "mesas"("qr_code");

-- CreateIndex
CREATE INDEX "mesas_tenant_id_sucursal_id_estado_idx" ON "mesas"("tenant_id", "sucursal_id", "estado");

-- CreateIndex
CREATE INDEX "categorias_menu_tenant_id_idx" ON "categorias_menu"("tenant_id");

-- CreateIndex
CREATE INDEX "productos_tenant_id_categoria_id_idx" ON "productos"("tenant_id", "categoria_id");

-- CreateIndex
CREATE INDEX "productos_tenant_id_disponible_idx" ON "productos"("tenant_id", "disponible");

-- CreateIndex
CREATE INDEX "ingredientes_tenant_id_idx" ON "ingredientes"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "recetas_tenant_id_producto_id_key" ON "recetas"("tenant_id", "producto_id");

-- CreateIndex
CREATE UNIQUE INDEX "receta_ingredientes_receta_id_ingrediente_id_key" ON "receta_ingredientes"("receta_id", "ingrediente_id");

-- CreateIndex
CREATE INDEX "pedidos_tenant_id_sucursal_id_estado_idx" ON "pedidos"("tenant_id", "sucursal_id", "estado");

-- CreateIndex
CREATE INDEX "pedidos_tenant_id_mesa_id_idx" ON "pedidos"("tenant_id", "mesa_id");

-- CreateIndex
CREATE INDEX "pedido_items_pedido_id_idx" ON "pedido_items"("pedido_id");

-- CreateIndex
CREATE INDEX "pedido_eventos_pedido_id_created_at_idx" ON "pedido_eventos"("pedido_id", "created_at");

-- CreateIndex
CREATE INDEX "reservas_tenant_id_sucursal_id_fecha_idx" ON "reservas"("tenant_id", "sucursal_id", "fecha");

-- CreateIndex
CREATE INDEX "cajas_tenant_id_sucursal_id_estado_idx" ON "cajas"("tenant_id", "sucursal_id", "estado");

-- CreateIndex
CREATE INDEX "pagos_tenant_id_pedido_id_idx" ON "pagos"("tenant_id", "pedido_id");

-- CreateIndex
CREATE INDEX "empleados_tenant_id_sucursal_id_idx" ON "empleados"("tenant_id", "sucursal_id");

-- CreateIndex
CREATE INDEX "turnos_tenant_id_empleado_id_fecha_idx" ON "turnos"("tenant_id", "empleado_id", "fecha");

-- CreateIndex
CREATE INDEX "asistencia_tenant_id_empleado_id_idx" ON "asistencia"("tenant_id", "empleado_id");

-- CreateIndex
CREATE INDEX "clientes_tenant_id_idx" ON "clientes"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_favoritos_cliente_id_producto_id_key" ON "cliente_favoritos"("cliente_id", "producto_id");

-- CreateIndex
CREATE INDEX "proveedores_tenant_id_idx" ON "proveedores"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "proveedor_producto_proveedor_id_ingrediente_id_key" ON "proveedor_producto"("proveedor_id", "ingrediente_id");

-- CreateIndex
CREATE UNIQUE INDEX "stock_por_sucursal_sucursal_id_ingrediente_id_lote_key" ON "stock_por_sucursal"("sucursal_id", "ingrediente_id", "lote");

-- CreateIndex
CREATE INDEX "stock_movimientos_tenant_id_sucursal_id_ingrediente_id_idx" ON "stock_movimientos"("tenant_id", "sucursal_id", "ingrediente_id");

-- CreateIndex
CREATE INDEX "ordenes_compra_tenant_id_sucursal_id_idx" ON "ordenes_compra"("tenant_id", "sucursal_id");

-- CreateIndex
CREATE INDEX "campanas_tenant_id_idx" ON "campanas"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "cupones_codigo_key" ON "cupones"("codigo");

-- CreateIndex
CREATE INDEX "cupones_tenant_id_activo_idx" ON "cupones"("tenant_id", "activo");

-- CreateIndex
CREATE INDEX "puntos_historial_tenant_id_cliente_id_idx" ON "puntos_historial"("tenant_id", "cliente_id");

-- CreateIndex
CREATE INDEX "notificaciones_tenant_id_usuario_id_leida_idx" ON "notificaciones"("tenant_id", "usuario_id", "leida");

-- CreateIndex
CREATE INDEX "notificaciones_tenant_id_created_at_idx" ON "notificaciones"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_log_tenant_id_entidad_entidad_id_idx" ON "audit_log"("tenant_id", "entidad", "entidad_id");

-- CreateIndex
CREATE INDEX "audit_log_tenant_id_created_at_idx" ON "audit_log"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "visitas_mesa_tenant_id_mesa_id_idx" ON "visitas_mesa"("tenant_id", "mesa_id");

-- CreateIndex
CREATE INDEX "visitas_mesa_tenant_id_cliente_id_idx" ON "visitas_mesa"("tenant_id", "cliente_id");

-- CreateIndex
CREATE INDEX "checklist_plantillas_tenant_id_tipo_idx" ON "checklist_plantillas"("tenant_id", "tipo");

-- CreateIndex
CREATE INDEX "checklist_items_plantilla_id_idx" ON "checklist_items"("plantilla_id");

-- CreateIndex
CREATE INDEX "checklist_ejecuciones_tenant_id_sucursal_id_idx" ON "checklist_ejecuciones"("tenant_id", "sucursal_id");

-- CreateIndex
CREATE UNIQUE INDEX "checklist_ejecucion_items_ejecucion_id_item_id_key" ON "checklist_ejecucion_items"("ejecucion_id", "item_id");

-- CreateIndex
CREATE INDEX "anulaciones_tenant_id_pedido_item_id_idx" ON "anulaciones"("tenant_id", "pedido_item_id");

-- CreateIndex
CREATE INDEX "zonas_reparto_tenant_id_sucursal_id_idx" ON "zonas_reparto"("tenant_id", "sucursal_id");

-- CreateIndex
CREATE INDEX "asignaciones_reparto_tenant_id_empleado_id_estado_idx" ON "asignaciones_reparto"("tenant_id", "empleado_id", "estado");

-- CreateIndex
CREATE INDEX "equipos_tenant_id_sucursal_id_idx" ON "equipos"("tenant_id", "sucursal_id");

-- CreateIndex
CREATE INDEX "registros_temperatura_tenant_id_equipo_id_created_at_idx" ON "registros_temperatura"("tenant_id", "equipo_id", "created_at");

-- CreateIndex
CREATE INDEX "equipo_intervenciones_tenant_id_equipo_id_idx" ON "equipo_intervenciones"("tenant_id", "equipo_id");

-- CreateIndex
CREATE INDEX "feedbacks_tenant_id_sucursal_id_calificacion_idx" ON "feedbacks"("tenant_id", "sucursal_id", "calificacion");

-- CreateIndex
CREATE INDEX "feedbacks_tenant_id_created_at_idx" ON "feedbacks"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "promociones_tenant_id_activa_idx" ON "promociones"("tenant_id", "activa");

-- CreateIndex
CREATE INDEX "modulos_tenant_id_idx" ON "modulos"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "modulos_tenant_id_clave_key" ON "modulos"("tenant_id", "clave");

-- AddForeignKey
ALTER TABLE "sucursales" ADD CONSTRAINT "sucursales_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_roles" ADD CONSTRAINT "usuario_roles_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_roles" ADD CONSTRAINT "usuario_roles_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sectores" ADD CONSTRAINT "sectores_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesas" ADD CONSTRAINT "mesas_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesas" ADD CONSTRAINT "mesas_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias_menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recetas" ADD CONSTRAINT "recetas_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receta_ingredientes" ADD CONSTRAINT "receta_ingredientes_receta_id_fkey" FOREIGN KEY ("receta_id") REFERENCES "recetas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receta_ingredientes" ADD CONSTRAINT "receta_ingredientes_ingrediente_id_fkey" FOREIGN KEY ("ingrediente_id") REFERENCES "ingredientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_mesa_id_fkey" FOREIGN KEY ("mesa_id") REFERENCES "mesas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_mozo_id_fkey" FOREIGN KEY ("mozo_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_items" ADD CONSTRAINT "pedido_items_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_items" ADD CONSTRAINT "pedido_items_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_eventos" ADD CONSTRAINT "pedido_eventos_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_eventos" ADD CONSTRAINT "pedido_eventos_pedido_item_id_fkey" FOREIGN KEY ("pedido_item_id") REFERENCES "pedido_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_mesa_id_fkey" FOREIGN KEY ("mesa_id") REFERENCES "mesas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_caja_id_fkey" FOREIGN KEY ("caja_id") REFERENCES "cajas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empleados" ADD CONSTRAINT "empleados_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "empleados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencia" ADD CONSTRAINT "asistencia_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "empleados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencia" ADD CONSTRAINT "asistencia_turno_id_fkey" FOREIGN KEY ("turno_id") REFERENCES "turnos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencia" ADD CONSTRAINT "asistencia_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_favoritos" ADD CONSTRAINT "cliente_favoritos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_favoritos" ADD CONSTRAINT "cliente_favoritos_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proveedores" ADD CONSTRAINT "proveedores_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proveedor_producto" ADD CONSTRAINT "proveedor_producto_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proveedor_producto" ADD CONSTRAINT "proveedor_producto_ingrediente_id_fkey" FOREIGN KEY ("ingrediente_id") REFERENCES "ingredientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_por_sucursal" ADD CONSTRAINT "stock_por_sucursal_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_por_sucursal" ADD CONSTRAINT "stock_por_sucursal_ingrediente_id_fkey" FOREIGN KEY ("ingrediente_id") REFERENCES "ingredientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movimientos" ADD CONSTRAINT "stock_movimientos_ingrediente_id_fkey" FOREIGN KEY ("ingrediente_id") REFERENCES "ingredientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra" ADD CONSTRAINT "ordenes_compra_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra" ADD CONSTRAINT "ordenes_compra_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra_items" ADD CONSTRAINT "ordenes_compra_items_orden_compra_id_fkey" FOREIGN KEY ("orden_compra_id") REFERENCES "ordenes_compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra_items" ADD CONSTRAINT "ordenes_compra_items_ingrediente_id_fkey" FOREIGN KEY ("ingrediente_id") REFERENCES "ingredientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puntos_historial" ADD CONSTRAINT "puntos_historial_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitas_mesa" ADD CONSTRAINT "visitas_mesa_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitas_mesa" ADD CONSTRAINT "visitas_mesa_mesa_id_fkey" FOREIGN KEY ("mesa_id") REFERENCES "mesas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitas_mesa" ADD CONSTRAINT "visitas_mesa_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_plantilla_id_fkey" FOREIGN KEY ("plantilla_id") REFERENCES "checklist_plantillas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_ejecuciones" ADD CONSTRAINT "checklist_ejecuciones_plantilla_id_fkey" FOREIGN KEY ("plantilla_id") REFERENCES "checklist_plantillas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_ejecucion_items" ADD CONSTRAINT "checklist_ejecucion_items_ejecucion_id_fkey" FOREIGN KEY ("ejecucion_id") REFERENCES "checklist_ejecuciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_ejecucion_items" ADD CONSTRAINT "checklist_ejecucion_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "checklist_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anulaciones" ADD CONSTRAINT "anulaciones_pedido_item_id_fkey" FOREIGN KEY ("pedido_item_id") REFERENCES "pedido_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_reparto" ADD CONSTRAINT "asignaciones_reparto_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_reparto" ADD CONSTRAINT "asignaciones_reparto_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "empleados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_reparto" ADD CONSTRAINT "asignaciones_reparto_zona_id_fkey" FOREIGN KEY ("zona_id") REFERENCES "zonas_reparto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipos" ADD CONSTRAINT "equipos_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_temperatura" ADD CONSTRAINT "registros_temperatura_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipo_intervenciones" ADD CONSTRAINT "equipo_intervenciones_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
