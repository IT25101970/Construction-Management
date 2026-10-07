package com.example.Construction_Managemnet.user.service;

import com.example.Construction_Managemnet.user.repository.UserAccountRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/** Re-check account state so disabling or changing a role affects existing sessions. */
@RequiredArgsConstructor
public class AccountAccessFilter extends OncePerRequestFilter {
    private final UserAccountRepository users;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (request.getRequestURI().startsWith("/api/") && authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {
            var user = users.findByUsernameAndIsDeletedFalse(authentication.getName());
            if (user.isEmpty() || !"ACTIVE".equals(user.get().getStatus()) || authentication.getAuthorities().stream()
                    .noneMatch(a -> a.getAuthority().equals("ROLE_" + user.get().getRole()))) {
                var session = request.getSession(false);
                if (session != null) session.invalidate();
                SecurityContextHolder.clearContext();
                response.setStatus(401);
                response.setContentType("application/json");
                response.getWriter().write("{\"message\":\"Account access changed. Please sign in again\"}");
                return;
            }
        }
        chain.doFilter(request, response);
    }
}
