package com.tranki.backend.account.domain;

import java.util.List;
import java.util.UUID;

public interface AccountMovementRepository {
    List<AccountMovement> findByAccountIdOrderByDateDesc(UUID accountId);
}
