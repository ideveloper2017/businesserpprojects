package uz.rms.modules.v1.users.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import uz.rms.modules.v1.users.domain.Permission
import java.util.*

@Repository
interface PermissionRepository : JpaRepository<Permission, Long> {

    fun findByName(name: String): Optional<Permission>

    @Query("SELECT p FROM Permission p LEFT JOIN FETCH p.roles WHERE p.resource = :resource AND p.action = :action")
    fun findByResourceAndAction(@Param("resource") resource: String, @Param("action") action: String): Optional<Permission>

    fun existsByName(name: String): Boolean

    fun existsByResourceAndAction(resource: String, action: String): Boolean

    @Query("SELECT p FROM Permission p LEFT JOIN FETCH p.roles WHERE p.resource = :resource")
    fun findByResource(@Param("resource") resource: String): List<Permission>

    @Query("SELECT p FROM Permission p LEFT JOIN FETCH p.roles WHERE p.resource = :resource AND p.action IN :actions")
    fun findByResourceAndActionsIn(@Param("resource") resource: String, @Param("actions") actions: List<String>): List<Permission>
}
