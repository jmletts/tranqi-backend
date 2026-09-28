package com.tranki.backend.trip.adapter.in.web.dto;

import java.util.List;

public record TripBatchRequestDTO(String busId, List<TripRequestDTO> trips) {}
