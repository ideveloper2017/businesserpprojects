package uz.rms.modules.v1.warehouse.service

import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import uz.rms.modules.v1.warehouse.dto.WarehouseDto
import uz.rms.modules.v1.warehouse.dto.WarehouseRequest
import uz.rms.modules.v1.warehouse.mapper.WarehouseMapper
import uz.rms.modules.v1.warehouse.model.Warehouse
import uz.rms.modules.v1.warehouse.repository.WarehouseRepository
import java.time.Instant
// … остальные импорты остаются без изменений
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import java.time.LocalDateTime

@Service
@Transactional
class WarehouseServiceImpl(
    private val warehouseRepository: WarehouseRepository,
    private val warehouseMapper: WarehouseMapper
) : WarehouseService {

    private val allowedSortProps = setOf("id", "name", "isDefault", "isActive", "createdAt", "updatedAt")

    private fun sanitizeSort(sort: Sort): Sort {
        val validOrders = sort.filter { allowedSortProps.contains(it.property) }.toList()
        return if (validOrders.isEmpty()) Sort.by("id") else Sort.by(validOrders)
    }

    override fun createWarehouse(request: WarehouseRequest): WarehouseDto {
        // Check if warehouse with same name exists
        if (warehouseRepository.existsByName(request.name)) {
            throw IllegalArgumentException("Warehouse with name '${request.name}' already exists")
        }

        // If setting as default, unset current default
        if (request.isDefault) {
            warehouseRepository.findByIsDefault(true).firstOrNull()?.let { currentDefault ->
                currentDefault.isDefault = false
                warehouseRepository.save(currentDefault)
            }
        }


        val warehouse = warehouseMapper.toEntity(request)
        return warehouseMapper.toDto(warehouseRepository.save(warehouse))
    }

    override fun getWarehouseById(id: Long): WarehouseDto {
        val warehouse = warehouseRepository.findByIdOrNull(id)
            ?: throw Exception("Warehouse not found with id: $id")
        return warehouseMapper.toDto(warehouse)
    }

    override fun updateWarehouse(id: Long, request: WarehouseRequest): WarehouseDto {
        val warehouse = warehouseRepository.findByIdOrNull(id)
            ?: throw Exception("Warehouse not found with id: $id")


        // Check if name is being changed and new name already exists
        if (warehouse.name != request.name && warehouseRepository.existsByName(request.name)) {
            throw IllegalArgumentException("Warehouse with name '${request.name}' already exists")
        }

        // If setting as default, unset current default
        if (request.isDefault && !warehouse.isDefault) {
            warehouseRepository.findByIsDefault(true).firstOrNull()?.let { currentDefault ->
                if (currentDefault.id != id) {
                    currentDefault.isDefault = false
                    warehouseRepository.save(currentDefault)
                }
            }
        }
        warehouseMapper.updateEntityFromRequest(request, warehouse)
        warehouse.updatedAt = LocalDateTime.now()
        return warehouseMapper.toDto(warehouseRepository.save(warehouse))
    }

    override fun deleteWarehouse(id: Long) {
        if (!warehouseRepository.existsById(id)) {
            throw Exception("Warehouse not found with id: $id")
        }
        warehouseRepository.deleteById(id)
    }

    @Transactional(readOnly = true)
    override fun getAllWarehouses(pageable: Pageable): Page<WarehouseDto> {
        val sanitizedPageable = PageRequest.of(
            pageable.pageNumber,
            pageable.pageSize,
            sanitizeSort(pageable.sort)
        )

        val page: Page<Warehouse> = warehouseRepository.findAll(sanitizedPageable)
        return page.map(warehouseMapper::toDto)
    }

    @Transactional(readOnly = true)
    override fun searchWarehouses(query: String, pageable: Pageable): Page<WarehouseDto> {
        val warehouses = warehouseRepository.search(query)
        return PageImpl(
            warehouses.map { warehouseMapper.toDto(it) },
            pageable,
            warehouses.size.toLong()
        )
    }

    override fun toggleStatus(id: Long, isActive: Boolean): WarehouseDto {
        val warehouse = warehouseRepository.findByIdOrNull(id)
            ?: throw Exception("Warehouse not found with id: $id")

        warehouse.isActive = isActive
        warehouse.updatedAt = LocalDateTime.now()
        return warehouseMapper.toDto(warehouseRepository.save(warehouse))
    }

    override fun setDefaultWarehouse(id: Long): WarehouseDto {
        val warehouse = warehouseRepository.findByIdOrNull(id)
            ?: throw Exception("Warehouse not found with id: $id")

        // Unset current default
        warehouseRepository.findByIsDefault(true).firstOrNull()?.let { currentDefault ->
            if (currentDefault.id != id) {
                currentDefault.isDefault = false
                warehouseRepository.save(currentDefault)
            }
        }

        // Set new default
        warehouse.isDefault = true
        warehouse.updatedAt = LocalDateTime.now()
        return warehouseMapper.toDto(warehouseRepository.save(warehouse))
    }
}