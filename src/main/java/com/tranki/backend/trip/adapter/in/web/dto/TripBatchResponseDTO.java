package com.tranki.backend.trip.adapter.in.web.dto;

public record TripBatchResponseDTO(int successful, int duplicates, int errors) {}
