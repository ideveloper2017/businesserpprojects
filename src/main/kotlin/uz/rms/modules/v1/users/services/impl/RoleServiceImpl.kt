package uz.rms.modules.v1.users.services.impl

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

import uz.rms.modules.v1.users.services.RoleService
import uz.rms.modules.v1.users.domain.Role
import uz.rms.modules.v1.users.dto.RoleDto
import uz.rms.modules.v1.users.repository.PermissionRepository
import uz.rms.modules.v1.users.repository.RoleRepository

@Service
class RoleServiceImpl(
    private val roleRepository: RoleRepository,
    private val permissionRepository: PermissionRepository
) : RoleService(roleRepository, permissionRepository) {

    override fun getAllRoles(): List<Role> {
        return roleRepository.findAll()
    }

    override fun getRoleById(id: Long): Role? {
        return roleRepository.findById(id).orElse(null)
    }

    @Transactional
    override fun saveRole(roleDto: RoleDto): Role {
        // Check if name already exists for new roles
        if (roleDto.id == null && roleRepository.findByName(roleDto.name) != null) {
            throw IllegalArgumentException("Role with name ${roleDto.name} already exists")
        }

        // Create new role or get existing one
        val role = if (roleDto.id != null) {
            roleRepository.findById(roleDto.id).orElseThrow {
                RuntimeException("Role not found with id: ${roleDto.id}")
            }
        } else {
            Role().apply { name = roleDto.name}
        }

        // Check if name is being changed and if it's already taken
        if (roleDto.id != null && role.name != roleDto.name && roleRepository.findByName(roleDto.name) != null) {
            throw IllegalArgumentException("Role with name ${roleDto.name} already exists")
        }

        // Update role properties
        role.name = roleDto.name

        // Update permissions
        if (roleDto.permissionIds.isNotEmpty()) {
            val permissions = permissionRepository.findAllById(roleDto.permissionIds).toMutableSet()
            role.permissions = permissions
        }

        return roleRepository.save(role)
    }

    @Transactional
    override fun deleteRole(id: Long): Boolean {
        return if (roleRepository.existsById(id)) {
            roleRepository.deleteById(id)
            true
        } else {
            false
        }
    }

}
