package uz.rms.modules.v1.supplier.service

import org.springframework.stereotype.Service
import uz.rms.modules.v1.supplier.dto.SupplierDto
import uz.rms.modules.v1.supplier.repository.SupplierRepository
import uz.rms.modules.v1.supplier.mapper.SupplierMapper

@Service
class SupplierServiceImpl(
    private val repository: SupplierRepository,
    private val mapper: SupplierMapper
): SupplierService {
    override fun getAll(): List<SupplierDto> = repository.findAll().map { mapper.toDto(it) }

    override fun getById(id: Long): SupplierDto = mapper.toDto(
        repository.findById(id).orElseThrow { NoSuchElementException("Suppilier not found with id=$id") }
    )

    override fun create(dto: SupplierDto): SupplierDto {
        val entity = mapper.fromDto(dto)
        return mapper.toDto(repository.save(entity))
    }

    override fun update(id: Long, dto: SupplierDto): SupplierDto {
        val existing = repository.findById(id).orElseThrow { NoSuchElementException("Suppilier not found with id=$id") }
        existing.first_name = dto.name
        return mapper.toDto(repository.save(existing))
    }

    override fun delete(id: Long) {
        if (!repository.existsById(id)) throw NoSuchElementException("Suppilier not found with id=$id")
        repository.deleteById(id)
    }
}
