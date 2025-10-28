package uz.rms.modules.v1.warehouse.controller

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import uz.rms.modules.v1.warehouse.dto.WarehouseDto
import uz.rms.modules.v1.warehouse.dto.WarehouseRequest
import uz.rms.modules.v1.warehouse.service.WarehouseService

@RestController
@RequestMapping("/api/v1/warehouses")
class WarehouseController(
    private val warehouseService: WarehouseService
) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createWarehouse(@RequestBody request: WarehouseRequest): WarehouseDto {
        return warehouseService.createWarehouse(request)
    }

    @GetMapping("/{id}")
    fun getWarehouseById(@PathVariable id: Long): WarehouseDto {
        return warehouseService.getWarehouseById(id)
    }

    @PutMapping("/{id}")
    fun updateWarehouse(
        @PathVariable id: Long,
        @RequestBody request: WarehouseRequest
    ): WarehouseDto {
        return warehouseService.updateWarehouse(id, request)
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteWarehouse(@PathVariable id: Long) {
        warehouseService.deleteWarehouse(id)
    }

    @GetMapping
    fun getAllWarehouses(
        @PageableDefault(sort = ["id"], direction = Sort.Direction.ASC) pageable: Pageable
    ): Page<WarehouseDto> {
        return warehouseService.getAllWarehouses(pageable)
    }

    @PatchMapping("/{id}/status")
    fun toggleWarehouseStatus(
        @PathVariable id: Long,
        @RequestParam isActive: Boolean
    ): WarehouseDto {
        return warehouseService.toggleStatus(id, isActive)
    }

    @PatchMapping("/{id}/set-default")
    fun setDefaultWarehouse(@PathVariable id: Long): WarehouseDto {
        return warehouseService.setDefaultWarehouse(id)
    }
}