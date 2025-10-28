
package uz.rms.modules.v1.units.repository

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import uz.rms.modules.v1.units.model.Units


@Repository
interface UnitRepository : JpaRepository<Units, Long> {
    fun existsByCode(code: String): Boolean
    
    @Query("""
        SELECT u FROM Units u 
        WHERE LOWER(u.code) LIKE LOWER(CONCAT('%', :query, '%')) 
           OR LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%'))
    """)
    fun search(@Param("query") query: String, pageable: Pageable): Page<Units>
    
    fun findByCodeContainingIgnoreCaseOrNameContainingIgnoreCase(
        code: String, 
        name: String, 
        pageable: Pageable
    ): Page<Units>
}
