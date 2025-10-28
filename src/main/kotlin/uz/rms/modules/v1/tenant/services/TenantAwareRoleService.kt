package uz.rms.modules.v1.tenant.services

import jakarta.persistence.EntityNotFoundException
import org.springframework.stereotype.Service
import uz.rms.modules.v1.tenant.repository.TenantRepository
import uz.rms.modules.v1.users.domain.Role
import uz.rms.modules.v1.users.repository.RoleRepository


@Service
class TenantAwareRoleService(
    private val roleRepository: RoleRepository,
    private val tenantRepository: TenantRepository
) {
    fun resolveRolesForTenant(tenantId: Long, roleNames: Set<String>): Set<Role> {
        val tenant = tenantRepository.findById(tenantId)
            .orElseThrow { EntityNotFoundException("Tenant not found") }
            
        return roleRepository.findAllByNameInAndTenantId(roleNames, tenant?.id).toSet()
    }
}