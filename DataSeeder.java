package com.flipkartclone.config;

import com.flipkartclone.entity.*;
import com.flipkartclone.repository.CategoryRepository;
import com.flipkartclone.repository.ProductRepository;
import com.flipkartclone.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/** Seeds demo data the first time the app starts against an empty database. */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, CategoryRepository categoryRepository,
                      ProductRepository productRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@flipkart.com")) {
            userRepository.save(new User("Admin", "admin@flipkart.com",
                    passwordEncoder.encode("Admin@123"), "9999999999", Role.ADMIN));
            userRepository.save(new User("Demo User", "demo@flipkart.com",
                    passwordEncoder.encode("Demo@123"), "8888888888", Role.USER));
            log.info("Seeded users: admin@flipkart.com / Admin@123 and demo@flipkart.com / Demo@123");
        }

        if (productRepository.count() > 0) {
            return;
        }

        Map<String, Category> cats = new HashMap<>();
        for (String name : new String[]{"Mobiles", "Laptops", "Electronics", "Fashion", "Home", "Appliances", "Books", "Toys"}) {
            cats.put(name, categoryRepository.save(new Category(name, null)));
        }

        seed(cats.get("Mobiles"), "Nova X5 5G (Midnight Black, 128 GB)", "Nova", 18999, 24999, 4.4, 18230, 40,
                "6.67-inch AMOLED display, 50 MP triple camera, 5000 mAh battery with 67W fast charging and 5G support.");
        seed(cats.get("Mobiles"), "Pixelon 8 Pro (Ocean Blue, 256 GB)", "Pixelon", 54999, 69999, 4.6, 9210, 25,
                "Flagship processor, 120 Hz LTPO display, 50 MP main camera with OIS, 5 years of updates.");
        seed(cats.get("Mobiles"), "Zest Lite 4G (Mint Green, 64 GB)", "Zest", 8499, 10999, 4.1, 32100, 80,
                "Everyday smartphone with a 6.5-inch HD+ screen, 13 MP camera and a two-day battery.");
        seed(cats.get("Laptops"), "AeroBook 14 Intel Core i5 12th Gen (16 GB/512 GB SSD)", "AeroBook", 52990, 74990, 4.3, 5120, 18,
                "Thin and light 14-inch FHD laptop, backlit keyboard, 12-hour battery, Windows 11.");
        seed(cats.get("Laptops"), "Titan G15 Gaming Laptop Ryzen 7 (16 GB/1 TB, RTX 4050)", "Titan", 84990, 109990, 4.5, 2310, 10,
                "15.6-inch 144 Hz display, RTX 4050 graphics and RGB keyboard for competitive gaming.");
        seed(cats.get("Electronics"), "BoomBuds Pro Wireless Earbuds with ANC", "BoomBuds", 1999, 4999, 4.2, 120450, 150,
                "Active noise cancellation, 36-hour total playback, IPX5 sweat resistance and low-latency mode.");
        seed(cats.get("Electronics"), "SoundWave 20W Bluetooth Speaker", "SoundWave", 1499, 2999, 4.3, 45110, 90,
                "Deep bass, 12-hour playtime, waterproof body and a built-in microphone for calls.");
        seed(cats.get("Electronics"), "FitBand 7 Smart Watch (AMOLED, SpO2)", "FitBand", 2499, 5999, 4.0, 67780, 60,
                "1.78-inch AMOLED display, heart-rate and SpO2 tracking, 100+ sports modes.");
        seed(cats.get("Fashion"), "Men Slim Fit Cotton Casual Shirt", "UrbanLine", 549, 1499, 4.1, 88200, 200,
                "Breathable pure-cotton casual shirt with a slim fit and a button-down collar.");
        seed(cats.get("Fashion"), "Women Floral Print Anarkali Kurta", "Ethnica", 699, 1999, 4.2, 40120, 120,
                "Flowy floral anarkali kurta in soft rayon, perfect for festive and daily wear.");
        seed(cats.get("Fashion"), "Unisex Running Shoes (Grey/Orange)", "StrideX", 999, 2999, 4.0, 150340, 140,
                "Lightweight mesh upper with cushioned sole and slip-resistant outsole.");
        seed(cats.get("Home"), "Cotton Double Bedsheet with 2 Pillow Covers", "HomeNest", 449, 1299, 4.2, 98650, 250,
                "144 TC pure cotton bedsheet, 90 x 100 inches, fade-resistant prints.");
        seed(cats.get("Appliances"), "Aqua Pure 7L RO + UV Water Purifier", "AquaPure", 8999, 17999, 4.3, 21870, 30,
                "7-stage purification with RO, UV and TDS controller for hard water.");
        seed(cats.get("Appliances"), "CoolMax 1.5 Ton 5 Star Inverter Split AC", "CoolMax", 34990, 52990, 4.4, 8760, 12,
                "Copper condenser, anti-dust filter, convertible 4-in-1 cooling and turbo mode.");
        seed(cats.get("Books"), "The Compound Habit - Bestselling Self-Help Paperback", "Page Turner", 249, 499, 4.5, 56220, 300,
                "A practical guide to building small habits that deliver big results over time.");
        seed(cats.get("Toys"), "Mega Blocks Creative Building Set (500 pcs)", "BrickJoy", 799, 1999, 4.4, 15330, 75,
                "500 colourful interlocking blocks that build creativity and motor skills. Ages 5+.");

        log.info("Seeded {} products", productRepository.count());
    }

    private void seed(Category c, String name, String brand, int price, int mrp, double rating,
                      int ratingCount, int stock, String description) {
        Product p = new Product();
        p.setName(name);
        p.setBrand(brand);
        p.setDescription(description);
        p.setPrice(BigDecimal.valueOf(price));
        p.setMrp(BigDecimal.valueOf(mrp));
        p.setRating(rating);
        p.setRatingCount(ratingCount);
        p.setStock(stock);
        p.setCategory(c);
        p.setImageUrl("https://picsum.photos/seed/" + brand.toLowerCase().replace(" ", "") + price + "/600/600");
        productRepository.save(p);
    }
}
