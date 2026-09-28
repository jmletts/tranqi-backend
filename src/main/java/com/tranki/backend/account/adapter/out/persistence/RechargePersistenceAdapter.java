package com.tranki.backend.account.adapter.out.persistence;

import com.tranki.backend.account.domain.RechargeTransaction;
import com.tranki.backend.account.domain.RechargeTransactionRepository;
import org.springframework.stereotype.Component;

@Component
public class RechargePersistenceAdapter implements RechargeTransactionRepository {

    private final RechargeJpaRepository repository;

    public RechargePersistenceAdapter(RechargeJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public boolean existsById(String transactionId) {
        return repository.existsById(transactionId);
    }

    @Override
    public void save(RechargeTransaction transaction) {
        RechargeJpaEntity entity = new RechargeJpaEntity(
            transaction.getTransactionId(),
            transaction.getAccountId(),
            transaction.getAmount().amount(),
            transaction.getOrigin(),
            transaction.getCreatedAt()
        );
        repository.save(entity);
    }
}
