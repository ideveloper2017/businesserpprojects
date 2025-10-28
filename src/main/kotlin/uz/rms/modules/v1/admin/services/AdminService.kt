package uz.rms.modules.v1.admin.services

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import uz.rms.modules.v1.users.domain.Permission
import uz.rms.modules.v1.users.domain.Role
import uz.rms.modules.v1.users.repository.PermissionRepository
import uz.rms.modules.v1.users.repository.RoleRepository

@Service
@Transactional
class AdminService(
    @Autowired
    private val roleRepository: RoleRepository,
    @Autowired
    private val permissionRepository: PermissionRepository
) {

    // Role Management
    @PreAuthorize("hasRole('ADMIN')")
    fun createRole(role: Role): Role {
        if (roleRepository.existsByName(role.name)) {
            throw RuntimeException("Role with name ${role.name} already exists")
        }
        return roleRepository.save(role)
    }

    @PreAuthorize("hasRole('ADMIN')")
    fun updateRole(id: Long, updatedRole: Role): Role {
        val role = roleRepository.findById(id).orElseThrow {
            RuntimeException("Role not found")
        }

        if (roleRepository.existsByName(updatedRole.name) && role.name != updatedRole.name) {
            throw RuntimeException("Role with name ${updatedRole.name} already exists")
        }

        role.name = updatedRole.name
        role.description = updatedRole.description
        return roleRepository.save(role)
    }

    @PreAuthorize("hasRole('ADMIN')")
    fun deleteRole(id: Long) {
        val role = roleRepository.findById(id).orElseThrow {
            RuntimeException("Role not found")
        }
        roleRepository.delete(role)
    }

    @PreAuthorize("hasRole('ADMIN')")
    fun getAllRoles(): List<Role> {
        return roleRepository.findAllWithPermissions()
    }

    @PreAuthorize("hasRole('ADMIN')")
    fun getRoleById(id: Long): Role? {
        return roleRepository.findById(id).orElse(null)
    }

    @PreAuthorize("hasRole('ADMIN')")
    fun getRoleByName(name: String): Role? {
        return roleRepository.findByNameWithPermissions(name).orElse(null)
    }

    // Permission Management
    @PreAuthorize("hasRole('ADMIN')")
    fun createPermission(permission: Permission): Permission {
        if (permissionRepository.existsByName(permission.name)) {
            throw RuntimeException("Permission with name ${permission.name} already exists")
        }
        if (permissionRepository.existsByResourceAndAction(permission.resource, permission.action)) {
            throw RuntimeException("Permission with resource ${permission.resource} and action ${permission.action} already exists")
        }
        return permissionRepository.save(permission)
    }

    @PreAuthorize("hasRole('ADMIN')")
    fun updatePermission(id: Long, updatedPermission: Permission): Permission {
        val permission = permissionRepository.findById(id).orElseThrow {
            RuntimeException("Permission not found")
        }

        if (permissionRepository.existsByName(updatedPermission.name) && permission.name != updatedPermission.name) {
            throw RuntimeException("Permission with name ${updatedPermission.name} already exists")
        }
        if (permissionRepository.existsByResourceAndAction(updatedPermission.resource, updatedPermission.action) &&
            (permission.resource != updatedPermission.resource || permission.action != updatedPermission.action)) {
            throw RuntimeException("Permission with resource ${updatedPermission.resource} and action ${updatedPermission.action} already exists")
        }

        permission.name = updatedPermission.name
        permission.description = updatedPermission.description
        permission.resource = updatedPermission.resource
        permission.action = updatedPermission.action
        return permissionRepository.save(permission)
    }

    @PreAuthorize("hasRole('ADMIN')")
    fun deletePermission(id: Long) {
        val permission = permissionRepository.findById(id).orElseThrow {
            RuntimeException("Permission not found")
        }
        permissionRepository.delete(permission)
    }

    @PreAuthorize("hasRole('ADMIN')")
    fun getAllPermissions(): List<Permission> {
        return permissionRepository.findAll()
    }

    @PreAuthorize("hasRole('ADMIN')")
    fun getPermissionById(id: Long): Permission? {
        return permissionRepository.findById(id).orElse(null)
    }

    @PreAuthorize("hasRole('ADMIN')")
    fun getPermissionsByResource(resource: String): List<Permission> {
        return permissionRepository.findByResource(resource)
    }

    // Role-Permission Management
    @PreAuthorize("hasRole('ADMIN')")
    fun assignPermissionToRole(roleId: Long, permissionId: Long) {
        val role = roleRepository.findById(roleId).orElseThrow {
            RuntimeException("Role not found")
        }
        val permission = permissionRepository.findById(permissionId).orElseThrow {
            RuntimeException("Permission not found")
        }

        role.permissions.add(permission)
        roleRepository.save(role)
    }

    @PreAuthorize("hasRole('ADMIN')")
    fun removePermissionFromRole(roleId: Long, permissionId: Long) {
        val role = roleRepository.findById(roleId).orElseThrow {
            RuntimeException("Role not found")
        }
        val permission = permissionRepository.findById(permissionId).orElseThrow {
            RuntimeException("Permission not found")
        }

        role.permissions.remove(permission)
        roleRepository.save(role)
    }

    @PreAuthorize("hasRole('ADMIN')")
    fun getRolePermissions(roleId: Long): Set<Permission> {
        val role = roleRepository.findById(roleId).orElseThrow {
            RuntimeException("Role not found")
        }
        return role.permissions
    }
}