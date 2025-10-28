package uz.rms.modules.v1.product.model

import com.fasterxml.jackson.annotation.*
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.persistence.*
import org.hibernate.annotations.Fetch
import org.hibernate.annotations.FetchMode
import uz.rms.common.BaseEntity
import uz.rms.modules.v1.units.model.Units

import java.math.BigDecimal

/**
 * Represents a product in the inventory.
 *
 * @property sku Stock Keeping Unit (unique product identifier)
 * @property name Product name
 * @property description Optional product description
 * @property price Selling price of the product
 * @property costPrice Cost price of the product
 * @property quantityInStock Quantity available in stock
 * @property barcode Barcode of the product (EAN, UPC, etc.)
 * @property category Category this product belongs to
 * @property units Unit of measurement for the product
 * @property active Whether the product is active and available for sale
 */
@Entity
@Table(
    name = "products",
    indexes = [
        Index(name = "idx_product_sku", columnList = "sku", unique = true),
        Index(name = "idx_product_name", columnList = "name"),
        Index(name = "idx_product_barcode", columnList = "barcode")
    ]
)
@Schema(description = "Product information")
class Product : BaseEntity() {
    @Column(nullable = false, unique = true, length = 100)
    @Schema(description = "Stock Keeping Unit (unique product identifier)", example = "PROD-001", required = true)
    var sku: String = ""
        protected set

    @Column(nullable = false, length = 255)
    @Schema(description = "Product name", example = "Wireless Mouse", required = true)
    var name: String = ""

    @Column(length = 1000)
    @Schema(description = "Product description", example = "Ergonomic wireless mouse with 2.4GHz connection")
    var description: String? = null

    @Column(nullable = false, precision = 10, scale = 2)
    @Schema(description = "Selling price of the product", example = "29.99", required = true)
    var price: BigDecimal = BigDecimal.ZERO

    @Column(name = "cost_price", nullable = false, precision = 10, scale = 2)
    @Schema(description = "Cost price of the product", example = "15.50", required = true)
    var costPrice: BigDecimal = BigDecimal.ZERO

    @Column(name = "quantity_in_stock", nullable = false)
    @Schema(description = "Quantity available in stock", example = "100", required = true)
    var quantityInStock: Int = 0

    @Column(length = 100, unique = true)
    @Schema(description = "Barcode of the product (EAN, UPC, etc.)", example = "5901234123457")
    var barcode: String? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", foreignKey = ForeignKey(name = "fk_product_category"))
    @Fetch(FetchMode.JOIN)
    @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator::class, property = "id")
    @JsonIdentityReference(alwaysAsId = true)
    @JsonProperty("categoryId")
    @Schema(description = "Category this product belongs to")
    var category: ProductCategory? = null

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "unit_id", nullable = false, foreignKey = ForeignKey(name = "fk_product_unit"))
    @Fetch(FetchMode.JOIN)
    @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator::class, property = "id")
    @JsonIdentityReference(alwaysAsId = true)
    @JsonProperty("unitId")
    @Schema(description = "Unit of measurement for the product", required = true)
    var units: Units? = null

    @Column(nullable = false)
    @Schema(description = "Whether the product is active and available for sale", example = "true", required = true)
    var active: Boolean = true

    @Column(name = "image_url", length = 500)
    @Schema(description = "URL to the product image")
    var imageUrl: String? = null

    /**
     * Updates the SKU of the product.
     * This method is protected to ensure SKU updates go through proper validation.
     */
    fun updateSku(newSku: String) {
        require(newSku.isNotBlank()) { "SKU cannot be blank" }
        sku = newSku
    }

    /**
     * Adds stock to the current inventory.
     * @param quantity The quantity to add (must be positive)
     * @return The updated quantity in stock
     */
    fun addStock(quantity: Int): Int {
        require(quantity > 0) { "Quantity must be positive" }
        quantityInStock += quantity
        return quantityInStock
    }

    /**
     * Removes stock from the current inventory.
     * @param quantity The quantity to remove (must be positive and not exceed current stock)
     * @return The updated quantity in stock
     * @throws IllegalStateException if there's insufficient stock
     */
    fun removeStock(quantity: Int): Int {
        require(quantity > 0) { "Quantity must be positive" }
        require(quantity <= quantityInStock) { "Insufficient stock" }
        quantityInStock -= quantity
        return quantityInStock
    }
}