package uz.rms.modules.v1.users.dto

import io.swagger.v3.oas.annotations.media.Schema
import uz.rms.modules.v1.users.domain.Role


@Schema(description = "Role data transfer object")
data class RoleDto(
    @Schema(description = "Role ID", example = "1", required = false)
    val id: Long? = null,

    @Schema(description = "Role name", example = "MANAGER", required = true)
    val name: String,

    @Schema(description = "List of permission IDs associated with this role", required = false)
    val permissionIds: Set<Long> = emptySet()
) {
    companion object {
        fun fromEntity(role: Role): RoleDto = RoleDto(
            id = role.id,
            name = role.name,
            permissionIds = role.permissions.map { it.id!! }.toSet()
        )
    }
}
