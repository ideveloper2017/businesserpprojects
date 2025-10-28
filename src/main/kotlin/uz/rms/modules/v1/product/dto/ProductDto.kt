package uz.rms.modules.v1.product.dto

import com.fasterxml.jackson.annotation.JsonProperty
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.*
import uz.rms.modules.v1.product.model.Product

import java.math.BigDecimal

/**
 * Data Transfer Object for product operations.
 * Used for both creating and updating products.
 */
@Schema(description = "Product data transfer object")
data class ProductDto(
    @field:NotBlank(message = "SKU is required")
    @field:Size(max = 100, message = "SKU must be at most 100 characters")
    @field:Pattern(regexp = "^[A-Z0-9-]+", message = "SKU can only contain uppercase letters, numbers, and hyphens")
    @Schema(
        description = "Stock Keeping Unit (unique product identifier)",
        example = "PROD-001",
        required = true
    )
    val sku: String,

    @field:NotBlank(message = "Product name is required")
    @field:Size(max = 255, message = "Name must be at most 255 characters")
    @Schema(description = "Product name", example = "Wireless Mouse", required = true)
    val name: String,

    @field:Size(max = 1000, message = "Description must be at most 1000 characters")
    @Schema(description = "Product description", example = "Ergonomic wireless mouse with 2.4GHz connection")
    val description: String?,

    @field:DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @field:Digits(integer = 10, fraction = 2, message = "Price must have up to 10 integer and 2 decimal places")
    @Schema(description = "Selling price of the product", example = "29.99", required = true)
    val price: BigDecimal,

    @field:DecimalMin(value = "0.0", message = "Cost price must be 0 or greater")
    @field:Digits(integer = 10, fraction = 2, message = "Cost price must have up to 10 integer and 2 decimal places")
    @Schema(description = "Cost price of the product", example = "15.50", required = true)
    val costPrice: BigDecimal,

    @field:Min(value = 0, message = "Quantity in stock cannot be negative")
    @Schema(description = "Quantity available in stock", example = "100", required = true)
    val quantityInStock: Int,

    @field:Size(max = 100, message = "Barcode must be at most 100 characters")
    @Schema(description = "Barcode of the product (EAN, UPC, etc.)", example = "5901234123457")
    val barcode: String?,

    @field:Positive(message = "Category ID must be a positive number")
    @Schema(description = "ID of the category this product belongs to", example = "1")
    val categoryId: Long?,

    @Schema(description = "Category details (read-only)", accessMode = Schema.AccessMode.READ_ONLY)
    val category: ProductResponse.CategoryDto? = null,

    @field:NotNull(message = "Unit ID is required")
    @field:Positive(message = "Unit ID must be a positive number")
    @Schema(description = "ID of the unit for this product", example = "1", required = true)
    @field:JsonProperty("unit_id")
    val unitId: Long,

    @Schema(description = "Whether the product is active and available for sale", example = "true", defaultValue = "true")
    val active: Boolean = true
) {
    /**
     * Secondary constructor for compatibility with existing code
     */
    constructor(
        sku: String,
        name: String,
        description: String?,
        price: BigDecimal,
        costPrice: BigDecimal,
        quantityInStock: Int,
        barcode: String?,
        categoryId: Long?,
        category: ProductResponse.CategoryDto?,
        unit_id: Long?,
        active: Boolean = true
    ) : this(
        sku = sku,
        name = name,
        description = description,
        price = price,
        costPrice = costPrice,
        quantityInStock = quantityInStock,
        barcode = barcode,
        categoryId = categoryId,
        category = category,
        unitId = unit_id ?: throw IllegalArgumentException("Unit ID is required"),
        active = active
    )

    /**
     * Converts a Product entity to a ProductDto
     */
    companion object {
        fun fromEntity(product: Product): ProductDto {
            requireNotNull(product.units) { "Product must have a unit" }
            requireNotNull(product.units!!.id) { "Product's unit must have an ID" }

            return ProductDto(
                sku = product.sku,
                name = product.name,
                description = product.description,
                price = product.price,
                costPrice = product.costPrice,
                quantityInStock = product.quantityInStock,
                barcode = product.barcode,
                categoryId = product.category?.id,
                category = product.category?.let { ProductResponse.CategoryDto.fromEntity(it) },
                unitId = product.units!!.id!!,
                active = product.active
            )
        }
    }

    /**
     * Validates the business rules for this DTO
     * @throws IllegalArgumentException if validation fails
     */
    fun validate() {
        require(price >= costPrice) {
            "Selling price must be greater than or equal to cost price"
        }
    }
}
