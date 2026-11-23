package com.flipkartclone.controller;

import com.flipkartclone.dto.CartItemDto;
import com.flipkartclone.dto.CartRequest;
import com.flipkartclone.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public List<CartItemDto> get(Authentication auth) {
        return cartService.getCart(auth.getName());
    }

    @PostMapping
    public List<CartItemDto> add(Authentication auth, @Valid @RequestBody CartRequest req) {
        return cartService.add(auth.getName(), req.productId(), req.quantity());
    }

    @PutMapping("/{itemId}")
    public List<CartItemDto> update(Authentication auth, @PathVariable Long itemId, @RequestParam int quantity) {
        return cartService.updateQuantity(auth.getName(), itemId, quantity);
    }

    @DeleteMapping("/{itemId}")
    public List<CartItemDto> remove(Authentication auth, @PathVariable Long itemId) {
        return cartService.remove(auth.getName(), itemId);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clear(Authentication auth) {
        cartService.clear(auth.getName());
    }
}
