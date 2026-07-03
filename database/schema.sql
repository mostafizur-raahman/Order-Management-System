-- ============ ENUMS ============
CREATE TYPE "order_status_enum" AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED');
CREATE TYPE "user_role_enum" AS ENUM ('user', 'admin');

-- ============ USERS TABLE ============
CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "email" VARCHAR NOT NULL,
    "password" VARCHAR NOT NULL,
    "role" user_role_enum NOT NULL DEFAULT 'user',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    
    CONSTRAINT "UQ_users_email" UNIQUE ("email")
);

CREATE INDEX "IDX_users_email" ON "users" ("email");

-- ============ PRODUCTS TABLE ============
CREATE TABLE "products" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "category" VARCHAR NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "stock_quantity" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    
    CONSTRAINT "FK_products_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL,
    CONSTRAINT "FK_products_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL
);

-- ============ ORDERS TABLE ============
CREATE TABLE "orders" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "order_id" VARCHAR(50) NOT NULL,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "transaction_id" VARCHAR,
    "user_id" UUID,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "status" order_status_enum NOT NULL DEFAULT 'PENDING',
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    
    CONSTRAINT "UQ_orders_order_id" UNIQUE ("order_id"),
    CONSTRAINT "FK_orders_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL,
    CONSTRAINT "FK_orders_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL,
    CONSTRAINT "FK_orders_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL
);

CREATE INDEX "IDX_orders_order_id" ON "orders" ("order_id");
CREATE INDEX "IDX_orders_user_id" ON "orders" ("user_id");

-- ============ ORDER ITEMS TABLE ============
CREATE TABLE "order_items" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "product_name" VARCHAR NOT NULL,
    "category" VARCHAR NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    
    CONSTRAINT "FK_order_items_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE
);

CREATE INDEX "IDX_order_items_order_id" ON "order_items" ("order_id");

-- ============ COMMENTS ============
COMMENT ON TABLE "users" IS 'User accounts for customers and admins';
COMMENT ON TABLE "products" IS 'Product catalog';
COMMENT ON TABLE "orders" IS 'Customer orders';
COMMENT ON TABLE "order_items" IS 'Individual items within each order';