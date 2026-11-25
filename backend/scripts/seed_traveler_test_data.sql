-- =============================================================================
-- Seed idempotente para Dominio Viajero en PostgreSQL (tranki_dev)
-- Crea:
--   - Usuario de prueba principal (DNI: 76543210) -> registrado vía API o SQL
--   - 2 tarjetas vinculadas (TRK-1001 Principal y TRK-1002 Secundaria) con cuentas y saldos reales
--   - 10 movimientos simulados (recargas, viajes urbanos, transferencia) en account_movements_view
--   - 1 tarjeta anónima lista para vincular desde la app (TRK-1099, verif: 777788889999, código: 4321)
--   - 1 tarjeta perteneciente a otro usuario (DNI: 70000002) para pruebas de rechazo de transferencia externa
-- =============================================================================

-- Garantizar columna alias en cards si Hibernate aún no reinició
ALTER TABLE cards ADD COLUMN IF NOT EXISTS alias VARCHAR(60);

DO $$
DECLARE
    v_test_user_id UUID;
    v_other_user_id UUID;
    v_acc_1 UUID := '11111111-1111-4111-8111-111111111001';
    v_acc_2 UUID := '11111111-1111-4111-8111-111111111002';
    v_acc_anon UUID := '11111111-1111-4111-8111-111111111099';
    v_acc_other UUID := '22222222-2222-4222-8222-222222222001';
BEGIN
    SELECT id INTO v_test_user_id FROM users WHERE dni = '76543210';
    IF v_test_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario de prueba DNI 76543210 no encontrado. Regístralo primero vía /api/v1/auth/register.';
    END IF;

    SELECT id INTO v_other_user_id FROM users WHERE dni = '70000002';
    IF v_other_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario secundario DNI 70000002 no encontrado. Regístralo primero vía /api/v1/auth/register.';
    END IF;

    -- 1. Cuentas del usuario de prueba (2 tarjetas vinculadas)
    INSERT INTO accounts (account_id, balance, debt_margin_limit, status, user_id, fare_category)
    VALUES
        (v_acc_1, 35.40, -3.00, 'ACTIVE', v_test_user_id, 'UNIVERSITY'),
        (v_acc_2, 18.50, -3.00, 'ACTIVE', v_test_user_id, 'GENERAL')
    ON CONFLICT (account_id) DO UPDATE SET
        balance = EXCLUDED.balance,
        status = EXCLUDED.status,
        user_id = EXCLUDED.user_id,
        fare_category = EXCLUDED.fare_category;

    -- 2. Tarjetas del usuario de prueba
    INSERT INTO cards (card_id, account_id, card_status, verification_number, security_code_hash, kiosk_agent_id, failed_link_attempts, alias)
    VALUES
        ('TRK-1001', v_acc_1, 'ACTIVE', '100120023003', 'HASH_1234', NULL, 0, 'Principal'),
        ('TRK-1002', v_acc_2, 'ACTIVE', '400450056006', 'HASH_5678', NULL, 0, 'Secundaria')
    ON CONFLICT (card_id) DO UPDATE SET
        account_id = EXCLUDED.account_id,
        card_status = EXCLUDED.card_status,
        alias = EXCLUDED.alias;

    -- 3. Tarjeta anónima sin vincular (para probar pantalla "Registrar Tarjeta")
    INSERT INTO accounts (account_id, balance, debt_margin_limit, status, user_id, fare_category)
    VALUES (v_acc_anon, 5.00, -3.00, 'ACTIVE', NULL, 'GENERAL')
    ON CONFLICT (account_id) DO UPDATE SET
        balance = EXCLUDED.balance,
        user_id = NULL,
        status = 'ACTIVE';

    INSERT INTO cards (card_id, account_id, card_status, verification_number, security_code_hash, kiosk_agent_id, failed_link_attempts, alias)
    VALUES ('TRK-1099', v_acc_anon, 'ACTIVE', '777788889999', 'HASH_4321', NULL, 0, NULL)
    ON CONFLICT (card_id) DO UPDATE SET
        account_id = EXCLUDED.account_id,
        card_status = 'ACTIVE',
        failed_link_attempts = 0,
        alias = NULL;

    -- 4. Cuenta y tarjeta de otro usuario (para probar rechazo de transferencia externa)
    INSERT INTO accounts (account_id, balance, debt_margin_limit, status, user_id, fare_category)
    VALUES (v_acc_other, 25.00, -3.00, 'ACTIVE', v_other_user_id, 'GENERAL')
    ON CONFLICT (account_id) DO UPDATE SET
        balance = EXCLUDED.balance,
        user_id = EXCLUDED.user_id,
        status = 'ACTIVE';

    INSERT INTO cards (card_id, account_id, card_status, verification_number, security_code_hash, kiosk_agent_id, failed_link_attempts, alias)
    VALUES ('TRK-2001', v_acc_other, 'ACTIVE', '900190029003', 'HASH_9999', NULL, 0, 'Externa')
    ON CONFLICT (card_id) DO UPDATE SET
        account_id = EXCLUDED.account_id,
        card_status = 'ACTIVE';

    -- 5. Movimientos simulados reales en account_movements_view (asociados a las 2 tarjetas del usuario de prueba)
    DELETE FROM account_movements_view WHERE account_id IN (v_acc_1, v_acc_2) AND identifier LIKE 'SEED-%';

    INSERT INTO account_movements_view (identifier, account_id, type, amount, movement_date, detail)
    VALUES
        ('SEED-REC-001', v_acc_1, 'RECARGA',                25.00, NOW() - INTERVAL '4 days 2 hours', 'Recarga Física - Estación San Jerónimo'),
        ('SEED-VIA-001', v_acc_1, 'VIAJE',                   0.60, NOW() - INTERVAL '3 days 5 hours', 'ET. León de San Jerónimo - Unidad #18'),
        ('SEED-VIA-002', v_acc_1, 'VIAJE',                   0.60, NOW() - INTERVAL '3 days 1 hour',  'ET. León de San Jerónimo - Unidad #22'),
        ('SEED-REC-002', v_acc_2, 'RECARGA',                20.00, NOW() - INTERVAL '2 days 6 hours', 'Recarga Digital - Tranqi Gateway'),
        ('SEED-VIA-003', v_acc_2, 'VIAJE',                   1.20, NOW() - INTERVAL '2 days 2 hours', 'ET. Satélite - Ruta Av. de la Cultura'),
        ('SEED-TRF-OUT', v_acc_1, 'TRANSFERENCIA_ENVIADA',   5.00, NOW() - INTERVAL '1 day 4 hours',  'Transferencia enviada hacia tarjeta TRK-1002'),
        ('SEED-TRF-IN',  v_acc_2, 'TRANSFERENCIA_RECIBIDA',  5.00, NOW() - INTERVAL '1 day 4 hours',  'Transferencia recibida desde tarjeta TRK-1001'),
        ('SEED-VIA-004', v_acc_1, 'VIAJE',                   0.60, NOW() - INTERVAL '14 hours',       'ET. Huancaro Express - Unidad #05'),
        ('SEED-VIA-005', v_acc_2, 'VIAJE',                   1.20, NOW() - INTERVAL '6 hours',        'ET. Satélite - Paradero Magisterio'),
        ('SEED-REC-003', v_acc_1, 'RECARGA',                15.00, NOW() - INTERVAL '2 hours',        'Recarga Digital - Acreditación Instantánea');
END $$;
