package uz.rms.modules.v1.users.services


import org.springframework.stereotype.Service
import uz.rms.modules.v1.users.dto.PermissionDto

@Service
interface PermissionService {
    fun getAllPermissions(): List<PermissionDto>
    fun getPermissionById(id: Long): PermissionDto
    fun createPermission(permissionDto: PermissionDto): PermissionDto
    fun updatePermission(id: Long, permissionDto: PermissionDto): PermissionDto
    fun deletePermission(id: Long)
}


