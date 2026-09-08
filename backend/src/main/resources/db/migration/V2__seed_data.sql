-- V2: Initial Seed Data for Keystone Platform

-- 1. Customers
INSERT INTO customers (id, organization_name, contact_name, email, phone, address, is_active, created_at, updated_at)
VALUES
(1, 'Apex Commercial Towers', 'John Sterling', 'john@apex.com', '+1-555-0199', '100 Enterprise Way, Suite 400, Chicago, IL', true, NOW(), NOW()),
(2, 'Nexus Innovation Park', 'Elena Rostova', 'elena@nexuspark.com', '+1-555-0244', '45 Science Drive, Tech Hub, Austin, TX', true, NOW(), NOW()),
(3, 'Horizon Health Center', 'Dr. Marcus Vance', 'marcus@horizonhealth.org', '+1-555-0377', '789 Wellness Boulevard, Boston, MA', true, NOW(), NOW()),
(4, 'Metro Logistics Center', 'Carlos Mendez', 'carlos@metrologistics.com', '+1-555-0488', '12 Freight Corridor, Dallas, TX', true, NOW(), NOW());

ALTER TABLE customers ALTER COLUMN id RESTART WITH 100;

-- 2. Users (Password is 'password123' for all demo accounts)
-- BCrypt hash: $2a$10$zZeh7X1dQQ0LayebzpRKkugQ5UUUJI6EtZgVfmPZEJcLNysHRGfoK
INSERT INTO users (id, name, email, password_hash, role, active, customer_id, created_at, updated_at)
VALUES
(1, 'Admin Manager', 'admin@vertexa.com', '$2a$10$zZeh7X1dQQ0LayebzpRKkugQ5UUUJI6EtZgVfmPZEJcLNysHRGfoK', 'MANAGER', true, NULL, NOW(), NOW()),
(2, 'Sarah Jenkins', 'sarah@vertexa.com', '$2a$10$zZeh7X1dQQ0LayebzpRKkugQ5UUUJI6EtZgVfmPZEJcLNysHRGfoK', 'DISPATCHER', true, NULL, NOW(), NOW()),
(3, 'Mike Ramirez', 'mike@vertexa.com', '$2a$10$zZeh7X1dQQ0LayebzpRKkugQ5UUUJI6EtZgVfmPZEJcLNysHRGfoK', 'TECHNICIAN', true, NULL, NOW(), NOW()),
(4, 'Alex Rivera', 'alex@vertexa.com', '$2a$10$zZeh7X1dQQ0LayebzpRKkugQ5UUUJI6EtZgVfmPZEJcLNysHRGfoK', 'TECHNICIAN', true, NULL, NOW(), NOW()),
(5, 'John Sterling', 'john@apex.com', '$2a$10$zZeh7X1dQQ0LayebzpRKkugQ5UUUJI6EtZgVfmPZEJcLNysHRGfoK', 'CUSTOMER', true, 1, NOW(), NOW());

ALTER TABLE users ALTER COLUMN id RESTART WITH 100;

-- 3. Sites
INSERT INTO sites (id, name, address, customer_id, is_active, created_at, updated_at)
VALUES
(1, 'Apex Tower - Main Headquarters', '100 Enterprise Way, Floor 1-12, Chicago, IL', 1, true, NOW(), NOW()),
(2, 'Apex Data Center B', '104 Enterprise Way, Annex Building, Chicago, IL', 1, true, NOW(), NOW()),
(3, 'Nexus Lab Complex A', '45 Science Drive, Building A, Austin, TX', 2, true, NOW(), NOW()),
(4, 'Horizon Medical Wing', '789 Wellness Boulevard, West Wing, Boston, MA', 3, true, NOW(), NOW()),
(5, 'Metro Warehouse 3', '12 Freight Corridor, Dock 4-10, Dallas, TX', 4, true, NOW(), NOW());

ALTER TABLE sites ALTER COLUMN id RESTART WITH 100;

