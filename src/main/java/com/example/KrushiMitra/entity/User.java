package com.example.KrushiMitra.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phone;
    private String state;
    private String district;
    private String village;
    private Double landSizeAcres;
    private String primaryCrop;
    private String category;
    private Double annualIncome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.FARMER;

    @Column(nullable = false)
    private String preferredLanguage = "en";

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;   // ✅ remove inline = LocalDateTime.now()

    private LocalDateTime updatedAt;

    @PrePersist                        // ✅ runs automatically before every INSERT
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.preferredLanguage == null) {
            this.preferredLanguage = "en";
        }
        if (this.role == null) {
            this.role = Role.FARMER;
        }
    }

    @PreUpdate                         // ✅ runs automatically before every UPDATE
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum Role {
        FARMER, ADMIN
    }
}