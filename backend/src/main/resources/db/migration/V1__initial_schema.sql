-- Enable UUID extension
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customers table
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    organization_name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_customers_org_name UNIQUE (organization_name)
);

CREATE INDEX idx_customers_org_name ON customers (organization_name);
CREATE INDEX idx_customers_email ON customers (email);

-- Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    customer_id BIGINT,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT fk_users_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_customer_id ON users (customer_id);

-- Sites table
CREATE TABLE sites (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    customer_id BIGINT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_sites_customer_name UNIQUE (customer_id, name),
    CONSTRAINT fk_sites_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE INDEX idx_sites_customer_id ON sites (customer_id);
CREATE INDEX idx_sites_name ON sites (name);

-- Work Orders table
CREATE TABLE work_orders (
    id BIGSERIAL PRIMARY KEY,
    work_order_code VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'NEW',
    customer_id BIGINT NOT NULL,
    site_id BIGINT NOT NULL,
    assigned_technician_id BIGINT,
    created_by_id BIGINT NOT NULL,
    sla_due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_work_orders_code UNIQUE (work_order_code),
    CONSTRAINT fk_wo_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_wo_site FOREIGN KEY (site_id) REFERENCES sites(id),
    CONSTRAINT fk_wo_technician FOREIGN KEY (assigned_technician_id) REFERENCES users(id),
    CONSTRAINT fk_wo_created_by FOREIGN KEY (created_by_id) REFERENCES users(id)
);

CREATE INDEX idx_work_orders_code ON work_orders (work_order_code);
CREATE INDEX idx_work_orders_customer_id ON work_orders (customer_id);
CREATE INDEX idx_work_orders_site_id ON work_orders (site_id);
CREATE INDEX idx_work_orders_technician_id ON work_orders (assigned_technician_id);
CREATE INDEX idx_work_orders_status ON work_orders (status);
CREATE INDEX idx_work_orders_priority ON work_orders (priority);
CREATE INDEX idx_work_orders_sla_due ON work_orders (sla_due_date);
CREATE INDEX idx_work_orders_created_by ON work_orders (created_by_id);

-- Work Order Status History table
CREATE TABLE work_order_status_history (
    id BIGSERIAL PRIMARY KEY,
    work_order_id BIGINT NOT NULL,
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    changed_by_id BIGINT NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_wosh_work_order FOREIGN KEY (work_order_id) REFERENCES work_orders(id),
    CONSTRAINT fk_wosh_changed_by FOREIGN KEY (changed_by_id) REFERENCES users(id)
);

CREATE INDEX idx_wo_status_history_wo_id ON work_order_status_history (work_order_id);
CREATE INDEX idx_wo_status_history_changed_by ON work_order_status_history (changed_by_id);
CREATE INDEX idx_wo_status_history_changed_at ON work_order_status_history (changed_at);

-- Parts table
CREATE TABLE parts (
    id BIGSERIAL PRIMARY KEY,
    part_code VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    unit_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    available_stock INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_parts_code UNIQUE (part_code),
    CONSTRAINT chk_parts_stock CHECK (available_stock >= 0)
);

CREATE INDEX idx_parts_code ON parts (part_code);
CREATE INDEX idx_parts_name ON parts (name);

-- Part Usages table
CREATE TABLE part_usages (
    id BIGSERIAL PRIMARY KEY,
    work_order_id BIGINT NOT NULL,
    part_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL,
    logged_by_id BIGINT NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_pu_work_order FOREIGN KEY (work_order_id) REFERENCES work_orders(id),
    CONSTRAINT fk_pu_part FOREIGN KEY (part_id) REFERENCES parts(id),
    CONSTRAINT fk_pu_logged_by FOREIGN KEY (logged_by_id) REFERENCES users(id)
);

CREATE INDEX idx_part_usage_wo_id ON part_usages (work_order_id);
CREATE INDEX idx_part_usage_part_id ON part_usages (part_id);
CREATE INDEX idx_part_usage_logged_by ON part_usages (logged_by_id);

-- Time Logs table
CREATE TABLE time_logs (
    id BIGSERIAL PRIMARY KEY,
    work_order_id BIGINT NOT NULL,
    technician_id BIGINT NOT NULL,
    minutes INTEGER NOT NULL,
    note TEXT,
    logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_tl_work_order FOREIGN KEY (work_order_id) REFERENCES work_orders(id),
    CONSTRAINT fk_tl_technician FOREIGN KEY (technician_id) REFERENCES users(id)
);

CREATE INDEX idx_time_logs_wo_id ON time_logs (work_order_id);
CREATE INDEX idx_time_logs_technician_id ON time_logs (technician_id);
CREATE INDEX idx_time_logs_logged_at ON time_logs (logged_at);

-- Notifications table
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    reference_id BIGINT,
    reference_type VARCHAR(50),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_read ON notifications (is_read);
CREATE INDEX idx_notifications_created_at ON notifications (created_at);
