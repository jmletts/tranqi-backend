package com.tranki.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching  // Activa el sistema de caché para @Cacheable en SyncBlacklistUseCase (US-11)
public class TrankiApplication {

	public static void main(String[] args) {
		SpringApplication.run(TrankiApplication.class, args);
	}

}
