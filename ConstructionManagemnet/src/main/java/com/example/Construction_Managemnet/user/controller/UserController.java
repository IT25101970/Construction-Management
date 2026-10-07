package com.example.Construction_Managemnet.user.controller;

import com.example.Construction_Managemnet.user.model.UserAccount;
import com.example.Construction_Managemnet.user.service.UserAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserAccountService userService;

    @GetMapping
    public ResponseEntity<List<UserAccount>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserAccount> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    public ResponseEntity<UserAccount> createUser(@jakarta.validation.Valid @RequestBody UserAccount user) {
        return new ResponseEntity<>(userService.createUser(user), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserAccount> updateUser(@PathVariable Long id, @jakarta.validation.Valid @RequestBody UserAccount user) {
        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    @PostMapping("/{id}/toggle-status")
    public ResponseEntity<UserAccount> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleStatus(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User account removed successfully", "id", id.toString()));
    }
}
