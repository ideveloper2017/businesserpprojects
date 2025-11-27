package uz.rms.modules.v1.users.services

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import uz.rms.modules.v1.users.domain.Role
import uz.rms.modules.v1.users.dto.RoleDto
import uz.rms.modules.v1.users.repository.PermissionRepository
import uz.rms.modules.v1.users.repository.RoleRepository


@Service
class RoleService(
    private val roleRepository: RoleRepository,
    private val permissionRepository: PermissionRepository
) {
    fun getAllRoles(): List<Role> = roleRepository.findAll()

    fun getRoleById(id: Long): Role? = roleRepository.findById(id).orElse(null)

    @Transactional
    fun saveRole(roleDto: RoleDto): Role {
        // Create new role or get existing one
        val role = if (roleDto.id != null) {
            roleRepository.findById(roleDto.id).orElseThrow {
                RuntimeException("Role not found with id: ${roleDto.id}")
            }
        } else {
            Role().apply { name = roleDto.name}
        }

        // Update role properties
        role.name = roleDto.name

        // Update permissions
        if (roleDto.permissionIds.isNotEmpty()) {
            val permissions = permissionRepository.findAllById(roleDto.permissionIds)
            role.permissions = permissions.toMutableSet()
        }

        return roleRepository.save(role)
    }

    @Transactional
    fun deleteRole(id: Long): Boolean {
        return if (roleRepository.existsById(id)) {
            roleRepository.deleteById(id)
            true
        } else {
            false
        }
    }
}
