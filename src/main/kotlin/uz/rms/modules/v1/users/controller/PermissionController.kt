package uz.rms.modules.v1.users.controller

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.ArraySchema
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import uz.rms.modules.v1.users.domain.Permission
import uz.rms.modules.v1.users.dto.PermissionDto
import uz.rms.modules.v1.users.mapper.PermissionMapper
import uz.rms.common.ApiResponse as AppApiResponse
import uz.rms.modules.v1.users.repository.PermissionRepository

@RestController
@RequestMapping("/api/v1/permissions")
@Tag(name = "Permissions", description = "Permission management endpoints")
class PermissionController(
    private val permissionRepository: PermissionRepository
) {
    @GetMapping
    @Operation(
        summary = "Get all permissions",
        description = "Returns a list of all available permissions in the system",
        security = [SecurityRequirement(name = "bearerAuth")],
        responses = [
            ApiResponse(
                responseCode = "200",
                description = "Successfully retrieved the list of permissions",
                content = [Content(
                    mediaType = "application/json",
                    array = ArraySchema(schema = Schema(implementation = PermissionDto::class))
                )]
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
    fun getAllPermissions(): ResponseEntity<AppApiResponse<List<PermissionDto>>> {
        val permissions = permissionRepository.findAll()
        val permissionDtos = permissions.map { PermissionMapper.toDto(it) }
        return ResponseEntity.ok(AppApiResponse.success(permissionDtos))
    }

    @GetMapping("/{id}")
    @Operation(
        summary = "Get permission by ID",
        description = "Returns a single permission by its ID",
        security = [SecurityRequirement(name = "bearerAuth")],
        responses = [
            ApiResponse(
                responseCode = "200",
                description = "Successfully retrieved the permission",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = Permission::class))]
            ),
            ApiResponse(
                responseCode = "404",
                description = "Permission not found"
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
    fun getPermissionById(
        @Parameter(description = "ID of the permission to retrieve", required = true)
        @PathVariable id: Long
    ): ResponseEntity<AppApiResponse<PermissionDto>> {
        val permission = permissionRepository.findById(id).orElse(null)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND).body(AppApiResponse.error("Permission not found with id: $id"))
        return ResponseEntity.ok(AppApiResponse.success(PermissionMapper.toDto(permission)))
    }

    @PostMapping
    @Operation(
        summary = "Create a new permission",
        description = "Creates a new permission with the provided name",
        security = [SecurityRequirement(name = "bearerAuth")],
        responses = [
            ApiResponse(
                responseCode = "201",
                description = "Permission created successfully",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = Permission::class))]
            ),
            ApiResponse(
                responseCode = "400",
                description = "Invalid permission data provided"
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
    fun createPermission(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            content = [Content(mediaType = "application/json", schema = Schema(implementation = PermissionDto::class))]
        )
        @RequestBody request: PermissionDto
    ): ResponseEntity<AppApiResponse<PermissionDto>> {
        // Check if permission already exists
        if (permissionRepository.existsByName(request.name)) {
            return ResponseEntity.badRequest().body(AppApiResponse.error("Permission with name ${request.name} already exists"))
        }

        val permission = Permission().apply {name = request.name}
        val saved = permissionRepository.save(permission)
        return ResponseEntity.status(HttpStatus.CREATED).body(AppApiResponse.success(PermissionMapper.toDto(saved)))
    }

    @DeleteMapping("/{id}")
    @Operation(
        summary = "Delete a permission",
        description = "Deletes a permission by its ID",
        security = [SecurityRequirement(name = "bearerAuth")],
        responses = [
            ApiResponse(
                responseCode = "204",
                description = "Permission successfully deleted"
            ),
            ApiResponse(
                responseCode = "404",
                description = "Permission not found"
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
    fun deletePermission(
        @Parameter(description = "ID of the permission to delete", required = true)
        @PathVariable id: Long
    ): ResponseEntity<out AppApiResponse<out Any>?> {
        if (!permissionRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(AppApiResponse.error("Permission not found with id: $id"))
        }

        permissionRepository.deleteById(id)
        return ResponseEntity.ok(AppApiResponse.success( "Permission successfully deleted"))
    }
}

//@Schema(description = "Request for creating a new permission")
//data class PermissionRequest(
//    @field:Schema(description = "Permission name", example = "USER_MANAGE", required = true)
//    val name: String
//)
