package uz.rms.modules.v1.product.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.*
import java.math.BigDecimal

/**
 * Request DTO for creating a new product.
 */
@Schema(description = "Request object for creating a new product")
data class CreateProductRequest(
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
    val description: String? = null,

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
    val quantityInStock: Int = 0,

    @field:Size(max = 100, message = "Barcode must be at most 100 characters")
    @Schema(description = "Barcode of the product (EAN, UPC, etc.)", example = "5901234123457")
    val barcode: String? = null,

    @field:Positive(message = "Category ID must be a positive number")
    @Schema(description = "ID of the category this product belongs to", example = "1")
    val categoryId: Long? = null,

    @field:NotNull(message = "Unit ID is required")
    @field:Positive(message = "Unit ID must be a positive number")
    @Schema(description = "ID of the unit of measurement for this product", example = "1", required = true)
    val unitId: Long,

    @Schema(description = "Whether the product is active and available for sale", example = "true", defaultValue = "true")
    val active: Boolean = true
) {
    /**
     * Validates the business rules for this request
     * @throws IllegalArgumentException if validation fails
     */
    fun validate() {
        require(price >= costPrice) {
            "Selling price must be greater than or equal to cost price"
        }
    }
}

/**
 * Request DTO for updating an existing product.
 */
@Schema(description = "Request object for updating an existing product")
data class UpdateProductRequest(
    @field:Size(max = 255, message = "Name must be at most 255 characters")
    @Schema(description = "Product name", example = "Wireless Mouse")
    val name: String? = null,

    @field:Size(max = 1000, message = "Description must be at most 1000 characters")
    @Schema(description = "Product description", example = "Ergonomic wireless mouse with 2.4GHz connection")
    val description: String? = null,

    @field:DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @field:Digits(integer = 10, fraction = 2, message = "Price must have up to 10 integer and 2 decimal places")
    @Schema(description = "Selling price of the product", example = "29.99")
    val price: BigDecimal? = null,

    @field:DecimalMin(value = "0.0", message = "Cost price must be 0 or greater")
    @field:Digits(integer = 10, fraction = 2, message = "Cost price must have up to 10 integer and 2 decimal places")
    @Schema(description = "Cost price of the product", example = "15.50")
    val costPrice: BigDecimal? = null,

    @field:Min(value = 0, message = "Quantity in stock cannot be negative")
    @Schema(description = "Quantity available in stock", example = "100")
    val quantityInStock: Int? = null,

    @field:Size(max = 100, message = "Barcode must be at most 100 characters")
    @Schema(description = "Barcode of the product (EAN, UPC, etc.)", example = "5901234123457")
    val barcode: String? = null,

    @field:Positive(message = "Category ID must be a positive number")
    @Schema(description = "ID of the category this product belongs to", example = "1")
    val categoryId: Long? = null,

    @field:Positive(message = "Unit ID must be a positive number")
    @Schema(description = "ID of the unit of measurement for this product", example = "1")
    val unitId: Long? = null,

    @Schema(description = "Whether the product is active and available for sale", example = "true")
    val active: Boolean? = null
) {
    /**
     * Validates the business rules for this request
     * @throws IllegalArgumentException if validation fails
     */
    fun validate() {
        if (price != null && costPrice != null) {
            require(price >= costPrice) {
                "Selling price must be greater than or equal to cost price"
            }
        }
    }

    /**
     * Checks if this is an empty update (all fields are null)
     */
    fun isEmpty(): Boolean {
        return name == null &&
               description == null &&
               price == null &&
               costPrice == null &&
               quantityInStock == null &&
               barcode == null &&
               categoryId == null &&
               unitId == null &&
               active == null
    }
}
