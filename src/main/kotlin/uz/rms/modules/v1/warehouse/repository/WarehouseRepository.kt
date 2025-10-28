
package uz.rms.modules.v1.warehouse.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import uz.rms.modules.v1.warehouse.model.Warehouse

@Repository
interface WarehouseRepository : JpaRepository<Warehouse, Long>{
    // Find a warehouse by name (exact match)
    fun findByName(name: String): Warehouse?

    // Find all warehouses by active status
    fun findByIsActive(isActive: Boolean): List<Warehouse>

    // Find all warehouses by default status
    fun findByIsDefault(isDefault: Boolean): List<Warehouse>

    // Search warehouses by name (case-insensitive partial match)
    @Query("SELECT w FROM Warehouse w WHERE LOWER(w.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    fun search(@Param("query") query: String): List<Warehouse>

    // Check if a warehouse with the given name exists
    fun existsByName(name: String): Boolean

    // Find the default warehouse (should be only one)
    fun findFirstByIsDefaultTrue(): Warehouse?
}
