package uz.rms.modules.v1.users.dto

data class PermissionDto(
    val id: Long? = null,
    val name: String,
    val description: String? = null,
    val resource: String? = null,
    val action: String? = null
)