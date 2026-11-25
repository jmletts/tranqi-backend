package com.tranki.backend.iam.adapter.in.web.dto;

import java.util.List;
import java.util.UUID;

public record UserProfileResponseDTO(
        UUID id,
        String dni,
        String name,
        String phone,
        String email,
        int age,
        String address,
        String baseFare,
        List<String> roles
) {}