-- 4. Parts Inventory
INSERT INTO parts (id, part_code, name, description, unit_cost, available_stock, is_active, created_at, updated_at)
VALUES
(1, 'HVAC-FLT-01', 'HEPA Air Filter 24x24x2', 'High-efficiency particulate air filter for commercial HVAC units', 45.50, 48, true, NOW(), NOW()),
(2, 'ELEC-BRK-20A', 'Circuit Breaker 20A Single Pole', 'Thermal-magnetic branch circuit breaker', 18.75, 120, true, NOW(), NOW()),
(3, 'PLMB-VLV-75', 'Ball Valve 3/4 inch Brass', 'Full port brass ball valve with female pipe threads', 28.00, 35, true, NOW(), NOW()),
(4, 'HVAC-CMP-05', 'Scroll Compressor 5-Ton', 'R-410A Commercial replacement compressor', 850.00, 6, true, NOW(), NOW()),
(5, 'SENS-TMP-01', 'Digital Temperature Sensor', 'BACnet compatible immersion temperature sensor', 62.20, 24, true, NOW(), NOW()),
(6, 'PUMP-SEAL-02', 'Mechanical Water Pump Seal Kit', 'Heavy-duty silicon carbide shaft seal assembly', 115.00, 15, true, NOW(), NOW());

ALTER TABLE parts ALTER COLUMN id RESTART WITH 100;

-- 5. Work Orders
INSERT INTO work_orders (id, work_order_code, title, description, priority, status, customer_id, site_id, assigned_technician_id, created_by_id, sla_due_date, completed_at, closed_at, deleted, created_at, updated_at)
VALUES
(1, 'WO-2026-0001', 'HVAC Cooling Failure on 4th Floor', 'Cooling system is blowing warm air across the entire south office zone. Server rack temperatures rising.', 'CRITICAL', 'IN_PROGRESS', 1, 1, 3, 2, NOW() + INTERVAL '2' HOUR, NULL, NULL, false, NOW() - INTERVAL '1' HOUR, NOW()),
(2, 'WO-2026-0002', 'Main Entrance Automatic Door Sensor Replacement', 'Optical safety sensor intermittent; door stays open during high traffic periods.', 'MEDIUM', 'ASSIGNED', 1, 1, 4, 2, NOW() + INTERVAL '24' HOUR, NULL, NULL, false, NOW() - INTERVAL '4' HOUR, NOW()),
(3, 'WO-2026-0003', 'Emergency Backup Generator Periodic Inspection', 'Routine quarterly 50-hour load bank testing and fluid analysis.', 'LOW', 'NEW', 2, 3, NULL, 1, NOW() + INTERVAL '72' HOUR, NULL, NULL, false, NOW() - INTERVAL '6' HOUR, NOW()),
(4, 'WO-2026-0004', 'Water Line Pressure Drop in Laboratory Wing', 'Chilled water supply line pressure dropped below 30 PSI.', 'HIGH', 'COMPLETED', 3, 4, 3, 2, NOW() - INTERVAL '1' HOUR, NOW() - INTERVAL '30' MINUTE, NULL, false, NOW() - INTERVAL '5' HOUR, NOW()),
(5, 'WO-2026-0005', 'High-Bay Lighting Fixture Flickering in Dock 4', 'LED ballast failure on bay 4 fixtures.', 'LOW', 'CLOSED', 4, 5, 4, 1, NOW() - INTERVAL '1' DAY, NOW() - INTERVAL '1' DAY, NOW() - INTERVAL '18' HOUR, false, NOW() - INTERVAL '2' DAY, NOW());

ALTER TABLE work_orders ALTER COLUMN id RESTART WITH 100;

