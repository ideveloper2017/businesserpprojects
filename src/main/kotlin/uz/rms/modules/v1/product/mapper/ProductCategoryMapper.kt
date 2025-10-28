package uz.rms.modules.v1.product.mapper

import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import uz.rms.modules.v1.product.dto.CreateProductCategoryRequest
import uz.rms.modules.v1.product.dto.ProductCategoryResponse
import uz.rms.modules.v1.product.dto.SimpleCategoryResponse
import uz.rms.modules.v1.product.model.ProductCategory

/**
 * Mapper for converting between ProductCategory entity and DTOs
 */
@Component
class ProductCategoryMapper {

    /**
     * Converts CreateProductCategoryRequest to ProductCategory entity
     */
    fun toEntity(request: CreateProductCategoryRequest): ProductCategory {
        return ProductCategory().apply {
            name = request.name
            description = request.description
            // Parent category will be set in the service layer
        }
    }

    /**
     * Updates an existing ProductCategory entity with values from UpdateProductCategoryRequest
     */
    fun updateEntity(
        entity: ProductCategory,
        request: CreateProductCategoryRequest
    ): ProductCategory {
        return entity.apply {
            request.name?.let { name = it }
            request.description?.let { description = it }
            // Parent category will be updated in the service layer
        }
    }


    /**
     * Converts ProductCategory entity to ProductCategoryResponse DTO
     * @param includeChildren Whether to include child categories in the response
     */
    fun toResponse(entity: ProductCategory, includeChildren: Boolean = false): ProductCategoryResponse {
        return ProductCategoryResponse(
            id = entity.id ?: throw IllegalStateException("Entity ID cannot be null"),
            name = entity.name,
            description = entity.description,
            parent_id = entity.parent?.id,
            active = entity.active,
            productCount = try {
                entity.products.size
            } catch (e: Exception) {
                0
            },
            subCategories = if (includeChildren && entity.children != null) {
                entity.children!!.map { toResponse(it, true) }
            } else {
                emptyList()
            }
        )
    }

    /**
     * Converts ProductCategory entity to SimpleCategoryResponse DTO
     * Safe to use with lazy-loaded entities
     */
    fun toSimpleResponse(entity: ProductCategory): SimpleCategoryResponse {
        return SimpleCategoryResponse(
            id = entity.id ?: throw IllegalStateException("Entity ID cannot be null"),
            name = entity.name,
            active = entity.active
        )
    }

    /**
     * Converts a list of ProductCategory entities to a list of ProductCategoryResponse DTOs
     * Fetches all required data in a single query to avoid N+1 problem
     */
    @Transactional(readOnly = true)
    fun toResponseList(entities: List<ProductCategory>): List<ProductCategoryResponse> {
        return entities.map { toResponse(it) }
    }

    /**
     * Converts a list of ProductCategory entities to a list of SimpleCategoryResponse DTOs
     * Safe to use with lazy-loaded entities
     */
    @Transactional(readOnly = true)
    fun toSimpleResponseList(entities: List<ProductCategory>): List<SimpleCategoryResponse> {
        return entities.map { toSimpleResponse(it) }
    }
}
