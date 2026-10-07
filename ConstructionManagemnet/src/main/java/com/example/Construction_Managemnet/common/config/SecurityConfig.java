package com.example.Construction_Managemnet.common.config;

import com.example.Construction_Managemnet.user.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {
    private final UserAccountRepository users;

    @Bean
    PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    UserDetailsService userDetailsService() {
        return username -> {
            var account = users.findByUsernameAndIsDeletedFalse(username)
                    .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));
            return User.withUsername(account.getUsername())
                    .password(account.getPassword() == null ? "" : account.getPassword())
                    .roles(account.getRole())
                    .disabled(!"ACTIVE".equals(account.getStatus()))
                    .build();
        };
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http.addFilterAfter(new com.example.Construction_Managemnet.user.service.AccountAccessFilter(users),
                        org.springframework.security.web.context.SecurityContextHolderFilter.class)
                .cors(cors -> {})
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/csrf", "/api/auth/login", "/api/auth/session").permitAll()
                        .requestMatchers("/api/users/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/projects", "/api/projects/*").hasAnyRole("ADMIN", "PM", "SUPERVISOR", "CLIENT")
                        .requestMatchers(HttpMethod.GET, "/api/**").hasAnyRole("ADMIN", "PM", "SUPERVISOR")
                        .requestMatchers("/api/auth/logout").authenticated()
                        .requestMatchers("/api/expenses/**", "/api/projects/**").hasAnyRole("ADMIN", "PM")
                        .requestMatchers("/api/**").hasAnyRole("ADMIN", "PM", "SUPERVISOR")
                        .anyRequest().permitAll())
                .exceptionHandling(errors -> errors
                        .authenticationEntryPoint((req, res, ex) -> {
                            res.setStatus(401);
                            res.setContentType("application/json");
                            res.getWriter().write("{\"message\":\"Please sign in\"}");
                        })
                        .accessDeniedHandler((req, res, ex) -> {
                            res.setStatus(403);
                            res.setContentType("application/json");
                            res.getWriter().write("{\"message\":\"Access denied or session token expired\"}");
                        }))
                .requestCache(cache -> cache.disable())
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .logout(logout -> logout.disable())
                .build();
    }
}
