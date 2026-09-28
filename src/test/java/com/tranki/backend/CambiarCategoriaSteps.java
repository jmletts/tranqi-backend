package com.tranki.backend;

import com.tranki.backend.account.domain.Account;
import com.tranki.backend.account.domain.AccountRepository;
import com.tranki.backend.account.domain.AccountStatus;
import com.tranki.backend.account.domain.FareCategory;
import com.tranki.backend.card.application.ChangeFareCategoryUseCase;
import com.tranki.backend.card.adapter.in.web.dto.ChangeFareCategoryRequestDTO;
import com.tranki.backend.card.domain.Card;
import com.tranki.backend.card.domain.CardBlockedException;
import com.tranki.backend.card.domain.CardRepository;
import com.tranki.backend.card.domain.CardStatus;
import com.tranki.backend.card.domain.InvalidDocumentException;
import com.tranki.backend.shared.domain.Money;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

public class CambiarCategoriaSteps {

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private ChangeFareCategoryUseCase changeFareCategoryUseCase;

    private Exception lastException;
    private Money balanceSnapshot;

    @Given("la tarjeta {string} existe con estado {string}, asociada a la cuenta {string} con {string} igual a {string}")
    public void la_tarjeta_existe_con_estado_asociada_a_la_cuenta_con_fareCategory_igual_a(
            String cardId, String estadoTarjeta, String accountIdStr, String fieldName, String categoria) {
        
        UUID accountId = UUID.nameUUIDFromBytes(accountIdStr.getBytes());
        CardStatus cStatus = estadoTarjeta.equals("BLOQUEADA_FRAUDE") ? CardStatus.FRAUD_BLOCKED : CardStatus.valueOf(estadoTarjeta);
        
        Account account = new Account(accountId, Money.of("10.00"), Money.of("-3.00"), AccountStatus.ACTIVE, null, FareCategory.valueOf(mapCategoria(categoria)));
        accountRepository.save(account);

        Card card = new Card(cardId, accountId, cStatus, "VER-" + cardId, "HASH", null);
        cardRepository.save(card);
    }

    @When("el agente {string} solicita cambiar la categoría de la cuenta {string} a {string} presentando DNI {string} vigente")
    public void el_agente_solicita_cambiar_la_categoria_dni(String agentId, String accountIdStr, String categoria, String dni) {
        cambiarCategoria(agentId, accountIdStr, categoria, dni);
    }

    @When("el agente {string} solicita cambiar la categoría de la cuenta {string} a {string} presentando carnet universitario {string} vigente")
    public void el_agente_solicita_cambiar_la_categoria_carnet(String agentId, String accountIdStr, String categoria, String carnet) {
        cambiarCategoria(agentId, accountIdStr, categoria, carnet);
    }

    @When("el agente {string} solicita cambiar la categoría de la cuenta {string} a {string} sin presentar documento adicional")
    public void el_agente_solicita_cambiar_la_categoria_sin_doc(String agentId, String accountIdStr, String categoria) {
        cambiarCategoria(agentId, accountIdStr, categoria, null);
    }

    @When("el agente {string} solicita cambiar la categoría de la cuenta {string} a {string} presentando DNI {string}")
    public void el_agente_solicita_cambiar_la_categoria_dni_invalido(String agentId, String accountIdStr, String categoria, String dni) {
        cambiarCategoria(agentId, accountIdStr, categoria, dni);
    }

    @When("el agente {string} solicita cambiar la categoría de la cuenta {string} a {string} presentando carnet universitario {string}")
    public void el_agente_solicita_cambiar_la_categoria_carnet_invalido(String agentId, String accountIdStr, String categoria, String carnet) {
        cambiarCategoria(agentId, accountIdStr, categoria, carnet);
    }

    private void cambiarCategoria(String agentId, String accountIdStr, String categoria, String doc) {
        UUID accountId = UUID.nameUUIDFromBytes(accountIdStr.getBytes());
        UUID agentUuid = UUID.nameUUIDFromBytes(agentId.getBytes());
        String cat = mapCategoria(categoria);
        
        // Tomamos foto del saldo
        balanceSnapshot = accountRepository.findById(accountId).get().getBalance();

        ChangeFareCategoryRequestDTO request = new ChangeFareCategoryRequestDTO(accountId, cat, doc, agentUuid);
        try {
            changeFareCategoryUseCase.execute(request);
            lastException = null;
        } catch (Exception e) {
            lastException = e;
        }
    }

    private String mapCategoria(String cat) {
        if (cat.equals("ESCOLAR")) return "SCHOOL";
        if (cat.equals("UNIVERSITARIO")) return "UNIVERSITY";
        return cat;
    }

    @Then("la cuenta {string} actualiza su {string} a {string}")
    public void la_cuenta_actualiza_su_fareCategory(String accountIdStr, String field, String categoria) {
        UUID accountId = UUID.nameUUIDFromBytes(accountIdStr.getBytes());
        Account account = accountRepository.findById(accountId).orElseThrow();
        assertThat(account.getFareCategory().name()).isEqualTo(mapCategoria(categoria));
    }

    @Then("el saldo de la cuenta {string} no es modificado")
    public void el_saldo_de_la_cuenta_no_es_modificado(String accountIdStr) {
        UUID accountId = UUID.nameUUIDFromBytes(accountIdStr.getBytes());
        Account account = accountRepository.findById(accountId).orElseThrow();
        assertThat(account.getBalance().amount()).isEqualByComparingTo(balanceSnapshot.amount());
    }

    @Then("la solicitud de cambio de categoría es rechazada por documento inválido")
    public void la_solicitud_de_cambio_de_categoría_es_rechazada_por_documento_inválido() {
        assertThat(lastException).isInstanceOf(InvalidDocumentException.class);
    }

    @Then("la cuenta {string} mantiene su {string} igual a {string}")
    public void la_cuenta_mantiene_su_fareCategory_igual_a(String accountIdStr, String field, String categoria) {
        UUID accountId = UUID.nameUUIDFromBytes(accountIdStr.getBytes());
        Account account = accountRepository.findById(accountId).orElseThrow();
        assertThat(account.getFareCategory().name()).isEqualTo(mapCategoria(categoria));
    }

    @Then("la solicitud de cambio de categoría es rechazada porque la tarjeta está reportada como perdida")
    public void rechazada_por_perdida() {
        assertThat(lastException).isInstanceOf(CardBlockedException.class);
    }

    @Then("la solicitud de cambio de categoría es rechazada porque la tarjeta está bloqueada por fraude")
    public void rechazada_por_fraude() {
        assertThat(lastException).isInstanceOf(CardBlockedException.class);
    }
}
