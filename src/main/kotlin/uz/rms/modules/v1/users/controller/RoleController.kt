package uz.rms.modules.v1.users.controller
import org.springframework.web.bind.annotation.*
import org.springframework.http.ResponseEntity
import org.springframework.http.HttpStatus
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.media.ArraySchema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.tags.Tag
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import uz.rms.modules.v1.users.services.RoleService
import uz.rms.modules.v1.users.dto.RoleDto
import kotlin.collections.map
import uz.rms.common.ApiResponse as AppApiResponse

@RestController
@RequestMapping("/api/v1/roles")
@Tag(name = "Roles", description = "Role management endpoints")
class RoleController(
    private val roleService: RoleService
) {
    @GetMapping
    @Operation(
        summary = "Get all roles",
        description = "Returns a list of all available roles in the system",
        security = [SecurityRequirement(name = "bearerAuth")],
        responses = [
            ApiResponse(
                responseCode = "200",
                description = "Successfully retrieved the list of roles",
                content = [Content(mediaType = "application/json", array = ArraySchema(schema = Schema(implementation = RoleDto::class)))]
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
    fun getRoles(): ResponseEntity<AppApiResponse<List<RoleDto>>> {
        val permissionDtos = roleService.getAllRoles().map { RoleDto.fromEntity(it) }
        return ResponseEntity.ok(AppApiResponse.success(permissionDtos))
    }

    @GetMapping("/{id}")
    @Operation(
        summary = "Get role by ID",
        description = "Returns a single role by its ID",
        security = [SecurityRequirement(name = "bearerAuth")],
        responses = [
            ApiResponse(
                responseCode = "200",
                description = "Successfully retrieved the role",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = RoleDto::class))]
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
    fun getRole(
        @Parameter(description = "ID of the role to retrieve", required = true)
        @PathVariable id: Long
    ): ResponseEntity<RoleDto> {
        val role = roleService.getRoleById(id) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(RoleDto.Companion.fromEntity(role))
    }

    @PostMapping
    @Operation(
        summary = "Create a new role",
        description = "Creates a new role with the provided details",
        security = [SecurityRequirement(name = "bearerAuth")],
        responses = [
            ApiResponse(
                responseCode = "201",
                description = "Role created successfully",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = RoleDto::class))]
            ),
            ApiResponse(
                responseCode = "400",
                description = "Invalid role data provided"
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
    fun createRole(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            content = [Content(mediaType = "application/json", schema = Schema(implementation = RoleDto::class))]
        )
        @RequestBody roleDto: RoleDto
    ): ResponseEntity<RoleDto> {
        val saved = roleService.saveRole(roleDto)
        return ResponseEntity.status(HttpStatus.CREATED).body(RoleDto.Companion.fromEntity(saved))
    }

    @PutMapping("/{id}")
    @Operation(
        summary = "Update an existing role",
        description = "Updates the details of an existing role",
        security = [SecurityRequirement(name = "bearerAuth")],
        responses = [
            ApiResponse(
                responseCode = "200",
                description = "Role updated successfully",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = RoleDto::class))]
            ),
            ApiResponse(
                responseCode = "400",
                description = "Invalid role data provided"
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
    fun updateRole(
        @Parameter(description = "ID of the role to update", required = true)
        @PathVariable id: Long,
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            content = [Content(mediaType = "application/json", schema = Schema(implementation = RoleDto::class))]
        )
        @RequestBody roleDto: RoleDto
    ): ResponseEntity<RoleDto> {
        // Ensure the path ID matches the DTO ID
        val updatedDto = roleDto.copy(id = id)
        val updated = roleService.saveRole(updatedDto)
        return ResponseEntity.ok(RoleDto.Companion.fromEntity(updated))
    }

    @DeleteMapping("/{id}")
    @Operation(
        summary = "Delete a role",
        description = "Deletes a role by its ID",
        security = [SecurityRequirement(name = "bearerAuth")],
        responses = [
            ApiResponse(
                responseCode = "204",
                description = "Role successfully deleted"
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
    fun deleteRole(
        @Parameter(description = "ID of the role to delete", required = true)
        @PathVariable id: Long
    ): ResponseEntity<Void> {
        return if (roleService.deleteRole(id)) {
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }
}