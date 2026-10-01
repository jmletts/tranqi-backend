package com.tranki.backend.trip.adapter.in.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record TripBatchRequestDTO(
    String busId,
    List<TripRequestDTO> trips,
    @JsonProperty("firma") String signature,
    @JsonProperty("claveId") String keyId
) {}
