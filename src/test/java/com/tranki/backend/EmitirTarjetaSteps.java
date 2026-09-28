package com.tranki.backend;

import com.tranki.backend.account.domain.Account;
import com.tranki.backend.account.domain.AccountRepository;
import com.tranki.backend.account.domain.FareCategory;
import com.tranki.backend.card.application.IssueCardUseCase;
import com.tranki.backend.card.adapter.in.web.dto.IssueCardRequestDTO;
import com.tranki.backend.card.adapter.in.web.dto.IssueCardResponseDTO;
import com.tranki.backend.card.domain.Card;
import com.tranki.backend.card.domain.CardRepository;
import com.tranki.backend.card.domain.CardStatus;
import com.tranki.backend.card.domain.InvalidDocumentException;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

public class EmitirTarjetaSteps {

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private IssueCardUseCase issueCardUseCase;

    private UUID currentKioskAgentId;
    private Exception lastException;
    private IssueCardResponseDTO lastResponse;

    @Given("que el agente de kiosco {string} opera en el punto de recarga {string}")
    public void que_el_agente_de_kiosco_opera_en_el_punto_de_recarga(String agentIdStr, String rechargePointStr) {
        // Convert to UUID dummy by hashing or just assigning random UUID. 
        // For tests we map AGT-001 to a specific UUID.
        currentKioskAgentId = UUID.nameUUIDFromBytes(agentIdStr.getBytes());
    }

    @Given("la tarjeta {string} existe en el sistema con estado {string}")
    public void la_tarjeta_existe_en_el_sistema_con_estado(String cardId, String estado) {
        CardStatus status = estado.equals("EN_INVENTARIO") ? CardStatus.IN_INVENTORY : CardStatus.valueOf(estado);
        Card card = new Card(cardId, null, status, null, null, null);
        cardRepository.save(card);
    }

    @Given("la tarjeta {string} existe en el sistema con estado {string} asociada a la cuenta {string}")
    public void la_tarjeta_existe_en_el_sistema_con_estado_asociada_a_la_cuenta(String cardId, String estado, String accountIdStr) {
        CardStatus status = CardStatus.valueOf(estado);
        UUID accountId = UUID.nameUUIDFromBytes(accountIdStr.getBytes());
        Card card = new Card(cardId, accountId, status, "123456789012", "hash", null);
        cardRepository.save(card);
    }

    @When("el agente {string} solicita emitir la tarjeta {string} con categoría {string} sin documento adicional")
    public void el_agente_solicita_emitir_la_tarjeta_con_categoria_sin_documento(String agentId, String cardId, String categoria) {
        emitCard(agentId, cardId, categoria, null);
    }

    @When("el agente {string} solicita emitir la tarjeta {string} con categoría {string} presentando DNI {string} vigente")
    public void el_agente_solicita_emitir_la_tarjeta_con_categoria_presentando_dni_vigente(String agentId, String cardId, String categoria, String dni) {
        emitCard(agentId, cardId, categoria, dni);
    }

    @When("el agente {string} solicita emitir la tarjeta {string} con categoría {string} presentando carnet universitario {string} vigente")
    public void el_agente_solicita_emitir_la_tarjeta_con_categoria_presentando_carnet_vigente(String agentId, String cardId, String categoria, String carnet) {
        emitCard(agentId, cardId, categoria, carnet);
    }

    @When("el agente {string} solicita emitir la tarjeta {string} con categoría {string} presentando DNI {string} expirado")
    public void el_agente_solicita_emitir_la_tarjeta_con_categoria_presentando_dni_expirado(String agentId, String cardId, String categoria, String dni) {
        emitCard(agentId, cardId, categoria, dni);
    }

    @When("el agente {string} solicita emitir la tarjeta {string} con categoría {string} presentando carnet universitario {string}")
    public void el_agente_solicita_emitir_la_tarjeta_con_categoria_presentando_carnet(String agentId, String cardId, String categoria, String carnet) {
        emitCard(agentId, cardId, categoria, carnet);
    }

    @When("el agente {string} solicita emitir la tarjeta {string} con categoría {string}")
    public void el_agente_solicita_emitir_la_tarjeta_con_categoria(String agentId, String cardId, String categoria) {
        emitCard(agentId, cardId, categoria, null);
    }

