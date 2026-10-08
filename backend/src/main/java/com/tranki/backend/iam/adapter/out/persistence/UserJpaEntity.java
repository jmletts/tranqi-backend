package com.tranki.backend.iam.adapter.out.persistence;

import com.tranki.backend.account.domain.FareCategory;
import com.tranki.backend.iam.domain.Role;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users")
public class UserJpaEntity {

    @Id
    private UUID id;

    @Column(unique = true, nullable = false)
    private String dni;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private int age;

    @Column(nullable = false)
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FareCategory baseFare;

    @Column(nullable = false)
    private String passwordHash;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private List<Role> roles;

    public UserJpaEntity() {
    }

    public UserJpaEntity(UUID id, String dni, String name, String phone, String email, int age, String address, FareCategory baseFare, String passwordHash, List<Role> roles) {
        this.id = id;
        this.dni = dni;
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.age = age;
        this.address = address;
        this.baseFare = baseFare;
        this.passwordHash = passwordHash;
        this.roles = roles;
    }

    public UUID getId() { return id; }
    public String getDni() { return dni; }
    public String getName() { return name; }
    public String getPhone() { return phone; }
    public String getEmail() { return email; }
    public int getAge() { return age; }
    public String getAddress() { return address; }
    public FareCategory getBaseFare() { return baseFare; }
    public String getPasswordHash() { return passwordHash; }
    public List<Role> getRoles() { return roles; }
}
