package uz.idev.app.v1.user.dto

data class RolePermissionDto(
    val roleId: Long,
    val permissionIds: List<Long>
)
