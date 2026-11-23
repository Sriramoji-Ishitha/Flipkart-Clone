package com.flipkartclone.service;

import com.flipkartclone.dto.CartItemDto;
import com.flipkartclone.entity.CartItem;
import com.flipkartclone.entity.Product;
import com.flipkartclone.entity.User;
import com.flipkartclone.exception.ApiException;
import com.flipkartclone.repository.CartItemRepository;
import com.flipkartclone.repository.ProductRepository;
import com.flipkartclone.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CartService {

    private static final int MAX_PER_ITEM = 10;

    private final CartItemRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartItemRepository cartRepository, ProductRepository productRepository,
                       UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    private User user(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Please log in again"));
    }

    @Transactional(readOnly = true)
    public List<CartItemDto> getCart(String email) {
        return cartRepository.findByUserIdOrderByIdAsc(user(email).getId())
                .stream().map(CartItemDto::from).toList();
    }

    @Transactional
    public List<CartItemDto> add(String email, Long productId, int quantity) {
        User u = user(email);
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
        CartItem item = cartRepository.findByUserIdAndProductId(u.getId(), productId)
                .orElseGet(() -> new CartItem(u, p, 0));
        item.setQuantity(clamp(item.getQuantity() + quantity, p));
        cartRepository.save(item);
        return getCart(email);
    }

    @Transactional
    public List<CartItemDto> updateQuantity(String email, Long itemId, int quantity) {
        User u = user(email);
        CartItem item = cartRepository.findByIdAndUserId(itemId, u.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Cart item not found"));
        if (quantity <= 0) {
            cartRepository.delete(item);
        } else {
            item.setQuantity(clamp(quantity, item.getProduct()));
            cartRepository.save(item);
        }
        return getCart(email);
    }

    @Transactional
    public List<CartItemDto> remove(String email, Long itemId) {
        User u = user(email);
        CartItem item = cartRepository.findByIdAndUserId(itemId, u.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Cart item not found"));
        cartRepository.delete(item);
        return getCart(email);
    }

    @Transactional
    public void clear(String email) {
        cartRepository.deleteByUserId(user(email).getId());
    }

    private int clamp(int quantity, Product p) {
        if (p.getStock() <= 0) {
            throw new ApiException(HttpStatus.CONFLICT, p.getName() + " is out of stock");
        }
        return Math.min(quantity, Math.min(p.getStock(), MAX_PER_ITEM));
    }
}
