package uz.rms.modules.v1.product.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.PositiveOrZero

/**
 * Request DTO for creating a new product category
 */
data class CreateProductCategoryRequest(
    @field:NotBlank(message = "Category name is required")
    @field:Schema(description = "Name of the category", example = "Electronics", required = true)
    val name: String,

    @field:Schema(description = "Description of the category", example = "Electronic devices and accessories")
    val description: String? = null,

    @field:Schema(description = "ID of the parent category if this is a subcategory", example = "1")
    val parentCategoryId: Long? = null
)

/**
 * Request DTO for updating an existing product category
 */
data class UpdateProductCategoryRequest(
    @field:Schema(description = "New name for the category", example = "Updated Electronics")
    val name: String? = null,

    @field:Schema(description = "New description for the category", example = "Updated description")
    val description: String? = null,

    @field:Schema(description = "New parent category ID (set to null to make it a top-level category)", example = "2")
    val parentCategoryId: Long? = null,

    @field:Schema(description = "Whether the category is active", example = "true")
    val active: Boolean? = null
)

/**
 * Response DTO for product category
 */
data class ProductCategoryResponse(
    @field:Schema(description = "Unique identifier of the category", example = "1")
    val id: Long,

    @field:Schema(description = "Name of the category", example = "Electronics")
    val name: String,

    @field:Schema(description = "Description of the category", example = "Electronic devices and accessories")
    val description: String?,

    @field:Schema(description = "ID of the parent category if this is a subcategory", example = "1")
    val parent_id: Long?,

    @field:Schema(description = "Whether the category is active", example = "true")
    val active: Boolean,

    @field:Schema(description = "List of subcategories (simplified)")
    val subCategories: List<ProductCategoryResponse> = emptyList(),

    @field:Schema(description = "Number of products in this category", example = "10")
    val productCount: Int = 0
)

/**
 * Simplified category response DTO for nested structures
 */
data class SimpleCategoryResponse(
    @field:Schema(description = "Unique identifier of the category", example = "2")
    val id: Long,

    @field:Schema(description = "Name of the category", example = "Laptops")
    val name: String,

    @field:Schema(description = "Whether the category is active", example = "true")
    val active: Boolean
)
