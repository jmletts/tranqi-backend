package com.tranki.backend.iam.application;

import com.tranki.backend.iam.adapter.in.web.dto.LoginRequestDTO;
import com.tranki.backend.iam.adapter.in.web.dto.RegisterRequestDTO;

public interface AuthUseCase {
    void registerUser(RegisterRequestDTO request);
    String login(LoginRequestDTO request);
}
