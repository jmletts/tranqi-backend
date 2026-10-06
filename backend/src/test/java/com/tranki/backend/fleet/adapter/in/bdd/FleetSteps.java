package com.tranki.backend.fleet.adapter.in.bdd;

import com.tranki.backend.fleet.adapter.in.web.dto.FleetEarningsResponseDTO;
import com.tranki.backend.fleet.adapter.in.web.dto.RegisterBusRequestDTO;
import com.tranki.backend.fleet.domain.repository.BusRepository;
import com.tranki.backend.trip.adapter.in.web.dto.TripBatchRequestDTO;
import com.tranki.backend.trip.adapter.in.web.dto.TripRequestDTO;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

public class FleetSteps {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private BusRepository busRepository;

    private ResponseEntity<Void> lastRegisterResponse;
    private ResponseEntity<FleetEarningsResponseDTO> lastEarningsResponse;
    private ResponseEntity<?> lastTripBatchResponse;

    @Given("un usuario autenticado con el rol {string}")
    public void un_usuario_autenticado_con_el_rol(String role) {
        // En un escenario real aquí configuraríamos el token JWT o auth header.
        // Por ahora asumimos que los endpoints están accesibles o se inyecta auth default.
    }

    @When("registra un bus con placa {string}, hardwareId {string} y una clave publica")
    public void registra_un_bus(String placa, String hardwareId) {
        RegisterBusRequestDTO request = new RegisterBusRequestDTO(placa, hardwareId, "PUB-KEY-TEST");
        lastRegisterResponse = restTemplate.postForEntity("/api/v1/fleet/buses", request, Void.class);
    }

    @Then("el bus es registrado exitosamente en el sistema")
    public void el_bus_es_registrado_exitosamente_en_el_sistema() {
        assertThat(lastRegisterResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    }

    @Given("un bus con placa {string} que ha procesado {int} viajes de {string}")
    public void un_bus_con_placa_que_ha_procesado_viajes_de(String placa, Integer numViajes, String tarifa) {
        // 1. Registramos el bus para que sea válido.
        String hardwareId = "HW-" + UUID.randomUUID().toString().substring(0, 8);
        registra_un_bus(placa, hardwareId);
        el_bus_es_registrado_exitosamente_en_el_sistema();

        // 2. Procesamos viajes a través del endpoint batch.
        TripRequestDTO trip = new TripRequestDTO(UUID.randomUUID().toString(), "TRK-001", new BigDecimal(tarifa), LocalDateTime.now());
        TripBatchRequestDTO batch = new TripBatchRequestDTO(hardwareId, Collections.nCopies(numViajes, trip), "VALID_SIGNATURE", "KEY-ID-1");
        restTemplate.postForEntity("/api/v1/trips/batch", batch, Object.class);
    }

    @When("consulta las ganancias del bus {string}")
    public void consulta_las_ganancias_del_bus(String placa) {
        lastEarningsResponse = restTemplate.getForEntity("/api/v1/fleet/buses/" + placa + "/earnings", FleetEarningsResponseDTO.class);
    }

    @Then("el sistema reporta una ganancia total de {string}")
    public void el_sistema_reporta_una_ganancia_total_de(String gananciaEsperada) {
        assertThat(lastEarningsResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(lastEarningsResponse.getBody()).isNotNull();
        assertThat(lastEarningsResponse.getBody().totalEarnings()).isEqualByComparingTo(gananciaEsperada);
    }

    @Given("un validador con hardwareId {string} no registrado en la flota")
    public void un_validador_con_hardwareId_no_registrado_en_la_flota(String hwId) {
        // Asegurarse de que no exista
    }

    @Given("un validador con hardwareId {string} no registrado o con firma invalida")
    public void un_validador_con_hardwareId_no_registrado_o_con_firma_invalida(String hwId) {
        // Context setup
    }

    @When("el validador {string} envía un lote de viajes al backend")
    public void el_validador_envia_un_lote_de_viajes_al_backend(String hwId) {
        TripRequestDTO trip = new TripRequestDTO(UUID.randomUUID().toString(), "TRK-001", new BigDecimal("1.20"), LocalDateTime.now());
        TripBatchRequestDTO batch = new TripBatchRequestDTO(hwId, Collections.singletonList(trip), "INVALID_SIGNATURE", "KEY-ID-1");
        lastTripBatchResponse = restTemplate.postForEntity("/api/v1/trips/batch", batch, String.class);
    }

    @Then("el sistema rechaza el lote completo con un error {int}")
    public void el_sistema_rechaza_el_lote_completo_con_un_error(Integer statusCode) {
        assertThat(lastTripBatchResponse.getStatusCode().value()).isEqualTo(statusCode);
    }
}
