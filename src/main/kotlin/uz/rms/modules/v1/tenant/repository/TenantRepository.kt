package uz.rms.modules.v1.tenant.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import uz.rms.modules.v1.tenant.domain.Tenant
import java.util.Optional

@Repository
interface TenantRepository : JpaRepository<Tenant, Long> {
    fun findByName(name: String): Optional<Tenant>

    fun findByDomain(domain: String): Optional<Tenant>

    fun existsByName(name: String): Boolean

    fun existsByDomain(domain: String): Boolean

    fun existsByNameOrDomain(name: String, domain: String): Boolean

    @Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END FROM Tenant t WHERE t.name = :name AND t.id != :id")
    fun existsByNameAndIdNot(@Param("name") name: String, @Param("id") id: Long): Boolean

    @Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END FROM Tenant t WHERE t.domain = :domain AND t.id != :id")
    fun existsByDomainAndIdNot(@Param("domain") domain: String, @Param("id") id: Long): Boolean

    fun findByActive(active: Boolean): List<Tenant>
}