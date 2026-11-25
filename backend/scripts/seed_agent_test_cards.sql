-- =============================================================================
-- Seed idempotente de tarjetas de soporte para pruebas del Dominio Agente
-- (PostgreSQL real: tranki_dev)
-- Agrega:
--   - TRK-2002 (BLOCKED_DEBT, saldo -2.40, en blacklist_entries) -> probar desbloqueo por recarga
--   - TRK-2003 (FRAUD_BLOCKED, saldo 0.00) -> probar rechazo real de recarga
--   - TRK-INV-01 .. TRK-INV-05 (IN_INVENTORY) -> probar Emisión de Tarjeta desde Kiosco
-- =============================================================================

DO $$
DECLARE
    v_other_user_id UUID;
    v_acc_debt UUID := '22222222-2222-4222-8222-222222222002';
    v_acc_fraud UUID := '22222222-2222-4222-8222-222222222003';
BEGIN
    SELECT id INTO v_other_user_id FROM users WHERE dni = '70000002';
    IF v_other_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario secundario 70000002 no encontrado.';
    END IF;

    -- 1. Tarjeta BLOCKED_DEBT (-2.40) + entrada activa en blacklist_entries
    INSERT INTO accounts (account_id, balance, debt_margin_limit, status, user_id, fare_category)
    VALUES (v_acc_debt, -2.40, -3.00, 'BLOCKED_DEBT', v_other_user_id, 'GENERAL')
    ON CONFLICT (account_id) DO UPDATE SET
        balance = -2.40,
        status = 'BLOCKED_DEBT',
        user_id = v_other_user_id;

    INSERT INTO cards (card_id, account_id, card_status, verification_number, security_code_hash, kiosk_agent_id, failed_link_attempts, alias)
    VALUES ('TRK-2002', v_acc_debt, 'BLOCKED_DEBT', '900290029002', 'HASH_2222', NULL, 0, 'Deuda Prueba')
    ON CONFLICT (card_id) DO UPDATE SET
        account_id = v_acc_debt,
        card_status = 'BLOCKED_DEBT';

    INSERT INTO blacklist_entries (card_id, reason, version, active, timestamp)
    VALUES ('TRK-2002', 'DEBT', 1, TRUE, NOW())
    ON CONFLICT (card_id) DO UPDATE SET
        reason = 'DEBT',
        active = TRUE,
        timestamp = NOW();

    -- 2. Tarjeta FRAUD_BLOCKED (0.00)
    INSERT INTO accounts (account_id, balance, debt_margin_limit, status, user_id, fare_category)
    VALUES (v_acc_fraud, 0.00, -3.00, 'ACTIVE', v_other_user_id, 'GENERAL')
    ON CONFLICT (account_id) DO UPDATE SET
        balance = 0.00,
        user_id = v_other_user_id;

    INSERT INTO cards (card_id, account_id, card_status, verification_number, security_code_hash, kiosk_agent_id, failed_link_attempts, alias)
    VALUES ('TRK-2003', v_acc_fraud, 'FRAUD_BLOCKED', '900390039003', 'HASH_3333', NULL, 0, 'Fraude Prueba')
    ON CONFLICT (card_id) DO UPDATE SET
        account_id = v_acc_fraud,
        card_status = 'FRAUD_BLOCKED';

    INSERT INTO blacklist_entries (card_id, reason, version, active, timestamp)
    VALUES ('TRK-2003', 'FRAUD', 2, TRUE, NOW())
    ON CONFLICT (card_id) DO UPDATE SET
        reason = 'FRAUD',
        active = TRUE,
        timestamp = NOW();

    -- 3. Tarjetas en inventario (IN_INVENTORY) listas para emitir desde Kiosco
    INSERT INTO cards (card_id, account_id, card_status, verification_number, security_code_hash, kiosk_agent_id, failed_link_attempts, alias)
    VALUES
        ('TRK-INV-01', NULL, 'IN_INVENTORY', NULL, NULL, NULL, 0, NULL),
        ('TRK-INV-02', NULL, 'IN_INVENTORY', NULL, NULL, NULL, 0, NULL),
        ('TRK-INV-03', NULL, 'IN_INVENTORY', NULL, NULL, NULL, 0, NULL),
        ('TRK-INV-04', NULL, 'IN_INVENTORY', NULL, NULL, NULL, 0, NULL),
        ('TRK-INV-05', NULL, 'IN_INVENTORY', NULL, NULL, NULL, 0, NULL)
    ON CONFLICT (card_id) DO NOTHING;
END $$;
