package com.flipkartclone.controller;

import com.flipkartclone.dto.CheckoutRequest;
import com.flipkartclone.dto.OrderDto;
import com.flipkartclone.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderDto place(Authentication auth, @Valid @RequestBody CheckoutRequest req) {
        return orderService.placeOrder(auth.getName(), req);
    }

    @GetMapping
    public List<OrderDto> mine(Authentication auth) {
        return orderService.myOrders(auth.getName());
    }

    @GetMapping("/{id}")
    public OrderDto get(Authentication auth, @PathVariable Long id) {
        return orderService.get(auth.getName(), id);
    }

    @PutMapping("/{id}/cancel")
    public OrderDto cancel(Authentication auth, @PathVariable Long id) {
        return orderService.cancel(auth.getName(), id);
    }
}
