package uz.rms.modules.v1.admin.controller

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import uz.rms.modules.v1.admin.services.AdminService
import uz.rms.modules.v1.users.domain.Permission
import uz.rms.modules.v1.users.domain.Role

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
class AdminController(
    @Autowired
    private val adminService: AdminService
) {

    // Role Management Endpoints
    @GetMapping("/roles")
    fun getAllRoles(): ResponseEntity<List<Role>> {
        return ResponseEntity.ok(adminService.getAllRoles())
    }

    @GetMapping("/roles/{id}")
    fun getRoleById(@PathVariable id: Long): ResponseEntity<Role> {
        val role = adminService.getRoleById(id)
        return if (role != null) {
            ResponseEntity.ok(role)
        } else {
            ResponseEntity.notFound().build()
        }
    }

    @GetMapping("/roles/name/{name}")
    fun getRoleByName(@PathVariable name: String): ResponseEntity<Role> {
        val role = adminService.getRoleByName(name)
        return if (role != null) {
            ResponseEntity.ok(role)
        } else {
            ResponseEntity.notFound().build()
        }
    }

    @PostMapping("/roles")
    fun createRole(@RequestBody role: Role): ResponseEntity<Role> {
        return try {
            ResponseEntity.ok(adminService.createRole(role))
        } catch (e: RuntimeException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PutMapping("/roles/{id}")
    fun updateRole(@PathVariable id: Long, @RequestBody role: Role): ResponseEntity<Role> {
        return try {
            ResponseEntity.ok(adminService.updateRole(id, role))
        } catch (e: RuntimeException) {
            ResponseEntity.notFound().build()
        }
    }

    @DeleteMapping("/roles/{id}")
    fun deleteRole(@PathVariable id: Long): ResponseEntity<Void> {
        return try {
            adminService.deleteRole(id)
            ResponseEntity.noContent().build()
        } catch (e: RuntimeException) {
            ResponseEntity.notFound().build()
        }
    }

    // Permission Management Endpoints
    @GetMapping("/permissions")
    fun getAllPermissions(): ResponseEntity<List<Permission>> {
        return ResponseEntity.ok(adminService.getAllPermissions())
    }

    @GetMapping("/permissions/{id}")
    fun getPermissionById(@PathVariable id: Long): ResponseEntity<Permission> {
        val permission = adminService.getPermissionById(id)
        return if (permission != null) {
            ResponseEntity.ok(permission)
        } else {
            ResponseEntity.notFound().build()
        }
    }

    @GetMapping("/permissions/resource/{resource}")
    fun getPermissionsByResource(@PathVariable resource: String): ResponseEntity<List<Permission>> {
        return ResponseEntity.ok(adminService.getPermissionsByResource(resource))
    }

    @PostMapping("/permissions")
    fun createPermission(@RequestBody permission: Permission): ResponseEntity<Permission> {
        return try {
            ResponseEntity.ok(adminService.createPermission(permission))
        } catch (e: RuntimeException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PutMapping("/permissions/{id}")
    fun updatePermission(@PathVariable id: Long, @RequestBody permission: Permission): ResponseEntity<Permission> {
        return try {
            ResponseEntity.ok(adminService.updatePermission(id, permission))
        } catch (e: RuntimeException) {
            ResponseEntity.notFound().build()
        }
    }

    @DeleteMapping("/permissions/{id}")
    fun deletePermission(@PathVariable id: Long): ResponseEntity<Void> {
        return try {
            adminService.deletePermission(id)
            ResponseEntity.noContent().build()
        } catch (e: RuntimeException) {
            ResponseEntity.notFound().build()
        }
    }

    // Role-Permission Management Endpoints
    @PostMapping("/roles/{roleId}/permissions/{permissionId}")
    fun assignPermissionToRole(@PathVariable roleId: Long, @PathVariable permissionId: Long): ResponseEntity<String> {
        return try {
            adminService.assignPermissionToRole(roleId, permissionId)
            ResponseEntity.ok("Permission assigned to role successfully")
        } catch (e: RuntimeException) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @DeleteMapping("/roles/{roleId}/permissions/{permissionId}")
    fun removePermissionFromRole(@PathVariable roleId: Long, @PathVariable permissionId: Long): ResponseEntity<String> {
        return try {
            adminService.removePermissionFromRole(roleId, permissionId)
            ResponseEntity.ok("Permission removed from role successfully")
        } catch (e: RuntimeException) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @GetMapping("/roles/{roleId}/permissions")
    fun getRolePermissions(@PathVariable roleId: Long): ResponseEntity<Set<Permission>> {
        return try {
            ResponseEntity.ok(adminService.getRolePermissions(roleId))
        } catch (e: RuntimeException) {
            ResponseEntity.notFound().build()
        }
    }

    // System Status Endpoints
    @GetMapping("/status")
    fun getSystemStatus(): ResponseEntity<Map<String, Any>> {
        val totalRoles = adminService.getAllRoles().size
        val totalPermissions = adminService.getAllPermissions().size

        val status = mapOf(
            "totalRoles" to totalRoles,
            "totalPermissions" to totalPermissions,
            "systemStatus" to "ACTIVE"
        )

        return ResponseEntity.ok(status)
    }
}