package com.tranki.backend;

import io.cucumber.spring.CucumberContextConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.event.RecordApplicationEvents;

@CucumberContextConfiguration
@SpringBootTest
@RecordApplicationEvents
public class CucumberSpringConfiguration {
}
