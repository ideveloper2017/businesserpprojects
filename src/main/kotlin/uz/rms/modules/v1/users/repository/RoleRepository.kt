package uz.rms.modules.v1.users.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import uz.rms.modules.v1.tenant.domain.Tenant

import uz.rms.modules.v1.users.domain.Role
import java.util.*

@Repository
interface RoleRepository : JpaRepository<Role, Long> {

    fun findByNameAndTenant(name: String, tenant: Tenant): Role?

    @Query("SELECT r FROM Role r WHERE r.name IN :names AND r.tenant.id = :tenantId")
    fun findAllByNameInAndTenantId(names: Collection<String>, @Param("tenantId") tenantId: Long?): List<Role>

    @Query("SELECT r FROM Role r WHERE r.name = :name AND r.tenant.id = :tenantId")
    fun findByNameAndTenantId(@Param("name") name: String, @Param("tenantId") tenantId: Long): Role?

    fun findByName(name: String): Optional<Role>

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM Role r WHERE r.name = :name AND r.tenant.id = :tenantId")
    fun existsByNameAndTenantId(@Param("name") name: String, @Param("tenantId") tenantId: Long): Boolean
    
    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM Role r WHERE r.name = :name")
    fun existsByName(@Param("name") name: String): Boolean

    @Query("SELECT r FROM Role r LEFT JOIN FETCH r.permissions WHERE r.name = :name")
    fun findByNameWithPermissions(@Param("name") name: String): Optional<Role>

    @Query("SELECT r FROM Role r LEFT JOIN FETCH r.permissions")
    fun findAllWithPermissions(): List<Role>
}
