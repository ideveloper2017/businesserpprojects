package uz.rms.security

import jakarta.servlet.http.HttpServletRequest
import org.aspectj.lang.ProceedingJoinPoint
import org.aspectj.lang.annotation.Around
import org.aspectj.lang.annotation.Aspect
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.context.request.RequestContextHolder
import org.springframework.web.context.request.ServletRequestAttributes
import uz.rms.modules.v1.audit.services.AuditService
import uz.rms.modules.v1.auth.dto.LoginRequest
import uz.rms.modules.v1.users.domain.User


@Aspect
@Component
class SecurityAuditAspect(
    @Autowired
    private val auditService: AuditService
) {

    @Around("@annotation(preAuthorize)")
    fun auditMethodAccess(joinPoint: ProceedingJoinPoint, preAuthorize: PreAuthorize): Any? {
        val request = getCurrentRequest()
        val authentication = SecurityContextHolder.getContext().authentication
        val startTime = System.currentTimeMillis()

        var success = true
        var errorMessage: String? = null
        var result: Any? = null

        try {
            result = joinPoint.proceed()
        } catch (e: Exception) {
            success = false
            errorMessage = e.message
            throw e
        } finally {
            val endTime = System.currentTimeMillis()
            val executionTime = endTime - startTime

            if (authentication != null && authentication.isAuthenticated) {
                val username = authentication.name
                val userId = if (authentication.principal is User) {
                    (authentication.principal as User).id
                } else null

                val methodName = "${joinPoint.signature.declaringTypeName}.${joinPoint.signature.name}"
                val details = buildMethodDetails(joinPoint, executionTime, success)

                auditService.logPermissionAccess(
                    userId = userId,
                    username = username,
                    permission = preAuthorize.value,
                    resource = extractResourceFromMethod(methodName),
                    request = request,
                    success = success,
                    errorMessage = errorMessage
                )
            }
        }

        return result
    }

    @Around("execution(* uz.rms.modules.v1.admin.controller.AdminController.*(..))")
    fun auditAdminOperations(joinPoint: ProceedingJoinPoint): Any? {
        val request = getCurrentRequest()
        val authentication = SecurityContextHolder.getContext().authentication
        val startTime = System.currentTimeMillis()

        var success = true
        var errorMessage: String? = null
        var result: Any? = null

        try {
            result = joinPoint.proceed()
        } catch (e: Exception) {
            success = false
            errorMessage = e.message
            throw e
        } finally {
            val endTime = System.currentTimeMillis()
            val executionTime = endTime - startTime

            if (authentication != null && authentication.isAuthenticated) {
                val username = authentication.name
                val userId = if (authentication.principal is User) {
                    (authentication.principal as User).id
                } else null

                val methodName = "${joinPoint.signature.declaringTypeName}.${joinPoint.signature.name}"
                val action = extractActionFromMethod(joinPoint.signature.name)
                val details = buildMethodDetails(joinPoint, executionTime, success)

                auditService.logAccess(
                    userId = userId,
                    username = username,
                    action = action,
                    resource = "ADMIN",
                    details = details,
                    request = request,
                    success = success,
                    errorMessage = errorMessage
                )
            }
        }

        return result
    }

    @Around("execution(* uz.rms.modules.v1.auth.controller.AuthenticationController.authenticateUser(..))")
    fun auditLogin(joinPoint: ProceedingJoinPoint): Any? {
        val request = getCurrentRequest()
        val authentication = SecurityContextHolder.getContext().authentication

        var success = true
        var errorMessage: String? = null
        var result: Any? = null

        try {
            result = joinPoint.proceed()
            if (result != null) {
                // Login was successful
                val loginRequest = joinPoint.args[0] as? LoginRequest
                if (loginRequest != null) {
                    auditService.logSuccessfulLogin(null, loginRequest.username, request)
                }
            }
        } catch (e: Exception) {
            success = false
            errorMessage = e.message

            // Log failed login
            val loginRequest = joinPoint.args[0] as? LoginRequest
            if (loginRequest != null) {
                auditService.logFailedLogin(loginRequest.username, request, errorMessage)
            }
            throw e
        }

        return result
    }

    private fun getCurrentRequest(): HttpServletRequest {
        val requestAttributes = RequestContextHolder.currentRequestAttributes() as ServletRequestAttributes
        return requestAttributes.request
    }

    private fun buildMethodDetails(joinPoint: ProceedingJoinPoint, executionTime: Long, success: Boolean): String {
        val methodName = joinPoint.signature.name
        val args = joinPoint.args.joinToString(", ") { it.toString() }
        return "Method: $methodName, Args: [$args], ExecutionTime: ${executionTime}ms, Success: $success"
    }

    private fun extractResourceFromMethod(methodName: String): String {
        return when {
            methodName.contains("User") -> "USER"
            methodName.contains("Role") -> "ROLE"
            methodName.contains("Permission") -> "PERMISSION"
            methodName.contains("Admin") -> "ADMIN"
            else -> "SYSTEM"
        }
    }

    private fun extractActionFromMethod(methodName: String): String {
        return when {
            methodName.startsWith("create") || methodName.startsWith("assign") -> "CREATE"
            methodName.startsWith("update") -> "UPDATE"
            methodName.startsWith("delete") || methodName.startsWith("remove") -> "DELETE"
            methodName.startsWith("get") || methodName.startsWith("find") -> "READ"
            else -> "EXECUTE"
        }
    }
}
