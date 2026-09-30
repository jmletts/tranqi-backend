package com.tranki.backend.e2e;

import com.tranki.backend.account.adapter.out.persistence.AccountJpaRepository;
import com.tranki.backend.account.adapter.out.persistence.MovementJpaRepository;
import com.tranki.backend.account.adapter.out.persistence.RechargeJpaRepository;
import com.tranki.backend.card.adapter.out.persistence.CardJpaRepository;
import com.tranki.backend.trip.adapter.out.persistence.TripJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public abstract class BaseE2ETest {

    @Autowired
    protected TestRestTemplate restTemplate;

    @Autowired
    protected CardJpaRepository cardJpaRepository;

    @Autowired
    protected AccountJpaRepository accountJpaRepository;

    @Autowired
    protected MovementJpaRepository movementJpaRepository;

    @Autowired
    protected RechargeJpaRepository rechargeJpaRepository;

    @Autowired
    protected TripJpaRepository tripJpaRepository;

    @BeforeEach
    public void cleanup() {
        movementJpaRepository.deleteAll();
        rechargeJpaRepository.deleteAll();
        tripJpaRepository.deleteAll();
        cardJpaRepository.deleteAll();
        accountJpaRepository.deleteAll();
    }
}
