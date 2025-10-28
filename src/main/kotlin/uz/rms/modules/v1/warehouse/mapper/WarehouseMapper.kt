package uz.rms.modules.v1.warehouse.mapper

import org.springframework.stereotype.Component
import uz.rms.modules.v1.warehouse.dto.WarehouseDto
import uz.rms.modules.v1.warehouse.dto.WarehouseRequest
import uz.rms.modules.v1.warehouse.model.Warehouse
import java.time.Instant
import java.time.LocalDateTime

@Component
class WarehouseMapper {
    fun toDto(warehouse: Warehouse): WarehouseDto {
        return WarehouseDto(
            id = warehouse.id ?: throw IllegalStateException("Warehouse ID cannot be null"),
            name = warehouse.name,
            isActive = warehouse.isActive,
            isDefault = warehouse.isDefault,
            createdAt = warehouse.createdAt,
            updatedAt = warehouse.updatedAt
        )
    }

    fun toEntity(request: WarehouseRequest): Warehouse {
        return Warehouse().apply {
            name = request.name
            isActive = true
            isDefault = request.isDefault
            createdAt = LocalDateTime.now()
            updatedAt = LocalDateTime.now()
        }
    }

    fun updateEntityFromRequest(request: WarehouseRequest, entity: Warehouse) {
        request.name.takeIf { it.isNotBlank() }?.let { entity.name = it }
        entity.updatedAt = LocalDateTime.now()
    }
}