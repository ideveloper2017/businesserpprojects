package uz.rms.modules.v1.users.dto

data class UserInfo(
    val id: Long?,
    val username: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val roles: List<RoleDto>,
    val permissions: List<PermissionDto>
)