package com.tranki.backend.agent.application;

import com.tranki.backend.account.adapter.in.web.dto.RechargeRequestDTO;
import com.tranki.backend.account.adapter.out.persistence.AccountJpaEntity;
import com.tranki.backend.account.adapter.out.persistence.AccountJpaRepository;
import com.tranki.backend.account.application.RechargeAccountUseCase;
import com.tranki.backend.account.domain.Account;
import com.tranki.backend.account.domain.AccountRepository;
import com.tranki.backend.account.domain.FareCategory;
import com.tranki.backend.agent.adapter.in.web.dto.*;
import com.tranki.backend.agent.adapter.out.persistence.*;
import com.tranki.backend.card.adapter.out.persistence.CardJpaEntity;
import com.tranki.backend.card.adapter.out.persistence.CardJpaRepository;
import com.tranki.backend.card.domain.*;
import com.tranki.backend.iam.adapter.in.web.dto.UserProfileResponseDTO;
import com.tranki.backend.iam.adapter.out.persistence.UserJpaEntity;
import com.tranki.backend.iam.adapter.out.persistence.UserJpaRepository;
import com.tranki.backend.iam.domain.Email;
import com.tranki.backend.iam.domain.Role;
import com.tranki.backend.iam.domain.User;
import com.tranki.backend.iam.domain.UserRepository;
import com.tranki.backend.iam.infrastructure.security.JwtTokenProvider;
import com.tranki.backend.shared.domain.Money;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AgentService {

    private static final BigDecimal INITIAL_OPERATIONAL_BALANCE = new BigDecimal("500.00");
    private static final BigDecimal DEFAULT_COMMISSION_RATE = new BigDecimal("0.0250");
    private static final BigDecimal MAX_REPLENISH_AMOUNT = new BigDecimal("5000.00");

    private final AgentProfileJpaRepository agentProfileRepository;
    private final AgentTransactionJpaRepository agentTransactionRepository;
    private final AgentCashClosureJpaRepository agentCashClosureRepository;
    private final UserRepository userRepository;
    private final UserJpaRepository userJpaRepository;
    private final CardJpaRepository cardJpaRepository;
    private final CardRepository cardRepository;
    private final AccountJpaRepository accountJpaRepository;
    private final AccountRepository accountRepository;
    private final RechargeAccountUseCase rechargeAccountUseCase;
    private final DocumentValidatorPort documentValidatorPort;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final SecureRandom secureRandom = new SecureRandom();

    public AgentService(
            AgentProfileJpaRepository agentProfileRepository,
            AgentTransactionJpaRepository agentTransactionRepository,
            AgentCashClosureJpaRepository agentCashClosureRepository,
            UserRepository userRepository,
            UserJpaRepository userJpaRepository,
            CardJpaRepository cardJpaRepository,
            CardRepository cardRepository,
            AccountJpaRepository accountJpaRepository,
            AccountRepository accountRepository,
            RechargeAccountUseCase rechargeAccountUseCase,
            DocumentValidatorPort documentValidatorPort,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider) {
        this.agentProfileRepository = agentProfileRepository;
        this.agentTransactionRepository = agentTransactionRepository;
        this.agentCashClosureRepository = agentCashClosureRepository;
        this.userRepository = userRepository;
        this.userJpaRepository = userJpaRepository;
        this.cardJpaRepository = cardJpaRepository;
        this.cardRepository = cardRepository;
        this.accountJpaRepository = accountJpaRepository;
        this.accountRepository = accountRepository;
        this.rechargeAccountUseCase = rechargeAccountUseCase;
        this.documentValidatorPort = documentValidatorPort;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public AgentRegisterResponseDTO registerAgent(User currentUser, AgentRegisterRequestDTO request) {
        if (!request.acceptedTerms()) {
            throw new IllegalArgumentException("Debes confirmar tus datos y aceptar los términos para activar el rol de Agente.");
        }
        if (request.businessName() == null || request.businessName().trim().length() < 3) {
            throw new IllegalArgumentException("El nombre del kiosco o comercio debe tener al menos 3 caracteres.");
        }
        if (request.businessAddress() == null || request.businessAddress().trim().length() < 5) {
            throw new IllegalArgumentException("La dirección del punto de atención debe tener al menos 5 caracteres.");
        }

        Email nextEmail = (request.email() != null && !request.email().isBlank())
                ? new Email(request.email().trim())
                : null;
        currentUser.updateProfile(request.name(), request.phone(), nextEmail, null);
        currentUser.addRole(Role.AGENTE_KIOSKO);
        userRepository.save(currentUser);

        AgentProfileJpaEntity profile = agentProfileRepository.findById(currentUser.getId())
                .map(existing -> {
                    existing.setBusinessName(request.businessName().trim());
                    existing.setBusinessAddress(request.businessAddress().trim());
                    return agentProfileRepository.save(existing);
                })
                .orElseGet(() -> {
                    String agentCode = generateUniqueAgentCode(currentUser.getDni().getValue());
                    AgentProfileJpaEntity created = new AgentProfileJpaEntity(
                            currentUser.getId(),
                            agentCode,
                            request.businessName().trim(),
                            request.businessAddress().trim(),
                            INITIAL_OPERATIONAL_BALANCE,
                            DEFAULT_COMMISSION_RATE,
                            "ACTIVE",
                            LocalDateTime.now()
                    );
                    return agentProfileRepository.save(created);
                });

        var authorities = currentUser.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .toList();
        var auth = new UsernamePasswordAuthenticationToken(currentUser.getDni().getValue(), null, authorities);
        String newToken = jwtTokenProvider.generateToken(auth, currentUser.getId());

        return new AgentRegisterResponseDTO(
                newToken,
                toUserProfileDto(currentUser),
                toAgentProfileDto(profile)
        );
    }

    @Transactional(readOnly = true)
    public AgentDashboardResponseDTO getDashboard(User agentUser) {
        AgentProfileJpaEntity profile = requireAgentProfile(agentUser);
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();

        List<AgentTransactionJpaEntity> todayTxs = agentTransactionRepository
                .findByAgentUserIdAndCreatedAtGreaterThanEqualOrderByCreatedAtDesc(agentUser.getId(), startOfDay);

        BigDecimal todayRecharged = todayTxs.stream()
                .filter(tx -> "RECHARGE".equals(tx.getType()) && "COMPLETADO".equals(tx.getStatus()))
                .map(AgentTransactionJpaEntity::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int todayCount = (int) todayTxs.stream()
                .filter(tx -> "RECHARGE".equals(tx.getType()) && "COMPLETADO".equals(tx.getStatus()))
                .count();

        BigDecimal estimatedCommission = todayRecharged
                .multiply(profile.getCommissionRate())
                .setScale(2, RoundingMode.HALF_UP);

        List<AgentTransactionDTO> recent = agentTransactionRepository
                .findByAgentUserIdOrderByCreatedAtDesc(agentUser.getId())
                .stream()
                .limit(20)
                .map(this::toTxDto)
                .toList();

        return new AgentDashboardResponseDTO(
                toAgentProfileDto(profile),
                profile.getOperationalBalance(),
                profile.getCommissionRate(),
                todayRecharged,
                todayCount,
                estimatedCommission,
                recent
        );
    }

    @Transactional
    public AgentRegisterResponseDTO updateProfile(User agentUser, UpdateAgentProfileRequestDTO request) {
        AgentProfileJpaEntity profile = requireAgentProfile(agentUser);

        Email nextEmail = (request.email() != null && !request.email().isBlank())
                ? new Email(request.email().trim())
                : null;
        agentUser.updateProfile(request.name(), request.phone(), nextEmail, null);
        userRepository.save(agentUser);

        if (request.businessName() != null && !request.businessName().isBlank()) {
            profile.setBusinessName(request.businessName().trim());
        }
        if (request.businessAddress() != null && !request.businessAddress().isBlank()) {
            profile.setBusinessAddress(request.businessAddress().trim());
        }
        agentProfileRepository.save(profile);

        return new AgentRegisterResponseDTO(
                null,
                toUserProfileDto(agentUser),
                toAgentProfileDto(profile)
        );
    }

    @Transactional
    public ReplenishQuotaResponseDTO replenishQuota(User agentUser, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto de reposición debe ser mayor a S/ 0.00.");
        }
        if (amount.compareTo(MAX_REPLENISH_AMOUNT) > 0) {
            throw new IllegalArgumentException("El monto máximo por reposición es de S/ 5000.00.");
        }

        AgentProfileJpaEntity profile = requireAgentProfile(agentUser);
        BigDecimal previousQuota = profile.getOperationalBalance();
        BigDecimal nextQuota = previousQuota.add(amount).setScale(2, RoundingMode.HALF_UP);
        profile.setOperationalBalance(nextQuota);
        agentProfileRepository.save(profile);

        AgentTransactionJpaEntity tx = new AgentTransactionJpaEntity(
                UUID.randomUUID(),
                generateReferenceCode("REP"),
                agentUser.getId(),
                "REPLENISHMENT",
                "CUPO-AG",
                "Reposición de Cupo Operativo",
                "AGENTE",
                amount.setScale(2, RoundingMode.HALF_UP),
                previousQuota,
                nextQuota,
                "Transferencia Central",
                "COMPLETADO",
                false,
                "Abono de cupo operativo acreditado en PostgreSQL para operaciones del punto.",
                LocalDateTime.now()
        );
        agentTransactionRepository.save(tx);

        return new ReplenishQuotaResponseDTO(nextQuota, toTxDto(tx));
    }

    @Transactional(readOnly = true)
    public List<AgentCardLookupDTO> lookupCards(String rawQuery) {
        if (rawQuery == null || rawQuery.isBlank()) {
            return List.of();
        }
        String query = rawQuery.replaceAll("\\s+", "").trim();
        Map<String, AgentCardLookupDTO> results = new LinkedHashMap<>();

        cardJpaRepository.findByCardIdIgnoreCase(query)
                .map(this::toCardLookupDto)
                .ifPresent(dto -> results.put(dto.cardId(), dto));

        cardJpaRepository.findByVerificationNumber(query)
                .map(this::toCardLookupDto)
                .ifPresent(dto -> results.put(dto.cardId(), dto));

        userJpaRepository.findByDni(query).ifPresent(user -> {
            List<AccountJpaEntity> accounts = accountJpaRepository.findByUserId(user.getId());
            for (AccountJpaEntity acc : accounts) {
                cardJpaRepository.findByAccountId(acc.getAccountId())
                        .map(card -> toCardLookupDto(card, acc, user))
                        .ifPresent(dto -> results.put(dto.cardId(), dto));
            }
        });

        return new ArrayList<>(results.values());
    }

    @Transactional(noRollbackFor = {CardBlockedException.class})
    public AgentRechargeResponseDTO processRecharge(User agentUser, AgentRechargeRequestDTO request) {
        AgentProfileJpaEntity profile = requireAgentProfile(agentUser);

        if (request.cardId() == null || request.cardId().isBlank()) {
            throw new IllegalArgumentException("Debes indicar una tarjeta de pasajero.");
        }
        if (request.amount() == null || request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto a recargar debe ser mayor a S/ 0.00.");
        }
        if (request.amount().compareTo(new BigDecimal("100.00")) > 0) {
            throw new IllegalArgumentException("El monto excede el límite máximo permitido de S/ 100.00 por operación.");
        }

        String paymentMethod = (request.paymentMethod() != null && !request.paymentMethod().isBlank())
                ? request.paymentMethod().trim()
                : "Efectivo";

        CardJpaEntity cardEntity = cardJpaRepository.findByCardIdIgnoreCase(request.cardId().trim())
                .orElseThrow(() -> new IllegalArgumentException("No se encontró ninguna tarjeta con código " + request.cardId()));

        AgentCardLookupDTO beforeLookup = toCardLookupDto(cardEntity);
        String refCode = generateReferenceCode("TRX");

        if (cardEntity.getCardStatus() == CardStatus.FRAUD_BLOCKED
                || cardEntity.getCardStatus() == CardStatus.LOST_REPORTED
                || cardEntity.getCardStatus() == CardStatus.IN_INVENTORY) {
            AgentTransactionJpaEntity rejected = new AgentTransactionJpaEntity(
                    UUID.randomUUID(),
                    refCode,
                    agentUser.getId(),
                    "REJECTED",
                    cardEntity.getCardId(),
                    beforeLookup.holderName(),
                    beforeLookup.fareCategory(),
                    request.amount().setScale(2, RoundingMode.HALF_UP),
                    beforeLookup.balance(),
                    beforeLookup.balance(),
                    paymentMethod,
                    "RECHAZADO",
                    false,
                    "Recarga rechazada: tarjeta en estado " + cardEntity.getCardStatus().name() + ".",
                    LocalDateTime.now()
            );
            agentTransactionRepository.save(rejected);
            throw new CardBlockedException(
                    "Tarjeta bloqueada (" + cardEntity.getCardStatus().name() + "). No es posible acreditar saldo.");
        }

        if (profile.getOperationalBalance().compareTo(request.amount()) < 0) {
            throw new IllegalArgumentException(
                    "Cupo operativo insuficiente. Tu saldo disponible es S/ " + profile.getOperationalBalance().toPlainString() + ".");
        }

        boolean wasDebtBlocked = cardEntity.getCardStatus() == CardStatus.BLOCKED_DEBT;
        BigDecimal previousBalance = beforeLookup.balance();

        // Ejecuta el caso de uso oficial US-06 (acredita saldo, desbloquea deuda + lista negra y registra movimiento del viajero)
        rechargeAccountUseCase.execute(new RechargeRequestDTO(
                refCode,
                cardEntity.getCardId(),
                request.amount().setScale(2, RoundingMode.HALF_UP),
                "KIOSK"
        ));

        // Descuenta cupo operativo del agente
        BigDecimal nextAgentBalance = profile.getOperationalBalance()
                .subtract(request.amount())
                .setScale(2, RoundingMode.HALF_UP);
        profile.setOperationalBalance(nextAgentBalance);
        agentProfileRepository.save(profile);

        // Recarga estado actualizado de la tarjeta
        CardJpaEntity updatedCardEntity = cardJpaRepository.findById(cardEntity.getCardId()).orElseThrow();
        AgentCardLookupDTO afterLookup = toCardLookupDto(updatedCardEntity);
        boolean unlockedDebt = wasDebtBlocked && updatedCardEntity.getCardStatus() == CardStatus.ACTIVE;

        String notes = unlockedDebt
                ? "Recarga acreditada en kiosco. Deuda saldada: tarjeta reactivada y retirada de lista negra."
                : "Recarga presencial acreditada de forma inmediata en " + profile.getBusinessName() + ".";

        AgentTransactionJpaEntity completed = new AgentTransactionJpaEntity(
                UUID.randomUUID(),
                refCode,
                agentUser.getId(),
                "RECHARGE",
                afterLookup.cardId(),
                afterLookup.holderName(),
                afterLookup.fareCategory(),
                request.amount().setScale(2, RoundingMode.HALF_UP),
                previousBalance,
                afterLookup.balance(),
                paymentMethod,
                "COMPLETADO",
                unlockedDebt,
                notes,
                LocalDateTime.now()
        );
        agentTransactionRepository.save(completed);

        return new AgentRechargeResponseDTO(
                toTxDto(completed),
                afterLookup,
                nextAgentBalance
        );
    }

    @Transactional(readOnly = true)
    public List<AgentTransactionDTO> getTransactions(User agentUser, String typeFilter) {
        requireAgentProfile(agentUser);
        List<AgentTransactionJpaEntity> entities;
        if (typeFilter != null && !typeFilter.isBlank() && !"ALL".equalsIgnoreCase(typeFilter)) {
            entities = agentTransactionRepository.findByAgentUserIdAndTypeOrderByCreatedAtDesc(
                    agentUser.getId(), typeFilter.trim().toUpperCase());
        } else {
            entities = agentTransactionRepository.findByAgentUserIdOrderByCreatedAtDesc(agentUser.getId());
        }
        return entities.stream().map(this::toTxDto).toList();
    }

    @Transactional(readOnly = true)
    public List<String> listInventoryCards(User agentUser) {
        requireAgentProfile(agentUser);
        return cardJpaRepository.findByCardStatusOrderByCardIdAsc(CardStatus.IN_INVENTORY)
                .stream()
                .map(CardJpaEntity::getCardId)
                .toList();
    }

    @Transactional
    public AgentIssueCardResponseDTO issueCardAsAgent(User agentUser, AgentIssueCardRequestDTO request) {
        AgentProfileJpaEntity profile = requireAgentProfile(agentUser);

        if (request.cardId() == null || request.cardId().isBlank()) {
            throw new IllegalArgumentException("Debes seleccionar o ingresar el código de la tarjeta a emitir.");
        }
        String normalizedCardId = request.cardId().trim().toUpperCase();

        Card card = cardRepository.findById(normalizedCardId)
                .orElseThrow(() -> new IllegalArgumentException("Tarjeta no encontrada en inventario: " + normalizedCardId));

        if (card.getCardStatus() != CardStatus.IN_INVENTORY) {
            throw new IllegalArgumentException("La tarjeta " + normalizedCardId + " no está disponible en inventario (estado: " + card.getCardStatus().name() + ").");
        }

        FareCategory category;
        try {
            category = FareCategory.valueOf(request.fareCategory().trim().toUpperCase());
        } catch (Exception e) {
            throw new IllegalArgumentException("Categoría tarifaria inválida: " + request.fareCategory());
        }

        if (category == FareCategory.SCHOOL || category == FareCategory.UNIVERSITY) {
            boolean isValid = documentValidatorPort.isValidForCategory(request.documentNumber(), category);
            if (!isValid) {
                throw new InvalidDocumentException("Documento inválido para la categoría " + category.name() + ".");
            }
        }

        Money initialBalance = category == FareCategory.SCHOOL ? Money.of("2.50") : Money.of("5.00");
        UUID accountId = UUID.randomUUID();
        Account newAccount = Account.createAnonymous(accountId, category, initialBalance);

        String verificationNumber = generateUniqueVerificationNumber();
        String plainSecurityCode = String.format("%04d", secureRandom.nextInt(10000));
        String encodedSecurityCode = passwordEncoder.encode(plainSecurityCode);

        card.issue(newAccount.getAccountId(), agentUser.getId(), verificationNumber, encodedSecurityCode);
        accountRepository.save(newAccount);
        cardRepository.save(card);

        String paymentMethod = (request.paymentMethod() != null && !request.paymentMethod().isBlank())
                ? request.paymentMethod().trim()
                : "Efectivo";

        AgentTransactionJpaEntity tx = new AgentTransactionJpaEntity(
                UUID.randomUUID(),
                generateReferenceCode("EMI"),
                agentUser.getId(),
                "CARD_ISSUE",
                card.getCardId(),
                "Emisión de Tarjeta (" + category.name() + ")",
                category.name(),
                initialBalance.amount().setScale(2, RoundingMode.HALF_UP),
                BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                initialBalance.amount().setScale(2, RoundingMode.HALF_UP),
                paymentMethod,
                "COMPLETADO",
                false,
                "Tarjeta emitida en " + profile.getBusinessName() + " con N° verificación " + verificationNumber + ".",
                LocalDateTime.now()
        );
        agentTransactionRepository.save(tx);

        return new AgentIssueCardResponseDTO(
                card.getCardId(),
                newAccount.getAccountId(),
                verificationNumber,
                plainSecurityCode,
                category.name(),
                initialBalance.amount(),
                card.getCardStatus().name(),
                toTxDto(tx)
        );
    }

    @Transactional(readOnly = true)
    public AgentCashCloseResponseDTO getCashCloseSummary(User agentUser) {
        AgentProfileJpaEntity profile = requireAgentProfile(agentUser);
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();

        List<AgentTransactionJpaEntity> todayTxs = agentTransactionRepository
                .findByAgentUserIdAndCreatedAtGreaterThanEqualOrderByCreatedAtDesc(agentUser.getId(), startOfDay);

        BigDecimal totalRecharged = BigDecimal.ZERO;
        BigDecimal cashTotal = BigDecimal.ZERO;
        BigDecimal digitalTotal = BigDecimal.ZERO;
        BigDecimal cardIssuesTotal = BigDecimal.ZERO;
        BigDecimal replenishmentsTotal = BigDecimal.ZERO;
        int cashCount = 0;
        int digitalCount = 0;
        int cardIssuesCount = 0;
        int replenishmentsCount = 0;
        int rechargesCount = 0;
        int rejectedCount = 0;

        for (AgentTransactionJpaEntity tx : todayTxs) {
            if ("REJECTED".equals(tx.getType())) {
                rejectedCount++;
                continue;
            }
            if ("REPLENISHMENT".equals(tx.getType())) {
                replenishmentsTotal = replenishmentsTotal.add(tx.getAmount());
                replenishmentsCount++;
                continue;
            }
            boolean isCustomerCharge = "RECHARGE".equals(tx.getType()) || "CARD_ISSUE".equals(tx.getType());
            if (!isCustomerCharge || !"COMPLETADO".equals(tx.getStatus())) {
                continue;
            }

            if ("RECHARGE".equals(tx.getType())) {
                totalRecharged = totalRecharged.add(tx.getAmount());
                rechargesCount++;
            } else if ("CARD_ISSUE".equals(tx.getType())) {
                cardIssuesTotal = cardIssuesTotal.add(tx.getAmount());
                cardIssuesCount++;
            }

            String pm = (tx.getPaymentMethod() != null ? tx.getPaymentMethod() : "").toLowerCase(Locale.ROOT);
            if (pm.contains("efectivo")) {
                cashTotal = cashTotal.add(tx.getAmount());
                cashCount++;
            } else {
                digitalTotal = digitalTotal.add(tx.getAmount());
                digitalCount++;
            }
        }

        BigDecimal totalCollected = totalRecharged.add(cardIssuesTotal).setScale(2, RoundingMode.HALF_UP);
        BigDecimal estimatedCommission = totalRecharged
                .multiply(profile.getCommissionRate())
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal netToSettle = totalCollected.subtract(estimatedCommission).setScale(2, RoundingMode.HALF_UP);

        List<AgentCashCloseResponseDTO.CashClosureRecordDTO> closures = agentCashClosureRepository
                .findTop10ByAgentUserIdOrderByClosedAtDesc(agentUser.getId())
                .stream()
                .map(c -> new AgentCashCloseResponseDTO.CashClosureRecordDTO(
                        c.getId(),
                        c.getClosedAt(),
                        c.getTotalRecharged(),
                        c.getCashTotal(),
                        c.getDigitalTotal(),
                        c.getCardIssuesTotal(),
                        c.getTransactionsCount(),
                        c.getEstimatedCommission(),
                        c.getOperationalBalanceSnapshot(),
                        c.getNotes()
                ))
                .toList();

        return new AgentCashCloseResponseDTO(
                profile.getAgentCode(),
                profile.getBusinessName(),
                LocalDateTime.now(),
                profile.getOperationalBalance(),
                profile.getCommissionRate(),
                totalCollected,
                totalRecharged.setScale(2, RoundingMode.HALF_UP),
                cashTotal.setScale(2, RoundingMode.HALF_UP),
                cashCount,
                digitalTotal.setScale(2, RoundingMode.HALF_UP),
                digitalCount,
                cardIssuesTotal.setScale(2, RoundingMode.HALF_UP),
                cardIssuesCount,
                replenishmentsTotal.setScale(2, RoundingMode.HALF_UP),
                replenishmentsCount,
                rechargesCount,
                rejectedCount,
                estimatedCommission,
                netToSettle,
                todayTxs.stream().map(this::toTxDto).toList(),
                closures
        );
    }

    @Transactional
    public AgentCashCloseResponseDTO.CashClosureRecordDTO confirmCashClose(User agentUser, String notes) {
        AgentCashCloseResponseDTO summary = getCashCloseSummary(agentUser);
        AgentCashClosureJpaEntity closure = new AgentCashClosureJpaEntity(
                UUID.randomUUID(),
                agentUser.getId(),
                LocalDateTime.now(),
                summary.totalRecharged(),
                summary.cashTotal(),
                summary.digitalTotal(),
                summary.cardIssuesTotal(),
                summary.rechargesCount() + summary.cardIssuesCount(),
                summary.estimatedCommission(),
                summary.operationalBalance(),
                (notes != null && !notes.isBlank()) ? notes.trim() : "Cierre de caja registrado desde app Agente."
        );
        agentCashClosureRepository.save(closure);

        return new AgentCashCloseResponseDTO.CashClosureRecordDTO(
                closure.getId(),
                closure.getClosedAt(),
                closure.getTotalRecharged(),
                closure.getCashTotal(),
                closure.getDigitalTotal(),
                closure.getCardIssuesTotal(),
                closure.getTransactionsCount(),
                closure.getEstimatedCommission(),
                closure.getOperationalBalanceSnapshot(),
                closure.getNotes()
        );
    }

    private AgentProfileJpaEntity requireAgentProfile(User agentUser) {
        return agentProfileRepository.findById(agentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Perfil de agente no encontrado. Regístrate primero como agente."));
    }

    private AgentCardLookupDTO toCardLookupDto(CardJpaEntity card) {
        AccountJpaEntity account = card.getAccountId() != null
                ? accountJpaRepository.findById(card.getAccountId()).orElse(null)
                : null;
        UserJpaEntity owner = (account != null && account.getUserId() != null)
                ? userJpaRepository.findById(account.getUserId()).orElse(null)
                : null;
        return toCardLookupDto(card, account, owner);
    }

    private AgentCardLookupDTO toCardLookupDto(CardJpaEntity card, AccountJpaEntity account, UserJpaEntity owner) {
        String holderName = owner != null ? owner.getName() : "Tarjeta Anónima";
        String holderDni = owner != null ? owner.getDni() : "Sin vincular";
        String fareCategory = account != null && account.getFareCategory() != null
                ? account.getFareCategory().name()
                : "GENERAL";
        BigDecimal balance = account != null && account.getBalance() != null
                ? account.getBalance()
                : BigDecimal.ZERO;

        return new AgentCardLookupDTO(
                card.getCardId(),
                card.getAccountId(),
                card.getVerificationNumber(),
                holderName,
                holderDni,
                fareCategory,
                balance,
                card.getCardStatus().name()
        );
    }

    private String generateUniqueAgentCode(String dni) {
        String suffix = dni != null && dni.length() >= 4 ? dni.substring(dni.length() - 4) : "0001";
        String candidate = "AG-" + suffix;
        if (!agentProfileRepository.existsByAgentCode(candidate)) {
            return candidate;
        }
        return "AG-" + suffix + "-" + (10 + secureRandom.nextInt(90));
    }

    private String generateReferenceCode(String prefix) {
        int num = 100000 + secureRandom.nextInt(900000);
        return prefix + "-" + num + "-" + Long.toString(System.currentTimeMillis() % 1000);
    }

    private String generateUniqueVerificationNumber() {
        for (int i = 0; i < 5; i++) {
            StringBuilder sb = new StringBuilder(12);
            for (int j = 0; j < 12; j++) {
                sb.append(secureRandom.nextInt(10));
            }
            String candidate = sb.toString();
            if (!cardRepository.existsByVerificationNumber(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("No se pudo generar un número de verificación único.");
    }

    private AgentProfileDTO toAgentProfileDto(AgentProfileJpaEntity entity) {
        return new AgentProfileDTO(
                entity.getAgentCode(),
                entity.getBusinessName(),
                entity.getBusinessAddress(),
                entity.getOperationalBalance(),
                entity.getCommissionRate(),
                entity.getStatus(),
                entity.getRegisteredAt()
        );
    }

    private UserProfileResponseDTO toUserProfileDto(User user) {
        return new UserProfileResponseDTO(
                user.getId(),
                user.getDni().getValue(),
                user.getName(),
                user.getPhone(),
                user.getEmail().getValue(),
                user.getAge(),
                user.getAddress(),
                user.getBaseFare() != null ? user.getBaseFare().name() : "GENERAL",
                user.getRoles().stream().map(Role::name).toList()
        );
    }

    private AgentTransactionDTO toTxDto(AgentTransactionJpaEntity entity) {
        return new AgentTransactionDTO(
                entity.getId(),
                entity.getReferenceCode(),
                entity.getType(),
                entity.getCardId(),
                entity.getCardHolder(),
                entity.getFareCategory(),
                entity.getAmount(),
                entity.getPreviousBalance(),
                entity.getNewBalance(),
                entity.getPaymentMethod(),
                entity.getStatus(),
                entity.isUnlockedDebt(),
                entity.getNotes(),
                entity.getCreatedAt()
        );
    }
}
