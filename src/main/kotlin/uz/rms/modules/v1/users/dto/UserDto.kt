package uz.rms.modules.v1.user.dto

import uz.rms.modules.v1.tenant.domain.Tenant
import uz.rms.modules.v1.users.domain.User
import uz.rms.modules.v1.users.dto.PermissionDto


data class UserDto(
    val id: Long? = null,
    val username: String,
    val password: String,
    val phone: String,
    val email: String,
    val firstName: String? = null,
    val lastName: String? = null,
    val active: Boolean = true,
    val roleIds: List<Long> = emptyList(),
    val permissions: List<PermissionDto> = emptyList(),
    val domain: String?=null
) {
    companion object {
        fun fromUser(user: User?): UserDto? {
            return user?.let {
                UserDto(
                    id = it.id,
                    username = it.username,
                    password = it.password,
                    phone = it.phone,
                    email = it.email,
                    firstName = it.firstName,
                    lastName = it.lastName,
                    active = it.enabled,
                    roleIds = it.roles.mapNotNull { role -> role.id },
                    permissions = it.permissions.map { PermissionDto(it.id, it.name) }
                )
            }
        }
    }
}