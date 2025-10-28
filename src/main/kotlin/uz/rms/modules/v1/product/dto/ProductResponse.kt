package uz.rms.modules.v1.product.dto

import com.fasterxml.jackson.annotation.JsonInclude
import io.swagger.v3.oas.annotations.media.Schema
import uz.rms.modules.v1.units.dto.UnitDto
import uz.rms.modules.v1.product.model.ProductCategory

import java.math.BigDecimal
import java.time.LocalDateTime

/**
 * Response DTO for product operations.
 * Contains detailed product information including related entities.
 */
@Schema(description = "Product response object")
data class ProductResponse(
    @field:Schema(description = "Unique identifier of the product", example = "1", required = true)
    val id: Long,

    @field:Schema(description = "Stock Keeping Unit (unique product identifier)", 
                 example = "PROD-001", required = true)
    val sku: String,

    @field:Schema(description = "Product name", example = "Wireless Mouse", required = true)
    val name: String,

    @field:Schema(description = "Product description", 
                 example = "Ergonomic wireless mouse with 2.4GHz connection")
    val description: String?,

    @field:Schema(description = "Selling price of the product", example = "29.99", required = true)
    val price: BigDecimal,

    @field:Schema(description = "Cost price of the product", example = "15.50", required = true)
    val costPrice: BigDecimal,

    @field:Schema(description = "Quantity available in stock", example = "100", required = true)
    val quantityInStock: Int,

    @field:Schema(description = "Barcode of the product (EAN, UPC, etc.)", example = "5901234123457")
    val barcode: String?,

    @field:Schema(description = "Category information")
    val category: CategoryDto?,

    @field:Schema(description = "Unit of measurement information", required = true)
    val units: UnitDto,

    @field:Schema(description = "Whether the product is active and available for sale", 
                 example = "true", required = true)
    val active: Boolean = true,

    @field:Schema(description = "Date and time when the product was created", 
                 example = "2023-01-01T12:00:00")
    val createdAt: LocalDateTime? = null,

    @field:Schema(description = "Date and time when the product was last updated", 
                 example = "2023-01-01T12:00:00")
    val updatedAt: LocalDateTime? = null
) {
    /**
     * Minimal product information for listing and dropdowns
     */
    @Schema(description = "Minimal product information")
    data class MinimalResponse(
        @field:Schema(description = "Unique identifier of the product", example = "1", required = true)
        val id: Long,

        @field:Schema(description = "Stock Keeping Unit", example = "PROD-001", required = true)
        val sku: String,

        @field:Schema(description = "Product name", example = "Wireless Mouse", required = true)
        val name: String,

        @field:Schema(description = "Selling price of the product", example = "29.99", required = true)
        val price: BigDecimal,

        @field:Schema(description = "Quantity available in stock", example = "100", required = true)
        val quantityInStock: Int,

        @field:Schema(description = "Whether the product is active", example = "true", required = true)
        val active: Boolean
    )

    /**
     * Category information DTO
     */
    @Schema(description = "Category information")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    data class CategoryDto(
        @field:Schema(description = "Unique identifier of the category", example = "1", required = true)
        val id: Long,

        @field:Schema(description = "Category name", example = "Electronics", required = true)
        val name: String,

        @field:Schema(description = "Category description", example = "Electronic devices and accessories")
        val description: String?,

        @field:Schema(description = "ID of the parent category, if this is a subcategory", example = "1")
        val parentCategoryId: Long?,

        @field:Schema(description = "Full category path (e.g., 'Electronics > Computer > Mouse')")
        val fullPath: String? = null,

        @field:Schema(description = "Whether the category is active", example = "true", required = true)
        val active: Boolean
    ) {
        companion object {
            /**
             * Creates a CategoryDto from a ProductCategory entity
             */
            fun fromEntity(category: ProductCategory): CategoryDto {
                requireNotNull(category.id) { "Category must have an ID" }
                
                return CategoryDto(
                    id = category.id!!,
                    name = category.name,
                    description = category.description,
                    parentCategoryId = category.parent?.id,
                    fullPath = category.fullPath,
                    active = category.active
                )
            }

            /**
             * Converts this DTO to a ProductCategory entity
             */
            fun toEntity(categoryDto: CategoryDto): ProductCategory {
                return ProductCategory().apply {
                    id = categoryDto.id
                    name = categoryDto.name
                    description = categoryDto.description
                    parent = categoryDto.parentCategoryId?.let { 
                        ProductCategory().apply { id = it } 
                    }
                    active = categoryDto.active
                }
            }
        }
    }


    /**
     * Creates a minimal response with basic product information
     */
    fun toMinimalResponse(): MinimalResponse = MinimalResponse(
        id = id,
        sku = sku,
        name = name,
        price = price,
        quantityInStock = quantityInStock,
        active = active
    )
}
