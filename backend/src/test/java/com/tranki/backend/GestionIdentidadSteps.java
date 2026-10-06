package com.tranki.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tranki.backend.account.domain.FareCategory;
import com.tranki.backend.iam.adapter.in.web.dto.LoginRequestDTO;
import com.tranki.backend.iam.adapter.in.web.dto.RegisterRequestDTO;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class GestionIdentidadSteps {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private ResultActions resultActions;

    @Given("que un nuevo pasajero con DNI {string} desea usar el sistema")
    public void un_nuevo_pasajero_con_dni_desea_usar_el_sistema(String dni) {
        // Nada que hacer aquí, es contexto.
    }

    @When("se registra proporcionando sus datos, contraseña {string} y correo {string}")
    public void se_registra_proporcionando_sus_datos_contrasena_y_correo(String pwd, String email) throws Exception {
        RegisterRequestDTO req = new RegisterRequestDTO();
        req.setDni("87654321");
        req.setName("Juan Perez");
        req.setPhone("987654321");
        req.setEmail(email);
        req.setAge(25);
        req.setAddress("Av siempre viva");
        req.setBaseFare(FareCategory.GENERAL);
        req.setPassword(pwd);

        resultActions = mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)));
    }

    @Then("el sistema crea su cuenta con rol USUARIO_FINAL exitosamente")
    public void el_sistema_crea_su_cuenta_con_rol_usuario_final_exitosamente() throws Exception {
        resultActions.andExpect(status().isCreated());
    }

    @When("inicia sesión con su DNI {string} y contraseña {string}")
    public void inicia_sesion_con_su_dni_y_contrasena(String dni, String pwd) throws Exception {
        LoginRequestDTO req = new LoginRequestDTO();
        req.setDni(dni);
        req.setPassword(pwd);

        resultActions = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)));
    }

    @Then("el sistema le devuelve un token JWT")
    public void el_sistema_le_devuelve_un_token_jwt() throws Exception {
        resultActions.andExpect(status().isOk())
                     .andExpect(jsonPath("$.token").exists());
    }
}
