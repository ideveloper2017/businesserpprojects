package uz.rms.modules.v1.users.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import uz.rms.modules.v1.tenant.domain.Tenant
import uz.rms.modules.v1.users.domain.User
import java.util.*

@Repository
interface UserRepository : JpaRepository<User, Long> {
    fun findByLoginAndTenantId(login: String, tenantId: Long): User?

    fun findByLogin(login: String): Optional<User>

    fun findByEmail(email: String): Optional<User>

    fun existsByLogin(login: String): Boolean
    fun existsByLoginAndTenant(login: String, tenantId: Tenant): Boolean

    fun existsByLoginAndIdNot(login: String, id: Long): Boolean
    fun existsByLoginAndTenantId(login: String, tenantId: Long): Boolean
    fun existsByEmail(email: String): Boolean

    @Query("SELECT u FROM User u WHERE u.login = :username OR u.email = :email")
    fun findByUsernameOrEmail(@Param("username") username: String, @Param("email") email: String): Optional<User>

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles LEFT JOIN FETCH u.permissions WHERE u.login = :username")
    fun findByUsernameWithRolesAndPermissions(@Param("username") username: String): Optional<User>
}
