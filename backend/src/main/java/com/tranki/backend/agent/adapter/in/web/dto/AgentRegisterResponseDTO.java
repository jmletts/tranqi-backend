package com.tranki.backend.agent.adapter.in.web.dto;

import com.tranki.backend.iam.adapter.in.web.dto.UserProfileResponseDTO;

public record AgentRegisterResponseDTO(
        String token,
        UserProfileResponseDTO user,
        AgentProfileDTO agentProfile
) {}
