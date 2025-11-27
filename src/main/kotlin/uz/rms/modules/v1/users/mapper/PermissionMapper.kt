package uz.rms.modules.v1.users.mapper

import uz.rms.modules.v1.users.domain.Permission
import uz.rms.modules.v1.users.dto.PermissionDto


object PermissionMapper {
    fun toDto(permission: Permission): PermissionDto {
        return PermissionDto(
            id = permission.id,
            name = permission.name,
            // Add other fields as needed
        )
    }

    // Optionally add fromDto method if needed
    // fun fromDto(dto: PermissionDto): Permission { ... }
}