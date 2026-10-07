package com.example.Construction_Managemnet.user.model;

import com.example.Construction_Managemnet.common.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "user_accounts")
public class UserAccount extends BaseEntity {

    @Column(nullable = false, unique = true)
    @jakarta.validation.constraints.NotBlank
    private String username;

    @Column(name = "full_name", nullable = false)
    @jakarta.validation.constraints.NotBlank
    private String fullName;

    @Column(nullable = false)
    @jakarta.validation.constraints.NotBlank
    @jakarta.validation.constraints.Email
    private String email;

    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Column(nullable = false)
    private String role; // ADMIN, PM, SUPERVISOR, CLIENT

    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, INACTIVE

    @Column(name = "last_login")
    private String lastLogin;
}
