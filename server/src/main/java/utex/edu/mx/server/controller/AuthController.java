package utex.edu.mx.server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import utex.edu.mx.server.dto.*;
import utex.edu.mx.server.model.User;
import utex.edu.mx.server.security.CustomUserDetailsService;
import utex.edu.mx.server.security.JwtUtil;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private CustomUserDetailsService userDetailsService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest request) {
        try {
            // Authenticate user
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            
            // Load user details
            final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
            final User user = userDetailsService.getUserByUsername(request.getUsername());
            
            // Generate JWT token
            final String jwt = jwtUtil.generateToken(userDetails, user.getRole().name());
            
            // Create UserDTO
            UserDTO userDTO = new UserDTO(
                    user.getId(),
                    user.getUsername(),
                    user.getName(),
                    user.getEmail(),
                    user.getPhone(),
                    user.getRole().name().toLowerCase()
            );
            
            // Create response
            LoginResponse loginResponse = new LoginResponse(userDTO, jwt);
            
            return ResponseEntity.ok(ApiResponse.success(loginResponse, "Login successful"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid credentials"));
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        // JWT logout is handled client-side by removing the token
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }
    
    @GetMapping("/verify")
    public ResponseEntity<ApiResponse<UserDTO>> verify() {
        // This endpoint is protected, if we reach here, token is valid
        return ResponseEntity.ok(ApiResponse.success(null, "Token is valid"));
    }
}
