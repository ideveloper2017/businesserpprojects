package uz.rms.modules.v1.product.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import uz.rms.modules.v1.product.model.ProductCategory


@Repository
interface ProductCategoryRepository : JpaRepository<ProductCategory, Long> {
    fun findByName(name: String): ProductCategory?
    
    @Query("""
        SELECT c FROM ProductCategory c 
        WHERE c.parent IS NULL 
        ORDER BY c.name ASC
    """)
    fun findRootCategories(): List<ProductCategory>
    
    @Query("""
        SELECT c FROM ProductCategory c 
        WHERE c.parent IS NULL 
        AND c.active = true 
        ORDER BY c.name ASC
    """)
    fun findActiveRootCategories(): List<ProductCategory>
    
    @Query("""
        SELECT c FROM ProductCategory c 
        WHERE c.parent.id = :parentId 
        AND c.active = true 
        ORDER BY c.name ASC
    """)
    fun findActiveChildren(@Param("parentId") parentId: Long): List<ProductCategory>
    
    @Query("""
        SELECT c FROM ProductCategory c 
        WHERE c.parent.id = :parentId 
        ORDER BY c.name ASC
    """)
    fun findAllChildren(@Param("parentId") parentId: Long): List<ProductCategory>
    
    @Deprecated("Use findActiveChildren or findAllChildren instead")
    fun findByParentId(parentId: Long): List<ProductCategory> {
        return if (parentId == 0L) {
            findRootCategories()
        } else {
            findAllChildren(parentId)
        }
    }
    
    fun existsByName(name: String): Boolean
    
    @Query("""
        SELECT c FROM ProductCategory c 
        WHERE c.active = true 
        ORDER BY c.name ASC
    """)
    fun findAllActive(): List<ProductCategory>
    
    @Query("""
        SELECT c FROM ProductCategory c 
        WHERE c.parent IS NOT NULL 
        AND c.parent.id = :parentId 
        AND c.id = :childId
    """)
    fun isChildOfParent(
        @Param("parentId") parentId: Long, 
        @Param("childId") childId: Long
    ): ProductCategory?
}
