package com.tranki.backend.iam.application;

import com.tranki.backend.iam.adapter.in.web.dto.LoginRequestDTO;
import com.tranki.backend.iam.adapter.in.web.dto.RegisterRequestDTO;
import com.tranki.backend.iam.adapter.in.web.dto.UpdateProfileRequestDTO;
import com.tranki.backend.iam.adapter.in.web.dto.UserProfileResponseDTO;

public interface AuthUseCase {
    void registerUser(RegisterRequestDTO request);
    String login(LoginRequestDTO request);
    UserProfileResponseDTO getProfileByDni(String dni);
    UserProfileResponseDTO updateProfileByDni(String dni, UpdateProfileRequestDTO request);
}
