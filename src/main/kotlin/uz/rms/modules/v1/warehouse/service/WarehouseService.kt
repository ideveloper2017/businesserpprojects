
package uz.rms.modules.v1.warehouse.service
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import uz.rms.modules.v1.warehouse.dto.WarehouseDto
import uz.rms.modules.v1.warehouse.dto.WarehouseRequest

interface WarehouseService {
    fun createWarehouse(request: WarehouseRequest): WarehouseDto
    fun getWarehouseById(id: Long): WarehouseDto
    fun updateWarehouse(id: Long, request: WarehouseRequest): WarehouseDto
    fun deleteWarehouse(id: Long)
    fun getAllWarehouses(pageable: Pageable): Page<WarehouseDto>
    fun searchWarehouses(query: String, pageable: Pageable): Page<WarehouseDto>
    fun toggleStatus(id: Long, isActive: Boolean): WarehouseDto
    fun setDefaultWarehouse(id: Long): WarehouseDto
}
