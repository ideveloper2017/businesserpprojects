package uz.rms.modules.v1.audit.services

import jakarta.servlet.http.HttpServletRequest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import uz.rms.modules.v1.audit.domain.AuditLog
import uz.rms.modules.v1.audit.repository.AuditLogRepository
import java.time.LocalDateTime

@Service
@Transactional
class AuditService(
    @Autowired
    private val auditLogRepository: AuditLogRepository
) {

    fun logAccess(
        userId: Long?,
        username: String,
        action: String,
        resource: String,
        details: String? = null,
        request: HttpServletRequest,
        success: Boolean = true,
        errorMessage: String? = null
    ) {
        val auditLog = AuditLog(
            userId = userId,
            username = username,
            action = action,
            resource = resource,
            details = details,
            ipAddress = getClientIpAddress(request),
            userAgent = request.getHeader("User-Agent"),
            success = success,
            errorMessage = errorMessage
        )

        auditLogRepository.save(auditLog)
    }

    fun logSuccessfulLogin(userId: Long?, username: String, request: HttpServletRequest) {
        logAccess(
            userId = userId,
            username = username,
            action = "LOGIN",
            resource = "AUTH",
            details = "User successfully logged in",
            request = request,
            success = true
        )
    }

    fun logFailedLogin(username: String, request: HttpServletRequest, errorMessage: String? = null) {
        logAccess(
            userId = null,
            username = username,
            action = "LOGIN_FAILED",
            resource = "AUTH",
            details = "Failed login attempt",
            request = request,
            success = false,
            errorMessage = errorMessage
        )
    }

    fun logLogout(userId: Long?, username: String, request: HttpServletRequest) {
        logAccess(
            userId = userId,
            username = username,
            action = "LOGOUT",
            resource = "AUTH",
            details = "User logged out",
            request = request,
            success = true
        )
    }

    fun logRoleAssignment(userId: Long?, username: String, roleName: String, request: HttpServletRequest) {
        logAccess(
            userId = userId,
            username = username,
            action = "ASSIGN_ROLE",
            resource = "USER",
            details = "Role '$roleName' assigned",
            request = request,
            success = true
        )
    }

    fun logRoleRemoval(userId: Long?, username: String, roleName: String, request: HttpServletRequest) {
        logAccess(
            userId = userId,
            username = username,
            action = "REMOVE_ROLE",
            resource = "USER",
            details = "Role '$roleName' removed",
            request = request,
            success = true
        )
    }

    fun logPermissionAccess(
        userId: Long?,
        username: String,
        permission: String,
        resource: String,
        request: HttpServletRequest,
        success: Boolean = true,
        errorMessage: String? = null
    ) {
        logAccess(
            userId = userId,
            username = username,
            action = if (success) "ACCESS_GRANTED" else "ACCESS_DENIED",
            resource = resource,
            details = "Permission check: $permission",
            request = request,
            success = success,
            errorMessage = errorMessage
        )
    }

    fun logUserCreation(userId: Long?, username: String, createdBy: String, request: HttpServletRequest) {
        logAccess(
            userId = userId,
            username = createdBy,
            action = "CREATE_USER",
            resource = "USER",
            details = "User '$username' created",
            request = request,
            success = true
        )
    }

    fun logUserDeletion(userId: Long?, username: String, deletedBy: String, request: HttpServletRequest) {
        logAccess(
            userId = userId,
            username = deletedBy,
            action = "DELETE_USER",
            resource = "USER",
            details = "User '$username' deleted",
            request = request,
            success = true
        )
    }

    fun getAuditLogsByUser(userId: Long): List<AuditLog> {
        return auditLogRepository.findByUserIdOrderByTimestampDesc(userId)
    }

    fun getAuditLogsByUsername(username: String): List<AuditLog> {
        return auditLogRepository.findByUsernameOrderByTimestampDesc(username)
    }

    fun getAuditLogsByAction(action: String): List<AuditLog> {
        return auditLogRepository.findByActionOrderByTimestampDesc(action)
    }

    fun getAuditLogsByResource(resource: String): List<AuditLog> {
        return auditLogRepository.findByResourceOrderByTimestampDesc(resource)
    }

    fun getAuditLogsByDateRange(startDate: LocalDateTime, endDate: LocalDateTime): List<AuditLog> {
        return auditLogRepository.findByTimestampBetweenOrderByTimestampDesc(startDate, endDate)
    }

    private fun getClientIpAddress(request: HttpServletRequest): String {
        val xForwardedForHeader = request.getHeader("X-Forwarded-For")
        if (xForwardedForHeader == null) {
            return request.remoteAddr
        }
        return xForwardedForHeader.split(",").first().trim()
    }
}