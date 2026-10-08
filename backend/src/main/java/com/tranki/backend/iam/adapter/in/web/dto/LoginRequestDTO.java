package com.tranki.backend.iam.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class LoginRequestDTO {
    @NotBlank
    @Pattern(regexp = "\\d{8,10}", message = "DNI must be 8-10 digits")
    private String dni;

    @NotBlank
    private String password;

    // Getters and Setters
    public String getDni() { return dni; }
    public void setDni(String dni) { this.dni = dni; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
