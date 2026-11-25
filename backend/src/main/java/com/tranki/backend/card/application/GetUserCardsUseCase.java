package com.tranki.backend.card.application;

import com.tranki.backend.account.domain.Account;
import com.tranki.backend.account.domain.AccountRepository;
import com.tranki.backend.card.adapter.in.web.dto.TravelerCardDTO;
import com.tranki.backend.card.domain.Card;
import com.tranki.backend.card.domain.CardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class GetUserCardsUseCase {

    private final AccountRepository accountRepository;
    private final CardRepository cardRepository;

    public GetUserCardsUseCase(AccountRepository accountRepository, CardRepository cardRepository) {
        this.accountRepository = accountRepository;
        this.cardRepository = cardRepository;
    }

    @Transactional(readOnly = true)
    public List<TravelerCardDTO> execute(UUID userId) {
        List<Account> accounts = accountRepository.findByUserId(userId);
        List<TravelerCardDTO> result = new ArrayList<>();

        List<Account> sorted = accounts.stream()
                .sorted(Comparator.comparing(a -> a.getAccountId().toString()))
                .toList();

        for (int i = 0; i < sorted.size(); i++) {
            Account account = sorted.get(i);
            Optional<Card> cardOpt = cardRepository.findByAccountId(account.getAccountId());
            if (cardOpt.isEmpty()) {
                continue;
            }
            Card card = cardOpt.get();
            String label = (card.getAlias() != null && !card.getAlias().isBlank())
                    ? card.getAlias()
                    : (i == 0 ? "Principal" : "Tarjeta " + (i + 1));

            result.add(new TravelerCardDTO(
                    card.getCardId(),
                    account.getAccountId(),
                    label,
                    card.getVerificationNumber(),
                    card.getCardStatus().name(),
                    account.getStatus() != null ? account.getStatus().name() : "ACTIVE",
                    account.getFareCategory() != null ? account.getFareCategory().name() : "GENERAL",
                    account.getBalance().amount(),
                    account.getDebtMarginLimit().amount(),
                    i == 0
            ));
        }

        return result;
    }
}
