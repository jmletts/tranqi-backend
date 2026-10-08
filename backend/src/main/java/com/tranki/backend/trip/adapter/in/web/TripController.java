package com.tranki.backend.trip.adapter.in.web;

import com.tranki.backend.trip.adapter.in.web.dto.TripBatchRequestDTO;
import com.tranki.backend.trip.adapter.in.web.dto.TripBatchResponseDTO;
import com.tranki.backend.trip.application.ProcessTripBatchUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/trips")
public class TripController {

    private final ProcessTripBatchUseCase processTripBatchUseCase;

    public TripController(ProcessTripBatchUseCase processTripBatchUseCase) {
        this.processTripBatchUseCase = processTripBatchUseCase;
    }

    @PostMapping("/batch")
    public ResponseEntity<TripBatchResponseDTO> processBatch(@RequestBody TripBatchRequestDTO request) {
        return ResponseEntity.ok(processTripBatchUseCase.execute(request));
    }
}
