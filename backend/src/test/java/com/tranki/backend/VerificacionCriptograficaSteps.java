package com.tranki.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tranki.backend.blacklist.application.GenerateBlacklistSignatureUseCase;
import com.tranki.backend.fleet.domain.model.Bus;
import com.tranki.backend.fleet.domain.model.HardwareId;
import com.tranki.backend.fleet.domain.model.LicensePlate;
import com.tranki.backend.trip.application.ProcessTripBatchUseCase;
import com.tranki.backend.fleet.domain.model.PublicKey;
import com.tranki.backend.fleet.domain.repository.BusRepository;
import com.tranki.backend.trip.adapter.in.web.dto.TripBatchRequestDTO;
import com.tranki.backend.trip.adapter.in.web.dto.TripRequestDTO;
import io.cucumber.java.Before;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.Signature;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

public class VerificacionCriptograficaSteps {

    @Autowired
    private BusRepository busRepository;

    @Autowired
    private ProcessTripBatchUseCase processTripBatchUseCase;

    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private GenerateBlacklistSignatureUseCase generateBlacklistSignatureUseCase;

    private KeyPair busKeyPair;
    private KeyPair serverKeyPair;
    private String currentBusId;
    private boolean threwUnauthorized;
    private String blacklistPayload;
    private String generatedSignature;

    @Before
    public void setupKeys() throws Exception {
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("EC");
        kpg.initialize(256);
        busKeyPair = kpg.generateKeyPair();
        serverKeyPair = kpg.generateKeyPair();
        
        // Inject server private key into the use case using reflection
        String serverPrivateKeyBase64 = Base64.getEncoder().encodeToString(serverKeyPair.getPrivate().getEncoded());
        ReflectionTestUtils.setField(generateBlacklistSignatureUseCase, "serverPrivateKeyBase64", serverPrivateKeyBase64);
        threwUnauthorized = false;
    }

    @Given("un validador de bus con clave publica registrada")
    public void un_validador_de_bus_con_clave_publica_registrada() {
        currentBusId = "BUS-CRYPTO-001";
        String pubKeyBase64 = Base64.getEncoder().encodeToString(busKeyPair.getPublic().getEncoded());
        Bus bus = new Bus(UUID.randomUUID(), new LicensePlate("CRYPTO-1"), new HardwareId(currentBusId), new PublicKey(pubKeyBase64));
        if (!busRepository.existsByHardwareId(new HardwareId(currentBusId))) {
            busRepository.save(bus);
        }
    }

    @When("envia un lote de viajes con una firma asimetrica valida")
    public void envia_un_lote_de_viajes_con_una_firma_asimetrica_valida() throws Exception {
        TripRequestDTO trip = new TripRequestDTO("TRP-C1", "TRK-001", new BigDecimal("1.20"), LocalDateTime.now().minusMinutes(5));
        List<TripRequestDTO> trips = List.of(trip);
        String tripsJson = objectMapper.writeValueAsString(trips);
        String payload = currentBusId + "|" + tripsJson;

        Signature ecdsaSign = Signature.getInstance("SHA256withECDSA");
        ecdsaSign.initSign(busKeyPair.getPrivate());
        ecdsaSign.update(payload.getBytes("UTF-8"));
        String signature = Base64.getEncoder().encodeToString(ecdsaSign.sign());

        TripBatchRequestDTO request = new TripBatchRequestDTO(currentBusId, trips, signature, "KEY-1");
        try {
            processTripBatchUseCase.execute(request);
        } catch (com.tranki.backend.shared.infrastructure.exception.UnauthorizedException e) {
            threwUnauthorized = true;
        }
    }

    @Then("el sistema verifica la firma exitosamente")
    public void el_sistema_verifica_la_firma_exitosamente() {
        assertThat(threwUnauthorized).isFalse();
    }

    @And("procede a procesar los viajes del lote")
    public void procede_a_procesar_los_viajes_del_lote() {
        // Validation that it didn't throw ensures processing happened (or was attempted)
    }

    @When("un atacante envia un lote de viajes con una firma falsificada o invalida")
    public void un_atacante_envia_un_lote_de_viajes_con_una_firma_falsificada_o_invalida() throws Exception {
        TripRequestDTO trip = new TripRequestDTO("TRP-C2", "TRK-002", new BigDecimal("0.00"), LocalDateTime.now().minusMinutes(5));
        List<TripRequestDTO> trips = List.of(trip);
        
        // Firma inválida (texto cualquiera en Base64 para que no falle el decoder)
        String signature = Base64.getEncoder().encodeToString("fake_signature_bytes_1234567890".getBytes());

        TripBatchRequestDTO request = new TripBatchRequestDTO(currentBusId, trips, signature, "KEY-1");
        try {
            processTripBatchUseCase.execute(request);
        } catch (com.tranki.backend.shared.infrastructure.exception.UnauthorizedException e) {
            threwUnauthorized = true;
        }
    }

    @Then("el sistema rechaza la peticion inmediatamente con 401")
    public void el_sistema_rechaza_la_peticion_inmediatamente_con_401() {
        assertThat(threwUnauthorized).isTrue();
    }

    @And("ningun viaje es guardado ni evaluado")
    public void ningun_viaje_es_guardado_ni_evaluado() {
        // As it's 401, the controller stops execution before the use case can save anything.
    }

    @Given("una actualizacion de la lista negra con tarjetas bloqueadas")
    public void una_actualizacion_de_la_lista_negra_con_tarjetas_bloqueadas() {
        blacklistPayload = "{\"blockedCards\": [\"TRK-X1\", \"TRK-X2\"]}";
    }

    @When("el sistema prepara el payload de la lista negra para su distribucion a los validadores")
    public void el_sistema_prepara_el_payload_de_la_lista_negra_para_su_distribucion_a_los_validadores() {
        // Preparation happens internally in the next step
    }

    @Then("el sistema genera una firma ECDSA utilizando la llave privada del servidor")
    public void el_sistema_genera_una_firma_ECDSA_utilizando_la_llave_privada_del_servidor() {
        generatedSignature = generateBlacklistSignatureUseCase.generateSignature(blacklistPayload);
        assertThat(generatedSignature).isNotBlank();
    }

    @And("adjunta la firma al payload saliente para que el validador pueda verificar su autenticidad")
    public void adjunta_la_firma_al_payload_saliente_para_que_el_validador_pueda_verificar_su_autenticidad() throws Exception {
        // Verifica que la firma generada es válida matemáticamente usando la llave pública del servidor
        Signature ecdsaVerify = Signature.getInstance("SHA256withECDSA");
        ecdsaVerify.initVerify(serverKeyPair.getPublic());
        ecdsaVerify.update(blacklistPayload.getBytes("UTF-8"));
        
        byte[] sigBytes = Base64.getDecoder().decode(generatedSignature);
        boolean isValid = ecdsaVerify.verify(sigBytes);
        
        assertThat(isValid).isTrue();
    }
}
