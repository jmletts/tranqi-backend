package com.tranki.backend.blacklist.adapter.in.web;

import com.tranki.backend.blacklist.adapter.in.web.dto.BlacklistSyncResponseDTO;
import com.tranki.backend.blacklist.application.SyncBlacklistUseCase;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/api/v1/blacklist")
public class BlacklistSyncController {

    private final SyncBlacklistUseCase syncUseCase;
    private final Bucket bucket;

    public BlacklistSyncController(SyncBlacklistUseCase syncUseCase) {
        this.syncUseCase = syncUseCase;
        // Limit: 60 requests per minute
        Bandwidth limit = Bandwidth.classic(60, Refill.greedy(60, Duration.ofMinutes(1)));
        this.bucket = Bucket.builder().addLimit(limit).build();
    }

    @GetMapping("/sync")
    public ResponseEntity<BlacklistSyncResponseDTO> sync(@RequestParam long localVersion) {
        if (bucket.tryConsume(1)) {
            BlacklistSyncResponseDTO response = syncUseCase.getUpdatesSince(localVersion);
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
    }
}
