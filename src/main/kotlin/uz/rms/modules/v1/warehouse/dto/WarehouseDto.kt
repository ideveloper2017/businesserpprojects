
package uz.rms.modules.v1.warehouse.dto

import java.time.LocalDateTime

data class WarehouseDto(
    val id: Long,
    val name: String,
    val isActive: Boolean,
    val isDefault: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)
