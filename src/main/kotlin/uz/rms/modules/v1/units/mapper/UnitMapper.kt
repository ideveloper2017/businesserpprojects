
package uz.rms.modules.v1.units.mapper

import org.springframework.data.domain.Page
import org.springframework.stereotype.Component
import uz.rms.modules.v1.units.dto.UnitDto
import uz.rms.modules.v1.units.dto.request.UnitCreateDto
import uz.rms.modules.v1.units.dto.request.UnitUpdateDto
import uz.rms.modules.v1.units.model.Units
import java.time.Instant

@Component
class UnitMapper {
    
    fun toDto(entity: Units): UnitDto = UnitDto(
        id = entity.id ?: throw IllegalArgumentException("Unit ID cannot be null"),
        code = entity.code ?: "",
        name = entity.name ?: "",
        active = entity.active,
        createdAt = entity.createdAt,
        updatedAt = entity.updatedAt
    )
    
    fun toEntity(dto: UnitCreateDto): Units = Units().apply {
        code = dto.code
        name = dto.name
        active = true
    }
    
    fun updateEntity(entity: Units, dto: UnitUpdateDto): Units = entity.apply {
        code = dto.code
        name = dto.name
    }
    
    fun toDtoPage(page: Page<Units>): Page<UnitDto> = page.map { toDto(it) }
}
