package uz.rms.modules.v1.auth.dto

import uz.rms.modules.v1.users.dto.PermissionDto
import uz.rms.modules.v1.users.dto.RoleDto

data class AuthResponse(
    val token: String,
    val type: String = "Bearer",
    val id: Long?,
    val username: String,
    val email: String,
    val roles: List<RoleDto>,
    val permissions: List<PermissionDto>
)