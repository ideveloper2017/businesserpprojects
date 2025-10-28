package uz.rms.modules.v1.product.repository

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import uz.rms.modules.v1.product.model.Product
import java.math.BigDecimal

interface ProductWithCategoryView {
    val id: Long
    val sku: String
    val name: String
    val description: String?
    val price: java.math.BigDecimal
    val costPrice: java.math.BigDecimal
    val quantityInStock: Int
    val barcode: String?
    val categoryId: Long?
    val categoryName: String?
    val categoryDescription: String?
    val categoryParentCategoryId: Long?
    val categoryActive: Boolean?
    val active: Boolean
}

@Repository
interface ProductRepository : JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    fun existsBySku(sku: String): Boolean

    fun findBySku(sku: String): Product?

    fun findByBarcode(barcode: String): Product?

    @Query("""
        SELECT p FROM Product p 
        WHERE (:categoryId IS NULL OR p.category.id = :categoryId)
        AND (:minPrice IS NULL OR p.price >= :minPrice)
        AND (:maxPrice IS NULL OR p.price <= :maxPrice)
        AND (:minQuantity IS NULL OR p.quantityInStock >= :minQuantity)
        AND (:maxQuantity IS NULL OR p.quantityInStock <= :maxQuantity)
        AND (:active IS NULL OR p.active = :active)
        AND (
            :search IS NULL 
            OR LOWER(CAST(p.name AS text)) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%')) 
            OR LOWER(CAST(p.sku AS text)) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%'))
            OR (p.description IS NOT NULL AND LOWER(CAST(p.description AS text)) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%')))
        )
    """)
    fun searchProducts(
        @Param("search") search: String?,
        @Param("categoryId") categoryId: Long?,
        @Param("minPrice") minPrice: BigDecimal?,
        @Param("maxPrice") maxPrice: BigDecimal?,
        @Param("minQuantity") minQuantity: Int?,
        @Param("maxQuantity") maxQuantity: Int?,
        @Param("active") active: Boolean?,
        pageable: Pageable
    ): Page<Product>
}
