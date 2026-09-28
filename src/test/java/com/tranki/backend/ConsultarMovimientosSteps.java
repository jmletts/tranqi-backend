package com.tranki.backend;

import com.tranki.backend.account.adapter.in.web.dto.AccountMovementsResponseDTO;
import com.tranki.backend.account.adapter.out.persistence.MovementJpaEntity;
import com.tranki.backend.account.adapter.out.persistence.MovementJpaRepository;
import com.tranki.backend.account.application.GetAccountMovementsUseCase;
import com.tranki.backend.account.domain.Account;
import com.tranki.backend.account.domain.AccountRepository;
import com.tranki.backend.card.domain.Card;
import com.tranki.backend.card.domain.CardRepository;
import com.tranki.backend.card.domain.CardStatus;
import com.tranki.backend.shared.domain.Money;
import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

public class ConsultarMovimientosSteps {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private MovementJpaRepository movementJpaRepository;

    @Autowired
    private GetAccountMovementsUseCase getAccountMovementsUseCase;

    private AccountMovementsResponseDTO lastResponse;
    private Exception lastException;

    @Given("la tarjeta {string} existe con estado {string}, asociada a la cuenta {string} con {string} nulo")
    public void la_tarjeta_existe_con_estado_asociada_a_la_cuenta_con_nulo(String cardId, String estadoTarjeta, String accountIdStr, String field) {
        UUID accountId = UUID.nameUUIDFromBytes(accountIdStr.getBytes());
        CardStatus cStatus = CardStatus.valueOf(estadoTarjeta);
        
        Account account = new Account(accountId, Money.of("0.00"), Money.of("-3.00"), com.tranki.backend.account.domain.AccountStatus.ACTIVE, null, com.tranki.backend.account.domain.FareCategory.GENERAL);
        accountRepository.save(account);

        Card card = new Card(cardId, accountId, cStatus, "VER-" + cardId, "HASH", null);
        cardRepository.save(card);
    }

    @Given("la cuenta {string} registra los siguientes movimientos históricos en orden cronológico descendente:")
    public void la_cuenta_registra_los_siguientes_movimientos(String accountIdStr, DataTable dataTable) {
        UUID accountId = UUID.nameUUIDFromBytes(accountIdStr.getBytes());
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        List<Map<String, String>> rows = dataTable.asMaps(String.class, String.class);
        for (Map<String, String> row : rows) {
            MovementJpaEntity entity = new MovementJpaEntity(
                    row.get("identificador"),
                    accountId,
                    row.get("tipo"),
                    new BigDecimal(row.get("monto")),
                    LocalDateTime.parse(row.get("fecha"), formatter),
                    row.get("detalle")
            );
            movementJpaRepository.save(entity);
        }
    }

    @When("el usuario {string} consulta los movimientos de la cuenta {string}")
    public void el_usuario_consulta_los_movimientos(String userIdStr, String accountIdStr) {
        ejecutarConsulta(userIdStr, accountIdStr);
    }

    @When("el usuario {string} intenta consultar los movimientos de la cuenta {string}")
    public void el_usuario_intenta_consultar_los_movimientos(String userIdStr, String accountIdStr) {
        ejecutarConsulta(userIdStr, accountIdStr);
    }

    @When("el usuario {string} intenta consultar los movimientos de la cuenta anónima {string}")
    public void el_usuario_intenta_consultar_movimientos_anonima(String userIdStr, String accountIdStr) {
        ejecutarConsulta(userIdStr, accountIdStr);
    }

    private void ejecutarConsulta(String userIdStr, String accountIdStr) {
        UUID userId = UUID.nameUUIDFromBytes(userIdStr.getBytes());
        UUID accountId = UUID.nameUUIDFromBytes(accountIdStr.getBytes());
        try {
            lastResponse = getAccountMovementsUseCase.execute(userId, accountId);
            lastException = null;
        } catch (Exception e) {
            lastException = e;
            lastResponse = null;
        }
    }

    @Then("el sistema retorna un listado con {int} movimientos")
    public void el_sistema_retorna_un_listado_con_movimientos(Integer count) {
        assertThat(lastException).isNull();
        assertThat(lastResponse.movements()).hasSize(count);
    }

    @Then("el primer movimiento del listado corresponde al viaje {string} por ser el más reciente")
    public void el_primer_movimiento_corresponde_al_viaje(String identifier) {
        assertThat(lastResponse.movements().get(0).identifier()).isEqualTo(identifier);
    }

    @Then("la respuesta incluye el saldo actual de la cuenta {string}")
    public void la_respuesta_incluye_el_saldo_actual(String accountIdStr) {
        UUID accountId = UUID.nameUUIDFromBytes(accountIdStr.getBytes());
        Account account = accountRepository.findById(accountId).orElseThrow();
        assertThat(lastResponse.currentBalance()).isEqualByComparingTo(account.getBalance().amount());
    }

    @Then("el sistema rechaza la consulta porque el {string} de la cuenta no coincide con el del usuario solicitante")
    public void el_sistema_rechaza_por_userId_no_coincide(String field) {
        assertThat(lastException).isInstanceOf(SecurityException.class)
                .hasMessageContaining("No autorizado");
    }

    @Then("el sistema rechaza la consulta porque la cuenta es anónima y no está vinculada a ningún usuario")
    public void el_sistema_rechaza_por_cuenta_anonima() {
        assertThat(lastException).isInstanceOf(SecurityException.class)
                .hasMessageContaining("anónima");
    }
}
