package com.tranki.backend.agent.adapter.in.web.dto;

public record AgentRegisterRequestDTO(
        String name,
        String email,
        String phone,
        String businessName,
        String businessAddress,
        boolean acceptedTerms
) {}
