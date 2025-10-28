package uz.rms.modules.v1.supplier.service

import uz.rms.modules.v1.supplier.dto.SupplierDto

interface SupplierService {
    fun getAll(): List<SupplierDto>
    fun getById(id: Long): SupplierDto
    fun create(dto: SupplierDto): SupplierDto
    fun update(id: Long, dto: SupplierDto): SupplierDto
    fun delete(id: Long)
}
