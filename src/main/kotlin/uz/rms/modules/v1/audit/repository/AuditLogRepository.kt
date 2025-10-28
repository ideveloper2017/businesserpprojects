package uz.rms.modules.v1.audit.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import uz.rms.modules.v1.audit.domain.AuditLog
import java.time.LocalDateTime

@Repository
interface AuditLogRepository : JpaRepository<AuditLog, Long> {

    fun findByUserIdOrderByTimestampDesc(userId: Long): List<AuditLog>

    fun findByUsernameOrderByTimestampDesc(username: String): List<AuditLog>

    fun findByActionOrderByTimestampDesc(action: String): List<AuditLog>

    fun findByResourceOrderByTimestampDesc(resource: String): List<AuditLog>

    fun findBySuccessOrderByTimestampDesc(success: Boolean): List<AuditLog>

    @Query("SELECT a FROM AuditLog a WHERE a.timestamp BETWEEN :startDate AND :endDate ORDER BY a.timestamp DESC")
    fun findByTimestampBetweenOrderByTimestampDesc(
        @Param("startDate") startDate: LocalDateTime,
        @Param("endDate") endDate: LocalDateTime
    ): List<AuditLog>

    @Query("SELECT a FROM AuditLog a WHERE a.username = :username AND a.timestamp BETWEEN :startDate AND :endDate ORDER BY a.timestamp DESC")
    fun findByUsernameAndTimestampBetween(
        @Param("username") username: String,
        @Param("startDate") startDate: LocalDateTime,
        @Param("endDate") endDate: LocalDateTime
    ): List<AuditLog>
}