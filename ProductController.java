package com.flipkartclone.controller;

import com.flipkartclone.dto.ProductRequest;
import com.flipkartclone.entity.Category;
import com.flipkartclone.entity.Product;
import com.flipkartclone.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/products")
    public Map<String, Object> list(@RequestParam(required = false) String q,
                                    @RequestParam(required = false) Long categoryId,
                                    @RequestParam(required = false) Double minRating,
                                    @RequestParam(required = false) BigDecimal maxPrice,
                                    @RequestParam(required = false) String sort,
                                    @RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "12") int size) {
        Page<Product> result = productService.search(q, categoryId, minRating, maxPrice, sort, page, size);
        return Map.of(
                "items", result.getContent(),
                "page", result.getNumber(),
                "totalPages", result.getTotalPages(),
                "totalItems", result.getTotalElements());
    }

    @GetMapping("/products/{id}")
    public Product get(@PathVariable Long id) {
        return productService.get(id);
    }

    @GetMapping("/categories")
    public List<Category> categories() {
        return productService.categories();
    }

    // ---- admin ----
    @PostMapping("/admin/products")
    @ResponseStatus(HttpStatus.CREATED)
    public Product create(@Valid @RequestBody ProductRequest req) {
        return productService.create(req);
    }

    @PutMapping("/admin/products/{id}")
    public Product update(@PathVariable Long id, @Valid @RequestBody ProductRequest req) {
        return productService.update(id, req);
    }

    @DeleteMapping("/admin/products/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        productService.delete(id);
    }
}
