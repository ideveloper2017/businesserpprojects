package uz.rms.modules.v1.tenant.services

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import uz.rms.exception.ResourceNotFoundException
import uz.rms.modules.v1.tenant.domain.Tenant
import uz.rms.modules.v1.tenant.dto.CreateTenantRequest
import uz.rms.modules.v1.tenant.dto.TenantDto
import uz.rms.modules.v1.tenant.dto.UpdateTenantRequest
import uz.rms.modules.v1.tenant.repository.TenantRepository

@Service
@Transactional
class TenantService(
    private val tenantRepository: TenantRepository
) {

    fun createTenant(request: CreateTenantRequest): TenantDto {
        // Check if tenant with same name or domain already exists
        if (tenantRepository.existsByNameOrDomain(request.name, request.domain)) {
            throw IllegalArgumentException("Tenant with this name or domain already exists")
        }

        val tenant = Tenant(
            name = request.name,
            domain = request.domain,
            active = request.active
        )

        val savedTenant = tenantRepository.save(tenant)
        return savedTenant.toDto()
    }

    @Transactional(readOnly = true)
    fun getTenantById(id: Long): TenantDto {
        val tenant = tenantRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Tenant not found with id: $id") }
        return tenant.toDto()
    }

    @Transactional(readOnly = true)
    fun getAllTenants(): List<TenantDto> {
        return tenantRepository.findAll().map { it.toDto() }
    }

    fun updateTenant(id: Long, request: UpdateTenantRequest): TenantDto {
        val tenant = tenantRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Tenant not found with id: $id") }

        request.name?.let { newName ->
            if (tenantRepository.existsByNameAndIdNot(newName, id)) {
                throw IllegalArgumentException("Tenant with name '$newName' already exists")
            }
            tenant.name = newName
        }
        
        request.domain?.let { newDomain ->
            if (tenantRepository.existsByDomainAndIdNot(newDomain, id)) {
                throw IllegalArgumentException("Tenant with domain '$newDomain' already exists")
            }
            tenant.domain = newDomain
        }
        
        request.active?.let { tenant.active = it }

        return tenantRepository.save(tenant).toDto()
    }

    fun deleteTenant(id: Long) {
        if (!tenantRepository.existsById(id)) {
            throw ResourceNotFoundException("Tenant not found with id: $id")
        }
        tenantRepository.deleteById(id)
    }

    fun toggleTenantStatus(id: Long): TenantDto {
        val tenant = tenantRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Tenant not found with id: $id") }
        
        tenant.active = !tenant.active
        return tenantRepository.save(tenant).toDto()
    }

    private fun Tenant.toDto() = TenantDto(
        id = id,
        name = name,
        domain = domain,
        active = active
    )
}
