package com.tranki.backend.iam.adapter.in.web.dto;

import com.tranki.backend.account.domain.FareCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class RegisterRequestDTO {
    @NotBlank
    @Pattern(regexp = "\\d{8,10}", message = "DNI must be 8-10 digits")
    private String dni;
    
    @NotBlank
    private String name;
    
    @NotBlank
    private String phone;
    
    @NotBlank
    @Pattern(regexp = "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$", message = "Invalid email")
    private String email;
    
    @NotNull
    private Integer age;
    
    @NotBlank
    private String address;
    
    @NotNull
    private FareCategory baseFare;
    
    @NotBlank
    private String password;

    // Getters and Setters
    public String getDni() { return dni; }
    public void setDni(String dni) { this.dni = dni; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    
    public FareCategory getBaseFare() { return baseFare; }
    public void setBaseFare(FareCategory baseFare) { this.baseFare = baseFare; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
