
package uz.rms.modules.v1.supplier.mapper

import org.springframework.stereotype.Component
import uz.rms.modules.v1.supplier.dto.SupplierDto
import uz.rms.modules.v1.supplier.model.Supplier

@Component
class SupplierMapper {
    fun toDto(entity: Supplier) = SupplierDto(entity.id, entity.first_name)
    fun fromDto(dto: SupplierDto) = Supplier().apply {
        id = dto.id ?: 0
        first_name = dto.name
    }
}
