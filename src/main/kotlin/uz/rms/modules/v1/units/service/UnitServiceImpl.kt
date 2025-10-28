package uz.rms.modules.v1.units.service

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

import uz.rms.modules.v1.units.dto.UnitDto
import uz.rms.modules.v1.units.dto.request.UnitCreateDto
import uz.rms.modules.v1.units.dto.request.UnitUpdateDto
import uz.rms.modules.v1.units.mapper.UnitMapper
import uz.rms.modules.v1.units.repository.UnitRepository

@Service
@Transactional(readOnly = true)
class UnitServiceImpl(
    private val repository: UnitRepository,
    private val mapper: UnitMapper
) : UnitService {

    override fun getAll(): List<UnitDto> =
        repository.findAll().map { mapper.toDto(it) }

    override fun getById(id: Long): UnitDto =
        repository.findById(id)
            .map { mapper.toDto(it) }
            .orElseThrow {  RuntimeException("Unit not found with id: $id") }

    @Transactional
    override fun create(dto: UnitCreateDto): UnitDto {
        if (repository.existsByCode(dto.code)) {
            throw IllegalArgumentException("Unit with code ${dto.code} already exists")
        }
        val unit = mapper.toEntity(dto)
        return mapper.toDto(repository.save(unit))
    }

    @Transactional
    override fun update(id: Long, dto: UnitUpdateDto): UnitDto {
        val unit = repository.findByIdOrNull(id)
            ?: throw  RuntimeException("Unit not found with id: $id")

        // Check if code is being changed and if the new code is already taken
        if (unit.code != dto.code && repository.existsByCode(dto.code)) {
            throw IllegalArgumentException("Unit with code ${dto.code} already exists")
        }

        val updatedUnit = mapper.updateEntity(unit, dto)
        return mapper.toDto(repository.save(updatedUnit))
    }

    @Transactional
    override fun delete(id: Long) {
        if (!repository.existsById(id)) {
            throw  RuntimeException("Unit not found with id: $id")
        }
        repository.deleteById(id)
    }

    @Transactional
    override fun toggleStatus(id: Long, active: Boolean): UnitDto {
        val unit = repository.findByIdOrNull(id)
            ?: throw  RuntimeException("Unit not found with id: $id")

        
        unit.active = active
        return mapper.toDto(repository.save(unit))
    }

    
    override fun search(query: String, pageable: Pageable): Page<UnitDto> {
        val searchQuery = "%${query.trim().lowercase()}%"
        return repository.findByCodeContainingIgnoreCaseOrNameContainingIgnoreCase(
            searchQuery, searchQuery, pageable
        ).map { mapper.toDto(it) }
    }
}
