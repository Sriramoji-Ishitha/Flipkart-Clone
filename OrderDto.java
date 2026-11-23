package com.flipkartclone.dto;

import com.flipkartclone.entity.Order;
import com.flipkartclone.entity.OrderItem;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderDto(Long id, BigDecimal totalAmount, String status, String shippingAddress,
                       String paymentMethod, LocalDateTime createdAt, List<Item> items) {

    public record Item(Long productId, String productName, String imageUrl, BigDecimal price, Integer quantity) {
        static Item from(OrderItem i) {
            return new Item(i.getProductId(), i.getProductName(), i.getImageUrl(), i.getPrice(), i.getQuantity());
        }
    }

    public static OrderDto from(Order o) {
        return new OrderDto(o.getId(), o.getTotalAmount(), o.getStatus().name(), o.getShippingAddress(),
                o.getPaymentMethod(), o.getCreatedAt(),
                o.getItems().stream().map(Item::from).toList());
    }
}
