package uz.rms.modules.v1.product.dto.request

import com.fasterxml.jackson.annotation.JsonProperty
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.math.BigDecimal

/**
 * Request DTO for creating a new product
 */
data class CreateProductRequest(
    @field:NotBlank(message = "SKU is required")
    @field:Schema(description = "Stock Keeping Unit (unique product identifier)", example = "PROD-001", required = true)
    val sku: String,

    @field:NotBlank(message = "Product name is required")
    @field:Schema(description = "Name of the product", example = "Wireless Mouse", required = true)
    val name: String,

    @field:Schema(description = "Detailed description of the product", example = "Ergonomic wireless mouse with 2.4GHz connection")
    val description: String? = null,

    @field:NotNull(message = "Price is required")
    @field:DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @field:Schema(description = "Selling price of the product", example = "29.99", required = true)
    val price: BigDecimal,

    @field:NotNull(message = "Cost price is required")
    @field:DecimalMin(value = "0.0", message = "Cost price must be 0 or greater")
    @field:Schema(description = "Cost price of the product", example = "15.50", required = true)
    val costPrice: BigDecimal,

    @field:Min(value = 0, message = "Quantity in stock cannot be negative")
    @field:Schema(description = "Initial quantity in stock", example = "100", required = true)
    val quantityInStock: Int = 0,

    @field:Schema(description = "Barcode of the product (EAN, UPC, etc.)", example = "5901234123457")
    val barcode: String? = null,

    @field:Schema(description = "ID of the category this product belongs to", example = "1")
    val categoryId: Long? = null,

    @field:NotNull(message = "Unit is required")
    @field:Schema(description = "ID of the unit for this product", example = "1", required = true)
    @field:JsonProperty("unit_id")
    val unitId: Long,

    @field:Schema(description = "Whether the product is active and available for sale", example = "true")
    val active: Boolean? = true
)

/**
 * Request DTO for updating an existing product
 */
data class UpdateProductRequest(
    @field:Schema(description = "Updated name of the product", example = "Wireless Mouse Pro")
    val name: String? = null,

    @field:Schema(description = "Updated description of the product", example = "Premium ergonomic wireless mouse with 2.4GHz connection and silent click")
    val description: String? = null,

    @field:DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @field:Schema(description = "Updated selling price of the product", example = "34.99")
    val price: BigDecimal? = null,

    @field:DecimalMin(value = "0.0", message = "Cost price must be 0 or greater")
    @field:Schema(description = "Updated cost price of the product", example = "18.50")
    val costPrice: BigDecimal? = null,

    @field:Min(value = 0, message = "Quantity in stock cannot be negative")
    @field:Schema(description = "Updated quantity in stock", example = "150")
    val quantityInStock: Int? = null,

    @field:Schema(description = "Updated barcode of the product (EAN, UPC, etc.)", example = "5901234123457")
    val barcode: String? = null,

    @field:Schema(description = "Updated category ID this product belongs to", example = "2")
    val categoryId: Long? = null,

    @field:Schema(description = "ID of the unit for this product", example = "1")
    @field:JsonProperty("unit_id")
    val unitId: Long? = null,

    @field:Schema(description = "Whether the product is active and available for sale", example = "true")
    val active: Boolean? = null
)
