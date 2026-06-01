package com.smartsplit.backend.security;

import com.smartsplit.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

// UserDetailsService is a Spring Security interface with ONE method:
// loadUserByUsername(String username)
// Spring Security calls this automatically during authentication.
// "Username" in our app = email address.
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        // Spring Security calls this method with the email the user typed.
        // We go to database and fetch the User object.
        // If not found, throw UsernameNotFoundException —
        // Spring Security catches this and returns 401 automatically.
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found with email: " + email
                        )
                );
    }
}
