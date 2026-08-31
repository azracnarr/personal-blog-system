package com.example.blog.health;

import java.time.Instant;

public record HealthResponse(String status, Instant checkedAt) {
}
