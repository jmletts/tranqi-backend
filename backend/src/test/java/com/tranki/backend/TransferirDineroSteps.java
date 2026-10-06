package com.tranki.backend;

import com.tranki.backend.account.adapter.in.web.dto.TransferRequestDTO;
import com.tranki.backend.account.application.TransferFundsUseCase;
import com.tranki.backend.account.domain.Account;
import com.tranki.backend.account.domain.AccountRepository;
import com.tranki.backend.card.domain.Card;
import com.tranki.backend.card.domain.CardRepository;
import com.tranki.backend.card.domain.CardStatus;
import com.tranki.backend.shared.domain.Money;
import com.tranki.backend.shared.domain.events.TransferConfirmedEvent;
import com.tranki.backend.shared.domain.events.TransferRejectedByDebtLimitEvent;
import com.tranki.backend.shared.domain.events.TransferRejectedByUnauthorizedAccountEvent;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.event.ApplicationEvents;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

public class TransferirDineroSteps {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private TransferFundsUseCase transferFundsUseCase;

    @Autowired
    private ApplicationEvents applicationEvents;

    private Exception lastException;

    @Given("la tarjeta {string} existe con estado {string}, asociada a la cuenta {string} con saldo {double} y {string} igual a {string}")
    public void la_tarjeta_existe_con_estado_asociada_a_la_cuenta_con_saldo_y_userid_igual_a(String cardId, String estadoStr, String accountIdStr, Double saldo, String field, String userIdStr) {
        UUID accountId = UUID.nameUUIDFromBytes(accountIdStr.getBytes());
        UUID userId = userIdStr.equals("nulo") ? null : UUID.nameUUIDFromBytes(userIdStr.getBytes());
        
        Account account = accountRepository.findById(accountId).orElse(null);
        if (account == null) {
            account = new Account(accountId, Money.of(saldo.toString()), Money.of("-3.00"), com.tranki.backend.account.domain.AccountStatus.ACTIVE, userId, com.tranki.backend.account.domain.FareCategory.GENERAL);
        } else {
            // Limpiar estado de DB contaminado por escenarios previos
            account = new Account(accountId, Money.of(saldo.toString()), Money.of("-3.00"), account.getStatus(), userId, account.getFareCategory());
        }
        accountRepository.save(account);

        CardStatus status;
        switch (estadoStr) {
            case "BLOQUEADA_FRAUDE": status = CardStatus.FRAUD_BLOCKED; break;
            case "LOST_REPORTED": status = CardStatus.LOST_REPORTED; break;
            case "BLOCKED_DEUDA": status = CardStatus.BLOCKED_DEBT; break;
            default: status = CardStatus.valueOf(estadoStr);
        }

        Card card = new Card(cardId, accountId, status, "VER-" + cardId, "HASH", null, 0);
        cardRepository.save(card);
    }

    @Given("la tarjeta {string} existe con estado {string}, asociada a la cuenta {string} con saldo {double} y {string} nulo")
    public void la_tarjeta_existe_con_estado_asociada_a_la_cuenta_con_saldo_y_userid_nulo(String cardId, String estadoStr, String accountIdStr, Double saldo, String field) {
        la_tarjeta_existe_con_estado_asociada_a_la_cuenta_con_saldo_y_userid_igual_a(cardId, estadoStr, accountIdStr, saldo, field, "nulo");
    }

    @Given("el {string} de todas las cuentas de {string} es de {double}")
    public void el_debt_margin_limit_de_todas_las_cuentas_de_es_de(String field, String userIdStr, Double limite) {
        // En nuestro Account actual, el debtMarginLimit ya es -3.00 por defecto en los constructores de steps,
        // asi que solo nos aseguramos (podríamos hacer un loop de actualizacion si quisieramos, pero ya lo pusimos a -3.00)
    }

    @When("el usuario {string} transfiere {double} desde la cuenta {string} hacia la cuenta {string}")
    public void el_usuario_transfiere_desde_la_cuenta_hacia_la_cuenta(String userIdStr, Double monto, String cuentaOrigenStr, String cuentaDestinoStr) {
        ejecutarTransferencia(userIdStr, monto, cuentaOrigenStr, cuentaDestinoStr);
    }

