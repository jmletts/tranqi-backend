package com.tranki.backend.e2e;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tranki.backend.account.domain.FareCategory;
import com.tranki.backend.iam.adapter.in.web.dto.LoginRequestDTO;
import com.tranki.backend.iam.adapter.in.web.dto.RegisterRequestDTO;
import com.tranki.backend.iam.adapter.out.persistence.UserJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerE2ETest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserJpaRepository userJpaRepository;

    @BeforeEach
    void setUp() {
        userJpaRepository.deleteAll();
    }

    @Test
    void shouldRegisterAndLoginSuccessfully() throws Exception {
        RegisterRequestDTO registerReq = new RegisterRequestDTO();
        registerReq.setDni("12345678");
        registerReq.setName("Joaquin");
        registerReq.setPhone("999999999");
        registerReq.setEmail("joaquin@test.com");
        registerReq.setAge(30);
        registerReq.setAddress("Lima");
        registerReq.setBaseFare(FareCategory.GENERAL);
        registerReq.setPassword("secret");

        // 1. Register
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        // 2. Login
        LoginRequestDTO loginReq = new LoginRequestDTO();
        loginReq.setDni("12345678");
        loginReq.setPassword("secret");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }
}
