package com.tranki.backend.iam.adapter.in.web;

import com.tranki.backend.iam.adapter.in.web.dto.AuthResponseDTO;
import com.tranki.backend.iam.adapter.in.web.dto.LoginRequestDTO;
import com.tranki.backend.iam.adapter.in.web.dto.RegisterRequestDTO;
import com.tranki.backend.iam.adapter.in.web.dto.UpdateProfileRequestDTO;
import com.tranki.backend.iam.adapter.in.web.dto.UserProfileResponseDTO;
import com.tranki.backend.iam.application.AuthUseCase;
import com.tranki.backend.iam.domain.User;
import com.tranki.backend.iam.infrastructure.security.AuthenticatedUserResolver;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthUseCase authUseCase;
    private final AuthenticatedUserResolver authenticatedUserResolver;

    public AuthController(AuthUseCase authUseCase, AuthenticatedUserResolver authenticatedUserResolver) {
        this.authUseCase = authUseCase;
        this.authenticatedUserResolver = authenticatedUserResolver;
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(@Valid @RequestBody RegisterRequestDTO request) {
        authUseCase.registerUser(request);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        String token = authUseCase.login(request);
        return ResponseEntity.ok(new AuthResponseDTO(token));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponseDTO> getCurrentUser() {
        User currentUser = authenticatedUserResolver.requireAuthenticatedUser();
        return ResponseEntity.ok(authUseCase.getProfileByDni(currentUser.getDni().getValue()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponseDTO> updateCurrentUser(@RequestBody UpdateProfileRequestDTO request) {
        User currentUser = authenticatedUserResolver.requireAuthenticatedUser();
        return ResponseEntity.ok(authUseCase.updateProfileByDni(currentUser.getDni().getValue(), request));
    }
}
