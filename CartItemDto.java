package com.flipkartclone.dto;

import com.flipkartclone.entity.CartItem;
import com.flipkartclone.entity.Product;

public record CartItemDto(Long id, Product product, Integer quantity) {
    public static CartItemDto from(CartItem c) {
        return new CartItemDto(c.getId(), c.getProduct(), c.getQuantity());
    }
}
