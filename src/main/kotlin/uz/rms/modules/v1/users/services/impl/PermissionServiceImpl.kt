package uz.rms.modules.v1.users.services.impl

import jakarta.persistence.EntityNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

import uz.rms.modules.v1.users.services.PermissionService
import uz.rms.modules.v1.users.domain.Permission
import uz.rms.modules.v1.users.dto.PermissionDto
import uz.rms.modules.v1.users.repository.PermissionRepository

@Service
class PermissionServiceImpl(
    private val permissionRepository: PermissionRepository
) : PermissionService {

    override fun getAllPermissions(): List<PermissionDto> {
        return permissionRepository.findAll().map { PermissionDto.fromPermission(it) }
    }

    override fun getPermissionById(id: Long): PermissionDto {
        val permission = permissionRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Permission not found with id: $id") }
        return PermissionDto.fromPermission(permission)
    }

    @Transactional
    override fun createPermission(permissionDto: PermissionDto): PermissionDto {
        if (permissionRepository.existsByName(permissionDto.name)) {
            throw IllegalArgumentException("Permission with name ${permissionDto.name} already exists")
        }

        val permission = Permission().apply { name = permissionDto.name}
        val savedPermission = permissionRepository.save(permission)
        return PermissionDto.fromPermission(savedPermission)
    }

    @Transactional
    override fun updatePermission(id: Long, permissionDto: PermissionDto): PermissionDto {
        val existingPermission = permissionRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Permission not found with id: $id") }

        // Check if name is being changed and if it's already taken
        if (existingPermission.name != permissionDto.name && permissionRepository.existsByName(permissionDto.name)) {
            throw IllegalArgumentException("Permission with name ${permissionDto.name} already exists")
        }

        existingPermission.name = permissionDto.name
        val updatedPermission = permissionRepository.save(existingPermission)
        return PermissionDto.fromPermission(updatedPermission)
    }

    @Transactional
    override fun deletePermission(id: Long) {
        if (!permissionRepository.existsById(id)) {
            throw EntityNotFoundException("Permission not found with id: $id")
        }
        permissionRepository.deleteById(id)
    }
}
