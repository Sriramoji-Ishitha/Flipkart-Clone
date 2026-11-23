package com.flipkartclone.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CheckoutRequest(
        @NotBlank @Size(min = 10, max = 500, message = "enter a complete address") String shippingAddress,
        @NotBlank @Pattern(regexp = "COD|UPI|CARD", message = "must be COD, UPI or CARD") String paymentMethod) {
}
