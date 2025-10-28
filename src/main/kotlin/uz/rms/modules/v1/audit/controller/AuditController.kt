package uz.rms.modules.v1.audit.controller

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import uz.rms.modules.v1.audit.domain.AuditLog
import uz.rms.modules.v1.audit.services.AuditService
import java.time.LocalDateTime

@RestController
@RequestMapping("/api/v1/admin/audit")
@PreAuthorize("hasRole('ADMIN')")
class AuditController(
    @Autowired
    private val auditService: AuditService
) {

    @GetMapping("/logs")
    fun getAllAuditLogs(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "50") size: Int
    ): ResponseEntity<List<AuditLog>> {
        val logs = auditService.getAuditLogsByDateRange(
            LocalDateTime.now().minusDays(30),
            LocalDateTime.now()
        ).take(size)
        return ResponseEntity.ok(logs)
    }

    @GetMapping("/logs/user/{userId}")
    fun getAuditLogsByUser(@PathVariable userId: Long): ResponseEntity<List<AuditLog>> {
        return ResponseEntity.ok(auditService.getAuditLogsByUser(userId))
    }

    @GetMapping("/logs/username/{username}")
    fun getAuditLogsByUsername(@PathVariable username: String): ResponseEntity<List<AuditLog>> {
        return ResponseEntity.ok(auditService.getAuditLogsByUsername(username))
    }

    @GetMapping("/logs/action/{action}")
    fun getAuditLogsByAction(@PathVariable action: String): ResponseEntity<List<AuditLog>> {
        return ResponseEntity.ok(auditService.getAuditLogsByAction(action))
    }

    @GetMapping("/logs/resource/{resource}")
    fun getAuditLogsByResource(@PathVariable resource: String): ResponseEntity<List<AuditLog>> {
        return ResponseEntity.ok(auditService.getAuditLogsByResource(resource))
    }

    @GetMapping("/logs/date-range")
    fun getAuditLogsByDateRange(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) startDate: LocalDateTime,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) endDate: LocalDateTime
    ): ResponseEntity<List<AuditLog>> {
        return ResponseEntity.ok(auditService.getAuditLogsByDateRange(startDate, endDate))
    }

    @GetMapping("/logs/failed")
    fun getFailedAuditLogs(): ResponseEntity<List<AuditLog>> {
        val allLogs = auditService.getAuditLogsByDateRange(
            LocalDateTime.now().minusDays(7),
            LocalDateTime.now()
        )
        val failedLogs = allLogs.filter { !it.success }
        return ResponseEntity.ok(failedLogs)
    }

    @GetMapping("/logs/login-attempts")
    fun getLoginAttempts(): ResponseEntity<List<AuditLog>> {
        val loginLogs = auditService.getAuditLogsByAction("LOGIN")
        val failedLoginLogs = auditService.getAuditLogsByAction("LOGIN_FAILED")
        val allLoginLogs = (loginLogs + failedLoginLogs).sortedByDescending { it.timestamp }
        return ResponseEntity.ok(allLoginLogs)
    }

    @GetMapping("/logs/summary")
    fun getAuditSummary(): ResponseEntity<Map<String, Any>> {
        val last24Hours = auditService.getAuditLogsByDateRange(
            LocalDateTime.now().minusHours(24),
            LocalDateTime.now()
        )
        val last7Days = auditService.getAuditLogsByDateRange(
            LocalDateTime.now().minusDays(7),
            LocalDateTime.now()
        )

        val summary = mapOf(
            "totalLogsLast24Hours" to last24Hours.size,
            "totalLogsLast7Days" to last7Days.size,
            "failedAttemptsLast24Hours" to last24Hours.count { !it.success },
            "failedAttemptsLast7Days" to last7Days.count { !it.success },
            "uniqueUsersLast24Hours" to last24Hours.map { it.username }.distinct().size,
            "uniqueUsersLast7Days" to last7Days.map { it.username }.distinct().size,
            "topActions" to last24Hours.groupBy { it.action }.mapValues { it.value.size },
            "topResources" to last24Hours.groupBy { it.resource }.mapValues { it.value.size }
        )

        return ResponseEntity.ok(summary)
    }
}