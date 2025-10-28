
package uz.rms.modules.v1.units.service

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import uz.rms.modules.v1.units.dto.UnitDto
import uz.rms.modules.v1.units.dto.request.UnitCreateDto
import uz.rms.modules.v1.units.dto.request.UnitUpdateDto
import uz.rms.modules.v1.units.model.Units

interface UnitService {
    fun getAll(): List<UnitDto>
    fun getById(id: Long): UnitDto
    fun create(dto: UnitCreateDto): UnitDto
    fun update(id: Long, dto: UnitUpdateDto): UnitDto
    fun delete(id: Long)
    fun toggleStatus(id: Long, active: Boolean): UnitDto
    fun search(query: String, pageable: Pageable): Page<UnitDto>
}
