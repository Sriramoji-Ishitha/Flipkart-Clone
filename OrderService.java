package com.flipkartclone.service;

import com.flipkartclone.dto.CheckoutRequest;
import com.flipkartclone.dto.OrderDto;
import com.flipkartclone.entity.*;
import com.flipkartclone.exception.ApiException;
import com.flipkartclone.repository.CartItemRepository;
import com.flipkartclone.repository.OrderRepository;
import com.flipkartclone.repository.ProductRepository;
import com.flipkartclone.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository, CartItemRepository cartRepository,
                        ProductRepository productRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    private User user(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Please log in again"));
    }

    @Transactional
    public OrderDto placeOrder(String email, CheckoutRequest req) {
        User u = user(email);
        List<CartItem> cart = cartRepository.findByUserIdOrderByIdAsc(u.getId());
        if (cart.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Your cart is empty");
        }

        Order order = new Order();
        order.setUser(u);
        order.setShippingAddress(req.shippingAddress().trim());
        order.setPaymentMethod(req.paymentMethod());
        order.setStatus(OrderStatus.PLACED);

        BigDecimal total = BigDecimal.ZERO;
        for (CartItem ci : cart) {
            Product p = ci.getProduct();
            if (p.getStock() < ci.getQuantity()) {
                throw new ApiException(HttpStatus.CONFLICT,
                        "Only " + p.getStock() + " left of " + p.getName() + ". Update your cart and try again.");
            }
            p.setStock(p.getStock() - ci.getQuantity());
            productRepository.save(p);
            order.addItem(new OrderItem(p.getId(), p.getName(), p.getImageUrl(), p.getPrice(), ci.getQuantity()));
            total = total.add(p.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity())));
        }
        order.setTotalAmount(total);

        Order saved = orderRepository.save(order);
        cartRepository.deleteAll(cart);
        return OrderDto.from(saved);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> myOrders(String email) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user(email).getId())
                .stream().map(OrderDto::from).toList();
    }

    @Transactional(readOnly = true)
    public OrderDto get(String email, Long id) {
        return orderRepository.findByIdAndUserId(id, user(email).getId())
                .map(OrderDto::from)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    @Transactional
    public OrderDto cancel(String email, Long id) {
        Order o = orderRepository.findByIdAndUserId(id, user(email).getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
        if (o.getStatus() != OrderStatus.PLACED && o.getStatus() != OrderStatus.CONFIRMED) {
            throw new ApiException(HttpStatus.CONFLICT, "This order can no longer be cancelled");
        }
        for (OrderItem i : o.getItems()) {
            productRepository.findById(i.getProductId()).ifPresent(p -> {
                p.setStock(p.getStock() + i.getQuantity());
                productRepository.save(p);
            });
        }
        o.setStatus(OrderStatus.CANCELLED);
        return OrderDto.from(orderRepository.save(o));
    }
}
