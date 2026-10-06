package com.tranki.backend;

import io.cucumber.spring.CucumberContextConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.event.RecordApplicationEvents;

import org.springframework.context.annotation.Import;
import com.tranki.backend.e2e.TestSecurityConfig;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

@CucumberContextConfiguration
@SpringBootTest
@RecordApplicationEvents
@Import(TestSecurityConfig.class)
@AutoConfigureMockMvc
public class CucumberSpringConfiguration {
}
