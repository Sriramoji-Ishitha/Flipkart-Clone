package com.flipkartclone.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 100) String brand,
        @Size(max = 3000) String description,
        @NotNull @DecimalMin("0.01") BigDecimal price,
        @NotNull @DecimalMin("0.01") BigDecimal mrp,
        @Size(max = 500) String imageUrl,
        @NotNull @Min(0) Integer stock,
        @NotNull Long categoryId) {
}
