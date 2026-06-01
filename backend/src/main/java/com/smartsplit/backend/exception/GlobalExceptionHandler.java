package com.smartsplit.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

// @RestControllerAdvice = watches ALL controllers globally.
// Any exception thrown anywhere in your app —
// this class catches it and returns a clean JSON response.
// Without this, Spring returns an ugly HTML error page
// or a confusing 500 with a stack trace exposed to the client.
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Catches: throw new RuntimeException("Email already registered")
    // Returns: HTTP 409 Conflict with a clean JSON body
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(
            RuntimeException ex) {

        Map<String, Object> error = new HashMap<>();
        error.put("status", 409);
        error.put("error", "Conflict");
        error.put("message", ex.getMessage());
        error.put("timestamp", LocalDateTime.now().toString());

        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    // Catches: @Valid validation failures (@NotBlank, @Email, @Size)
    // Returns: HTTP 400 Bad Request with field-by-field error messages
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(
            MethodArgumentNotValidException ex) {

        // Collect all field errors into a map: fieldName → errorMessage
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        Map<String, Object> error = new HashMap<>();
        error.put("status", 400);
        error.put("error", "Validation Failed");
        error.put("errors", fieldErrors);
        error.put("timestamp", LocalDateTime.now().toString());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
