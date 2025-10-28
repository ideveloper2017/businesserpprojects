package uz.rms.modules.v1.product.mapper

import org.mapstruct.Mapper
import org.mapstruct.Mapping
import org.mapstruct.MappingTarget
import org.mapstruct.Named
import org.mapstruct.factory.Mappers
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import uz.rms.modules.v1.product.dto.request.CreateProductRequest
import uz.rms.modules.v1.product.dto.ProductDto
import uz.rms.modules.v1.product.dto.ProductResponse
import uz.rms.modules.v1.product.model.Product
import uz.rms.modules.v1.product.model.ProductCategory
import uz.rms.modules.v1.units.dto.UnitDto
import uz.rms.modules.v1.units.model.Units
import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.ZoneOffset

/**
 * Mapper for converting between Product entities and DTOs.
 * Handles bidirectional relationships and null safety.
 */
@Component
class ProductMapper {

    /**
     * Converts a Product entity to a ProductDto.
     * @param product The Product entity to convert
     * @return ProductDto containing the product data
     */
    fun toDto(product: Product): ProductDto {
        val productId = product.id ?: throw IllegalStateException("Product must have an ID")
        val units = product.units ?: throw IllegalStateException("Product must have a unit")
        val unitId = units.id ?: throw IllegalStateException("Product's unit must have an ID")

        return ProductDto(
            sku = product.sku,
            name = product.name,
            description = product.description,
            price = product.price,
            costPrice = product.costPrice,
            quantityInStock = product.quantityInStock,
            barcode = product.barcode,
            categoryId = product.category?.id,
            category = product.category?.let { toCategoryDto(it) },
            unitId = unitId,
            active = product.active
        )
    }

    /**
     * Converts a Product entity to a ProductResponse DTO.
     * @param product The Product entity to convert
     * @return ProductResponse containing the product data with related entities
     */
    fun toResponse(product: Product): ProductResponse {
        val productId = product.id ?: throw IllegalStateException("Product must have an ID")
        val units = product.units ?: throw IllegalStateException("Product must have a unit")
        
        return ProductResponse(
            id = productId,
            sku = product.sku,
            name = product.name,
            description = product.description,
            price = product.price,
            costPrice = product.costPrice,
            quantityInStock = product.quantityInStock,
            barcode = product.barcode,
            category = product.category?.let { toCategoryDto(it) },
            units = toUnitDto(units),
            active = product.active,
            createdAt = product.createdAt,
            updatedAt = product.updatedAt
        )
    }

    /**
     * Converts a Units entity to a UnitDto.
     * @param units The Units entity to convert
     * @return UnitDto containing the unit data
     */
    fun toUnitDto(units: Units): UnitDto {
        val unitId = units.id ?: throw IllegalStateException("Unit must have an ID")
        
        return UnitDto(
            id = unitId,
            code = units.code ?: "",
            name = units.name ?: "",
            active = units.active,
            createdAt = units.createdAt,
            updatedAt = units.updatedAt
        )
    }

    /**
     * Converts a UnitDto to a Units entity.
     * @param unitDto The UnitDto to convert
     * @return Units entity with the DTO data
     */
    fun toUnitEntity(unitDto: UnitDto): Units {
        return Units().apply {
            id = unitDto.id
            code = unitDto.code
            name = unitDto.name
            active = unitDto.active ?: true
            createdAt = (unitDto.createdAt ?: Instant.now()) as LocalDateTime?
            updatedAt = (unitDto.updatedAt ?: Instant.now()) as LocalDateTime?
        }
    }

    /**
     * Converts a ProductCategory entity to a CategoryDto.
     * @param category The ProductCategory to convert
     * @return CategoryDto containing the category data
     */
    fun toCategoryDto(category: ProductCategory): ProductResponse.CategoryDto {
        requireNotNull(category.id) { "Category must have an ID" }
        
        return ProductResponse.CategoryDto(
            id = category.id!!,
            name = category.name,
            description = category.description,
            parentCategoryId = category.parent?.id,
            active = category.active,
            fullPath = category.fullPath
        )
    }

    /**
     * Creates a new Product entity from a DTO.
     * @param dto The ProductDto containing the product data
     * @param category The associated ProductCategory (optional)
     * @param units The associated Units (required)
     * @return A new Product entity
     * @throws IllegalArgumentException if units is null or has no ID
     */
//    fun toEntity(dto: ProductDto, category: ProductCategory? = null, units: Units): Product {
//        requireNotNull(units.id) { "Unit must have an ID" }
//
//        return Product().apply {
//            updateSku(dto.sku)
//            name = dto.name
//            description = dto.description
//            price = dto.price
//            costPrice = dto.costPrice
//            quantityInStock = dto.quantityInStock
//            barcode = dto.barcode
//            this.units = units
//            this.category = category
//            active = dto.active
//        }
//    }

    /**
     * Creates a new Product entity from a CreateProductRequest.
     * @param request The CreateProductRequest containing the product data
     * @param units The associated Units (required)
     * @param category The associated ProductCategory (optional)
     * @return A new Product entity
     * @throws IllegalArgumentException if units is null or has no ID
     */
    fun toEntity(request: CreateProductRequest, units: Units, category: ProductCategory? = null): Product {
        requireNotNull(units.id) { "Unit must have an ID" }

        return Product().apply {
            updateSku(request.sku)
            name = request.name
            description = request.description
            price = request.price
            costPrice = request.costPrice
            quantityInStock = request.quantityInStock
            barcode = request.barcode
            this.units = units
            this.category = category
            active = request.active ?: true
        }
    }

    /**
     * Updates an existing Product entity from a DTO.
     * @param product The Product entity to update
     * @param dto The ProductDto containing the updated data
     * @param category The new ProductCategory (optional)
     */
    fun updateFromDto(product: Product, dto: ProductDto, category: ProductCategory? = null) {
        // Don't update SKU as it's the business key
        dto.name.takeIf { it.isNotBlank() }?.let { product.name = it }
        dto.description?.let { product.description = it }
        
        // Only update price if it's positive
        if (dto.price > BigDecimal.ZERO) {
            product.price = dto.price
        }
        
        // Only update cost price if it's positive
        if (dto.costPrice > BigDecimal.ZERO) {
            product.costPrice = dto.costPrice
        }
        
        // Only update quantity if it's not negative
        if (dto.quantityInStock >= 0) {
            product.quantityInStock = dto.quantityInStock
        }
        
        dto.barcode?.takeIf { it.isNotBlank() }?.let { product.barcode = it }
        category?.let { product.category = it }
        product.active = dto.active
    }
    
    /**
     * Creates a minimal ProductResponse for lists to avoid loading unnecessary data.
     * @param product The Product entity to convert
     * @return A minimal ProductResponse with basic information
     */
    fun toMinimalResponse(product: Product): ProductResponse.MinimalResponse {
        val productId = product.id ?: throw IllegalStateException("Product must have an ID")
        
        return ProductResponse.MinimalResponse(
            id = productId,
            sku = product.sku,
            name = product.name,
            price = product.price,
            quantityInStock = product.quantityInStock,
            active = product.active
        )
    }
}
