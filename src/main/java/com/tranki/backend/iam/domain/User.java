package com.tranki.backend.iam.domain;

import com.tranki.backend.account.domain.FareCategory;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public class User {
    private final UUID id;
    private Dni dni;
    private String name;
    private String phone;
    private Email email;
    private int age;
    private String address;
    private FareCategory baseFare;
    private PasswordHash passwordHash;
    private List<Role> roles;

    public User(UUID id, Dni dni, String name, String phone, Email email, int age, String address, FareCategory baseFare, PasswordHash passwordHash, List<Role> roles) {
        this.id = id != null ? id : UUID.randomUUID();
        this.dni = dni;
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.age = age;
        this.address = address;
        this.baseFare = baseFare;
        this.passwordHash = passwordHash;
        this.roles = roles != null ? new ArrayList<>(roles) : new ArrayList<>();
    }

    public static User registerNewUser(Dni dni, String name, String phone, Email email, int age, String address, FareCategory baseFare, PasswordHash passwordHash) {
        return new User(UUID.randomUUID(), dni, name, phone, email, age, address, baseFare, passwordHash, List.of(Role.USUARIO_FINAL));
    }

    public UUID getId() {
        return id;
    }

    public Dni getDni() {
        return dni;
    }

    public String getName() {
        return name;
    }

    public String getPhone() {
        return phone;
    }

    public Email getEmail() {
        return email;
    }

    public int getAge() {
        return age;
    }

    public String getAddress() {
        return address;
    }

    public FareCategory getBaseFare() {
        return baseFare;
    }

    public PasswordHash getPasswordHash() {
        return passwordHash;
    }

    public List<Role> getRoles() {
        return Collections.unmodifiableList(roles);
    }
    
    public void addRole(Role role) {
        if (!this.roles.contains(role)) {
            this.roles.add(role);
        }
    }
}