-- 6. Work Order Status History
INSERT INTO work_order_status_history (id, work_order_id, from_status, to_status, changed_by_id, changed_at, note, created_at, updated_at)
VALUES
(1, 1, 'NEW', 'ASSIGNED', 2, NOW() - INTERVAL '50' MINUTE, 'Assigned to Mike Ramirez for immediate emergency response', NOW() - INTERVAL '50' MINUTE, NOW() - INTERVAL '50' MINUTE),
(2, 1, 'ASSIGNED', 'IN_PROGRESS', 3, NOW() - INTERVAL '30' MINUTE, 'On site at 4th floor mechanical room diagnosing compressor circuit', NOW() - INTERVAL '30' MINUTE, NOW() - INTERVAL '30' MINUTE),
(3, 2, 'NEW', 'ASSIGNED', 2, NOW() - INTERVAL '3' HOUR, 'Assigned to Alex Rivera', NOW() - INTERVAL '3' HOUR, NOW() - INTERVAL '3' HOUR),
(4, 4, 'NEW', 'ASSIGNED', 2, NOW() - INTERVAL '4' HOUR, 'Dispatched to Mike Ramirez', NOW() - INTERVAL '4' HOUR, NOW() - INTERVAL '4' HOUR),
(5, 4, 'ASSIGNED', 'IN_PROGRESS', 3, NOW() - INTERVAL '3' HOUR, 'Inspecting pressure relief valve', NOW() - INTERVAL '3' HOUR, NOW() - INTERVAL '3' HOUR),
(6, 4, 'IN_PROGRESS', 'COMPLETED', 3, NOW() - INTERVAL '30' MINUTE, 'Replaced worn valve seal. Pressure restored to 55 PSI nominal.', NOW() - INTERVAL '30' MINUTE, NOW() - INTERVAL '30' MINUTE),
(7, 5, 'NEW', 'ASSIGNED', 1, NOW() - INTERVAL '2' DAY, 'Assigned to Alex', NOW() - INTERVAL '2' DAY, NOW() - INTERVAL '2' DAY),
(8, 5, 'ASSIGNED', 'IN_PROGRESS', 4, NOW() - INTERVAL '1' DAY, 'Work started', NOW() - INTERVAL '1' DAY, NOW() - INTERVAL '1' DAY),
(9, 5, 'IN_PROGRESS', 'COMPLETED', 4, NOW() - INTERVAL '1' DAY, 'Lighting fixture ballast replaced', NOW() - INTERVAL '1' DAY, NOW() - INTERVAL '1' DAY),
(10, 5, 'COMPLETED', 'CLOSED', 1, NOW() - INTERVAL '18' HOUR, 'Manager verified and closed work order', NOW() - INTERVAL '18' HOUR, NOW() - INTERVAL '18' HOUR);

ALTER TABLE work_order_status_history ALTER COLUMN id RESTART WITH 100;

-- 7. Part Usages
INSERT INTO part_usages (id, work_order_id, part_id, quantity, unit_cost, total_cost, logged_by_id, logged_at, created_at, updated_at)
VALUES
(1, 4, 6, 1, 115.00, 115.00, 3, NOW() - INTERVAL '1' HOUR, NOW(), NOW()),
(2, 5, 2, 2, 18.75, 37.50, 4, NOW() - INTERVAL '1' DAY, NOW(), NOW());

ALTER TABLE part_usages ALTER COLUMN id RESTART WITH 100;

-- 8. Time Logs
INSERT INTO time_logs (id, work_order_id, technician_id, minutes, note, logged_at, created_at, updated_at)
VALUES
(1, 1, 3, 45, 'Initial diagnostic inspection and pressure testing on 4th floor AC unit', NOW() - INTERVAL '15' MINUTE, NOW(), NOW()),
(2, 4, 3, 120, 'Removed faulty valve assembly, fitted new mechanical seal, pressure-tested system', NOW() - INTERVAL '40' MINUTE, NOW(), NOW()),
(3, 5, 4, 60, 'Replaced 20A breaker and tested fixture load across dock 4', NOW() - INTERVAL '1' DAY, NOW(), NOW());

ALTER TABLE time_logs ALTER COLUMN id RESTART WITH 100;

-- 9. Notifications
INSERT INTO notifications (id, user_id, type, title, message, reference_id, reference_type, is_read, read_at, created_at, updated_at)
VALUES
(1, 3, 'WORK_ORDER_ASSIGNED', 'New Critical Work Order Assigned', 'You have been assigned to WO-2026-0001: HVAC Cooling Failure on 4th Floor', 1, 'WORK_ORDER', false, NULL, NOW() - INTERVAL '50' MINUTE, NOW()),
(2, 4, 'WORK_ORDER_ASSIGNED', 'Work Order Assigned', 'You have been assigned to WO-2026-0002: Main Entrance Door Sensor', 2, 'WORK_ORDER', false, NULL, NOW() - INTERVAL '3' HOUR, NOW()),
(3, 1, 'WORK_ORDER_COMPLETED', 'Work Order Completed', 'WO-2026-0004 (Water Line Pressure Drop) has been completed by Mike Ramirez', 4, 'WORK_ORDER', false, NULL, NOW() - INTERVAL '30' MINUTE, NOW());

ALTER TABLE notifications ALTER COLUMN id RESTART WITH 100;

