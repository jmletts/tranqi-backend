package com.tranki.backend.iam.adapter.in.web.dto;

public record UpdateProfileRequestDTO(
        String name,
        String phone,
        String email,
        String address
) {}