    private void emitCard(String agentId, String cardId, String categoria, String doc) {
        String mappedCategory = mapCategoria(categoria);
        try {
            UUID agentUuid = UUID.nameUUIDFromBytes(agentId.getBytes());
            IssueCardRequestDTO request = new IssueCardRequestDTO(cardId, mappedCategory, doc, agentUuid);
            lastResponse = issueCardUseCase.execute(request);
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

    @Then("la tarjeta {string} pasa al estado {string}")
    public void la_tarjeta_pasa_al_estado(String cardId, String estado) {
        Card card = cardRepository.findById(cardId).orElseThrow();
        assertThat(card.getCardStatus().name()).isEqualTo(estado);
    }

    @Then("se crea una nueva cuenta con {string} nulo asociada a la tarjeta {string}")
    public void se_crea_una_nueva_cuenta_con_userId_nulo_asociada_a_la_tarjeta(String campo, String cardId) {
        Card card = cardRepository.findById(cardId).orElseThrow();
        Account account = accountRepository.findById(card.getAccountId()).orElseThrow();
        assertThat(account.getUserId()).isNull();
    }

    @Then("el saldo inicial de la cuenta creada es de {double}")
    public void el_saldo_inicial_de_la_cuenta_creada_es_de(Double saldo) {
        Account account = accountRepository.findById(lastResponse.accountId()).orElseThrow();
        assertThat(account.getBalance().amount()).isEqualByComparingTo(BigDecimal.valueOf(saldo));
    }

    @Then("el campo {string} de la tarjeta {string} queda registrado como {string}")
    public void el_campo_kioskAgentId_de_la_tarjeta_queda_registrado_como(String campo, String cardId, String agentId) {
        Card card = cardRepository.findById(cardId).orElseThrow();
        UUID expectedAgent = UUID.nameUUIDFromBytes(agentId.getBytes());
        assertThat(card.getKioskAgentId()).isEqualTo(expectedAgent);
    }

    @Then("la tarjeta {string} recibe un {string} de {int} dígitos generado con SecureRandom")
    public void la_tarjeta_recibe_un_verificationNumber_de_digitos(String cardId, String campo, Integer digits) {
        Card card = cardRepository.findById(cardId).orElseThrow();
        assertThat(card.getVerificationNumber()).hasSize(digits);
        assertThat(card.getVerificationNumber()).matches("\\d{" + digits + "}");
    }


    @Then("la cuenta creada tiene {string} igual a {string}")
    public void la_cuenta_creada_tiene_fareCategory_igual_a(String campo, String categoria) {
        Account account = accountRepository.findById(lastResponse.accountId()).orElseThrow();
        assertThat(account.getFareCategory().name()).isEqualTo(mapCategoria(categoria));
    }

    @Then("el campo {string} de la cuenta creada es nulo")
    public void el_campo_userId_de_la_cuenta_creada_es_nulo(String campo) {
        Account account = accountRepository.findById(lastResponse.accountId()).orElseThrow();
        assertThat(account.getUserId()).isNull();
    }

    @Then("la solicitud de emisión es rechazada por documento inválido")
    public void la_solicitud_de_emision_es_rechazada_por_documento_invalido() {
        assertThat(lastException).isInstanceOf(InvalidDocumentException.class);
    }

    @Then("la tarjeta {string} permanece en estado {string}")
    public void la_tarjeta_permanece_en_estado(String cardId, String estado) {
        Card card = cardRepository.findById(cardId).orElseThrow();
        String st = estado;
        if (estado.equals("EN_INVENTARIO")) st = "IN_INVENTORY";
        if (estado.equals("BLOCKED_DEUDA")) st = "BLOCKED_DEBT";
        assertThat(card.getCardStatus().name()).isEqualTo(st);
    }

    @Then("no se crea ninguna cuenta en el sistema")
    public void no_se_crea_ninguna_cuenta_en_el_sistema() {
        // En este paso podemos asumir que accountId en la respuesta es nulo, porque falló.
        assertThat(lastResponse).isNull();
    }

    @Then("la solicitud de emisión es rechazada porque la tarjeta ya se encuentra activa")
    public void la_solicitud_de_emision_es_rechazada_porque_la_tarjeta_ya_esta_activa() {
        assertThat(lastException).isInstanceOf(IllegalStateException.class);
    }

    @Then("la tarjeta {string} mantiene su cuenta {string} sin modificaciones")
    public void la_tarjeta_mantiene_su_cuenta_sin_modificaciones(String cardId, String accountIdStr) {
        Card card = cardRepository.findById(cardId).orElseThrow();
        UUID expectedAccount = UUID.nameUUIDFromBytes(accountIdStr.getBytes());
        assertThat(card.getAccountId()).isEqualTo(expectedAccount);
    }

    @Given("que el sistema ya contiene una tarjeta con {string} {string}")
    public void que_el_sistema_ya_contiene_una_tarjeta_con_verificationNumber(String campo, String verificationNumber) {
        Card card = new Card("TRK-DUMMY", null, CardStatus.ACTIVE, verificationNumber, "hash", null);
        cardRepository.save(card);
    }

    @Then("el sistema genera un nuevo {string} distinto de {string} para la tarjeta {string}")
    public void el_sistema_genera_un_nuevo_verificationNumber_distinto_de(String campo, String oldNumber, String cardId) {
        Card card = cardRepository.findById(cardId).orElseThrow();
        assertThat(card.getVerificationNumber()).isNotEqualTo(oldNumber);
        assertThat(card.getVerificationNumber()).matches("\\d{12}");
    }
}
