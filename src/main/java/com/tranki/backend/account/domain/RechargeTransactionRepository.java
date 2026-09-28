package com.tranki.backend.account.domain;

public interface RechargeTransactionRepository {
    boolean existsById(String transactionId);
    void save(RechargeTransaction transaction);
}
