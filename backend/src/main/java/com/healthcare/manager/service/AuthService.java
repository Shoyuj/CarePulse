package com.healthcare.manager.service;

import com.healthcare.manager.config.JwtTokenProvider;
import com.healthcare.manager.dto.AuthResponse;
import com.healthcare.manager.dto.LoginRequest;
import com.healthcare.manager.dto.RegisterRequest;
import com.healthcare.manager.dto.UserDto;
import com.healthcare.manager.entity.DoctorProfile;
import com.healthcare.manager.entity.Role;
import com.healthcare.manager.entity.User;
import com.healthcare.manager.repository.DoctorProfileRepository;
import com.healthcare.manager.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository,
                       DoctorProfileRepository doctorProfileRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.doctorProfileRepository = doctorProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered: " + request.getEmail());
        }

        Role role = request.getRole() != null ? request.getRole() : Role.PATIENT;
        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName(),
                request.getPhone(),
                role
        );
        user = userRepository.save(user);

        UUID doctorProfileId = null;
        if (role == Role.DOCTOR) {
            DoctorProfile profile = new DoctorProfile();
            profile.setUser(user);
            profile.setSpecialization("General Physician");
            profile = doctorProfileRepository.save(profile);
            doctorProfileId = profile.getId();
        }

        String token = jwtTokenProvider.generateToken(user, doctorProfileId);
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getFullName(), user.getRole(), doctorProfileId);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        UUID doctorProfileId = null;
        if (user.getRole() == Role.DOCTOR) {
            Optional<DoctorProfile> profile = doctorProfileRepository.findByUserId(user.getId());
            if (profile.isPresent()) {
                doctorProfileId = profile.get().getId();
            }
        }

        String token = jwtTokenProvider.generateToken(user, doctorProfileId);
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getFullName(), user.getRole(), doctorProfileId);
    }

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new IllegalStateException("No authenticated user found");
        }
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found: " + email));
    }

    public UserDto getCurrentUserDto() {
        return UserDto.fromEntity(getCurrentUser());
    }
}
