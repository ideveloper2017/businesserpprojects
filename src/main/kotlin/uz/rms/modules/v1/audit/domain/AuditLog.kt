package uz.rms.modules.v1.audit.domain

import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import uz.rms.common.BaseEntity
import java.time.LocalDateTime

@Entity
@Table(name = "audit_logs")
@EntityListeners(AuditingEntityListener::class)
data class AuditLog(
    @Column(name = "user_id")
    var userId: Long? = null,

    @Column(nullable = false)
    var username: String,

    @Column(nullable = false)
    var action: String,

    @Column(nullable = false)
    var resource: String,

    @Column(length = 1000)
    var details: String?,

    @Column(nullable = false)
    var ipAddress: String,

    @Column(nullable = false)
    var userAgent: String?,

    @Column(nullable = false)
    var success: Boolean,

    @Column
    var errorMessage: String?,

    @CreatedDate
    @Column(name = "timestamp", nullable = false)
    var timestamp: LocalDateTime? = null

) : BaseEntity() {

    override fun toString(): String {
        return "AuditLog(userId=$userId, username='$username', action='$action', resource='$resource', success=$success, timestamp=$timestamp)"
    }
}
