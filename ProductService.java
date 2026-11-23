package com.flipkartclone.service;

import com.flipkartclone.dto.ProductRequest;
import com.flipkartclone.entity.Category;
import com.flipkartclone.entity.Product;
import com.flipkartclone.exception.ApiException;
import com.flipkartclone.repository.CategoryRepository;
import com.flipkartclone.repository.ProductRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public Page<Product> search(String q, Long categoryId, Double minRating,
                                java.math.BigDecimal maxPrice, String sort, int page, int size) {
        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (q != null && !q.isBlank()) {
                String like = "%" + q.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), like),
                        cb.like(cb.lower(root.get("brand")), like),
                        cb.like(cb.lower(root.get("category").get("name")), like)));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (minRating != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("rating"), minRating));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Sort order = switch (sort == null ? "" : sort) {
            case "price_asc" -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            case "rating" -> Sort.by("rating").descending();
            case "newest" -> Sort.by("createdAt").descending();
            default -> Sort.by("ratingCount").descending();
        };
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 60), order);
        return productRepository.findAll(spec, pageable);
    }

    public Product get(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    public List<Category> categories() {
        return categoryRepository.findAll();
    }

    public Product create(ProductRequest req) {
        Product p = new Product();
        apply(p, req);
        return productRepository.save(p);
    }

    public Product update(Long id, ProductRequest req) {
        Product p = get(id);
        apply(p, req);
        return productRepository.save(p);
    }

    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Product not found");
        }
        try {
            productRepository.deleteById(id);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new ApiException(HttpStatus.CONFLICT, "Product is in a cart and cannot be deleted right now");
        }
    }

    private void apply(Product p, ProductRequest req) {
        Category c = categoryRepository.findById(req.categoryId())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Category not found"));
        if (req.price().compareTo(req.mrp()) > 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Price cannot be higher than MRP");
        }
        p.setName(req.name().trim());
        p.setBrand(req.brand());
        p.setDescription(req.description());
        p.setPrice(req.price());
        p.setMrp(req.mrp());
        p.setImageUrl(req.imageUrl());
        p.setStock(req.stock());
        p.setCategory(c);
    }
}
