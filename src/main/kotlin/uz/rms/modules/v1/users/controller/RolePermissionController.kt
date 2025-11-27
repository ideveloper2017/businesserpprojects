package uz.idev.app.v1.user.controller

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import uz.rms.modules.v1.users.domain.Role
import uz.rms.modules.v1.users.repository.PermissionRepository
import uz.rms.modules.v1.users.repository.RoleRepository
import uz.rms.common.ApiResponse as AppApiResponse

import java.io.Serializable

@RestController
@RequestMapping("/api/v1/role-permissions")
@Tag(name = "Role Permissions", description = "Role-Permission association management endpoints")
class RolePermissionController(
    private val roleRepository: RoleRepository,
    private val permissionRepository: PermissionRepository
) {

    @PostMapping("/assign")
    @Operation(
        summary = "Assign permissions to a role",
        description = "Assigns a list of permissions to a specific role",
        security = [SecurityRequirement(name = "bearerAuth")],
        responses = [
            ApiResponse(
                responseCode = "200",
                description = "Permissions successfully assigned to role",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = Role::class))]
            ),
            ApiResponse(
                responseCode = "404",
                description = "Role or Permission not found"
            ),
            ApiResponse(
                responseCode = "401",
                description = "Unauthorized"
            ),
            ApiResponse(
                responseCode = "403",
                description = "Forbidden - insufficient permissions"
            )
        ]
    )
    fun assignPermissionsToRole(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            content = [Content(mediaType = "application/json", schema = Schema(implementation = RolePermissionRequest::class))]
        )
        @RequestBody request: RolePermissionRequest
    ): ResponseEntity<out AppApiResponse<out Serializable>?> {
        // Find the role
        val role = roleRepository.findById(request.roleId).orElse(null)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND).body(AppApiResponse.error("Role not found with id: ${request.roleId}"))

        // Find all permissions
        val permissions = permissionRepository.findAllById(request.permissionIds).toMutableSet()
        if (permissions.size != request.permissionIds.size) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(AppApiResponse.error("Some permissions were not found"))
        }

        // Assign permissions to role
        role.permissions = permissions
        val updatedRole = roleRepository.save(role)

        return ResponseEntity.ok(AppApiResponse.success("Permissions successfully assigned to role"))
    }

    @PostMapping("/remove")
    @Operation(
        summary = "Remove permissions from a role",
        description = "Removes a list of permissions from a specific role",
        security = [SecurityRequirement(name = "bearerAuth")],
        responses = [
            ApiResponse(
                responseCode = "200",
                description = "Permissions successfully removed from role",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = Role::class))]
            ),
            ApiResponse(
                responseCode = "404",
                description = "Role not found"
            ),
            ApiResponse(
                responseCode = "401",
                description = "Unauthorized"
            ),
            ApiResponse(
                responseCode = "403",
                description = "Forbidden - insufficient permissions"
            )
        ]
    )
    fun removePermissionsFromRole(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            content = [Content(mediaType = "application/json", schema = Schema(implementation = RolePermissionRequest::class))]
        )
        @RequestBody request: RolePermissionRequest
    ): ResponseEntity<out AppApiResponse<out Serializable>?> {
        // Find the role
        val role = roleRepository.findById(request.roleId).orElse(null)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND).body(AppApiResponse.error("Role not found with id: ${request.roleId}"))

        // Find all permissions to remove
        val permissionsToRemove = permissionRepository.findAllById(request.permissionIds)

        // Remove permissions from role
        role.permissions.removeAll(permissionsToRemove)
        val updatedRole = roleRepository.save(role)

        return ResponseEntity.ok(AppApiResponse.success( "Permissions successfully removed from role"))
    }

    @GetMapping("/role/{roleId}/permissions")
    @Operation(
        summary = "Get all permissions for a role",
        description = "Returns a list of all permissions assigned to a specific role",
        security = [SecurityRequirement(name = "bearerAuth")],
        responses = [
            ApiResponse(
                responseCode = "200",
                description = "Successfully retrieved permissions for role",
                content = [Content(mediaType = "application/json")]
            ),
            ApiResponse(
                responseCode = "404",
                description = "Role not found"
            ),
            ApiResponse(
                responseCode = "401",
                description = "Unauthorized"
            ),
            ApiResponse(
                responseCode = "403",
                description = "Forbidden - insufficient permissions"
            )
        ]
    )
    fun getPermissionsForRole(
        @Parameter(description = "ID of the role", required = true)
        @PathVariable roleId: Long
    ): ResponseEntity<AppApiResponse<Set<String>>> {
        val role = roleRepository.findById(roleId).orElse(null)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND).body(AppApiResponse.error("Role not found with id: $roleId"))

        val permissionNames = role.permissions.map { it.name }.toSet()
        return ResponseEntity.ok(AppApiResponse.success(permissionNames))
    }
}

@Schema(description = "Request for role-permission assignment")
data class RolePermissionRequest(
    @field:Schema(description = "Role ID", example = "1", required = true)
    val roleId: Long,

    @field:Schema(description = "List of permission IDs", required = true)
    val permissionIds: List<Long>
)