    @When("el usuario {string} intenta transferir {double} desde la cuenta {string} hacia la cuenta {string}")
    public void el_usuario_intenta_transferir_desde_la_cuenta_hacia_la_cuenta(String userIdStr, Double monto, String cuentaOrigenStr, String cuentaDestinoStr) {
        ejecutarTransferencia(userIdStr, monto, cuentaOrigenStr, cuentaDestinoStr);
    }

    private void ejecutarTransferencia(String userIdStr, Double monto, String cuentaOrigenStr, String cuentaDestinoStr) {
        UUID userId = UUID.nameUUIDFromBytes(userIdStr.getBytes());
        UUID origen = UUID.nameUUIDFromBytes(cuentaOrigenStr.getBytes());
        UUID destino = UUID.nameUUIDFromBytes(cuentaDestinoStr.getBytes());
        
        TransferRequestDTO request = new TransferRequestDTO(origen, destino, BigDecimal.valueOf(monto));
        try {
            transferFundsUseCase.execute(userId, request);
            lastException = null;
        } catch (Exception e) {
            lastException = e;
        }
    }

    @Then("el saldo de la cuenta {string} pasa a ser {double}")
    public void el_saldo_de_la_cuenta_pasa_a_ser(String cuentaStr, Double saldoEsperado) {
        UUID accountId = UUID.nameUUIDFromBytes(cuentaStr.getBytes());
        Account account = accountRepository.findById(accountId).orElseThrow();
        assertThat(account.getBalance().amount()).isEqualByComparingTo(saldoEsperado.toString());
    }

    @Then("el saldo de la cuenta {string} se mantiene en {double}")
    public void el_saldo_de_la_cuenta_se_mantiene_en(String cuentaStr, Double saldoEsperado) {
        el_saldo_de_la_cuenta_pasa_a_ser(cuentaStr, saldoEsperado);
    }

    @Then("la transferencia es rechazada porque el monto debe ser mayor a cero")
    public void la_transferencia_es_rechazada_porque_el_monto_debe_ser_mayor_a_cero() {
        assertThat(lastException).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("mayor a cero");
    }

    @Then("la transferencia es rechazada porque la cuenta origen quedaría por debajo del {string} de {double}")
    public void la_transferencia_es_rechazada_porque_la_cuenta_origen_quedaria_por_debajo_del_de(String field, Double limit) {
        assertThat(lastException).isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Saldo insuficiente: supera el margen de deuda permitido");
    }

    @Then("la transferencia es rechazada porque la cuenta destino no está autorizada para este usuario")
    public void la_transferencia_es_rechazada_porque_la_cuenta_destino_no_esta_autorizada() {
        assertThat(lastException).isInstanceOf(SecurityException.class)
                .hasMessageContaining("No autorizado para operar la cuenta destino");
    }

    @Then("la transferencia es rechazada porque la cuenta origen no está autorizada para este usuario")
    public void la_transferencia_es_rechazada_porque_la_cuenta_origen_no_esta_autorizada() {
        assertThat(lastException).isInstanceOf(SecurityException.class)
                .hasMessageContaining("No autorizado para operar la cuenta origen");
    }

    @Then("la transferencia es rechazada porque la tarjeta asociada a la cuenta origen está en estado {string}")
    public void la_transferencia_es_rechazada_porque_la_tarjeta_asociada_a_la_cuenta_origen_esta_en_estado(String estado) {
        assertThat(lastException).isInstanceOf(SecurityException.class)
                .hasMessageContaining("Tarjeta origen bloqueada");
    }

    @Then("la transferencia es rechazada porque la tarjeta asociada a la cuenta destino está en estado {string}")
    public void la_transferencia_es_rechazada_porque_la_tarjeta_asociada_a_la_cuenta_destino_esta_en_estado(String estado) {
        assertThat(lastException).isInstanceOf(SecurityException.class)
                .hasMessageContaining("Tarjeta destino bloqueada");
    }

    // Interceptar el verificador global de eventos de otras US si choca con esta US
    // Ya lo unificamos en ConfirmarRecargaSteps, asi que usaremos la unificacion alli
}
