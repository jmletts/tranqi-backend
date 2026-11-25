package com.tranki.backend.account.application;

import com.tranki.backend.account.adapter.in.web.dto.TravelerMovementDTO;
import com.tranki.backend.account.adapter.in.web.dto.TravelerMovementsResponseDTO;
import com.tranki.backend.account.adapter.out.persistence.MovementJpaEntity;
import com.tranki.backend.account.adapter.out.persistence.MovementJpaRepository;
import com.tranki.backend.account.domain.Account;
import com.tranki.backend.account.domain.AccountRepository;
import com.tranki.backend.card.domain.Card;
import com.tranki.backend.card.domain.CardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class GetUserMovementsUseCase {

    private final AccountRepository accountRepository;
    private final CardRepository cardRepository;
    private final MovementJpaRepository movementJpaRepository;

    public GetUserMovementsUseCase(
            AccountRepository accountRepository,
            CardRepository cardRepository,
            MovementJpaRepository movementJpaRepository) {
        this.accountRepository = accountRepository;
        this.cardRepository = cardRepository;
        this.movementJpaRepository = movementJpaRepository;
    }

    @Transactional(readOnly = true)
    public TravelerMovementsResponseDTO execute(UUID userId, UUID filterAccountId) {
        List<Account> userAccounts = accountRepository.findByUserId(userId).stream()
                .sorted(Comparator.comparing(a -> a.getAccountId().toString()))
                .toList();

        if (userAccounts.isEmpty()) {
            return new TravelerMovementsResponseDTO(BigDecimal.ZERO, List.of());
        }

        Map<UUID, Account> accountById = new HashMap<>();
        Map<UUID, String> cardIdByAccount = new HashMap<>();
        Map<UUID, String> cardAliasByAccount = new HashMap<>();

        for (int i = 0; i < userAccounts.size(); i++) {
            Account account = userAccounts.get(i);
            accountById.put(account.getAccountId(), account);
            int idx = i;
            cardRepository.findByAccountId(account.getAccountId()).ifPresent(card -> {
                cardIdByAccount.put(account.getAccountId(), card.getCardId());
                String alias = (card.getAlias() != null && !card.getAlias().isBlank())
                        ? card.getAlias()
                        : (idx == 0 ? "Principal" : "Tarjeta " + (idx + 1));
                cardAliasByAccount.put(account.getAccountId(), alias);
            });
        }

        List<UUID> targetAccountIds;
        BigDecimal totalBalance;

        if (filterAccountId != null) {
            Account target = accountById.get(filterAccountId);
            if (target == null) {
                throw new SecurityException("No autorizado para consultar los movimientos de esta cuenta");
            }
            targetAccountIds = List.of(filterAccountId);
            totalBalance = target.getBalance().amount();
        } else {
            targetAccountIds = userAccounts.stream().map(Account::getAccountId).toList();
            totalBalance = userAccounts.stream()
                    .map(a -> a.getBalance().amount())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        List<MovementJpaEntity> entities = movementJpaRepository.findByAccountIdInOrderByMovementDateDesc(targetAccountIds);

        List<TravelerMovementDTO> dtos = entities.stream().map(m -> {
            Account acc = accountById.get(m.getAccountId());
            return new TravelerMovementDTO(
                    m.getIdentifier(),
                    m.getAccountId(),
                    cardIdByAccount.getOrDefault(m.getAccountId(), "N/A"),
                    cardAliasByAccount.getOrDefault(m.getAccountId(), "Tarjeta"),
                    acc != null && acc.getFareCategory() != null ? acc.getFareCategory().name() : "GENERAL",
                    m.getType(),
                    m.getAmount(),
                    m.getMovementDate(),
                    m.getDetail()
            );
        }).toList();

        return new TravelerMovementsResponseDTO(totalBalance, dtos);
    }
}
