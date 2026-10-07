package com.example.Construction_Managemnet.user.controller;

import com.example.Construction_Managemnet.user.model.UserAccount;
import com.example.Construction_Managemnet.user.repository.UserAccountRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final UserAccountRepository users;
    private final HttpSessionSecurityContextRepository contexts = new HttpSessionSecurityContextRepository();

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {}

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of("token", token.getToken(), "headerName", token.getHeaderName());
    }

    @PostMapping("/login")
    public UserAccount login(@Valid @RequestBody LoginRequest login, HttpServletRequest request,
                             HttpServletResponse response) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(login.username(), login.password()));
            request.getSession(true);
            request.changeSessionId();
            var context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            contexts.saveContext(context, request, response);
            UserAccount account = users.findByUsernameAndIsDeletedFalse(authentication.getName()).orElseThrow();
            account.setLastLogin(LocalDate.now().toString());
            return users.save(account);
        } catch (AuthenticationException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials or inactive account");
        }
    }

    @GetMapping("/session")
    public UserAccount session(Authentication authentication) {
        if (authentication == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please sign in");
        return users.findByUsernameAndIsDeletedFalse(authentication.getName())
                .filter(user -> "ACTIVE".equals(user.getStatus()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account unavailable"));
    }

    @PostMapping("/logout")
    public Map<String, String> logout(HttpServletRequest request) {
        var session = request.getSession(false);
        if (session != null) session.invalidate();
        SecurityContextHolder.clearContext();
        return Map.of("message", "Signed out");
    }
}
