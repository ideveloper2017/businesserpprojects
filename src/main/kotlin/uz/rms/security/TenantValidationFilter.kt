package uz.rms.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.DisabledException
import org.springframework.stereotype.Component
import org.springframework.util.StringUtils
import org.springframework.web.filter.OncePerRequestFilter
import uz.rms.modules.v1.tenant.context.TenantContext
import uz.rms.modules.v1.tenant.repository.TenantRepository


@Component
class TenantValidationFilter(
    private val jwtUtils: JwtUtils,
    private val tenantRepository: TenantRepository
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val token = parseJwt(request) ?: run {
            filterChain.doFilter(request, response)
            return
        }

        try {
            val claims = jwtUtils.getClaimsFromToken(token)
            val tenantId = claims["tenantId"]?.toString()?.toLongOrNull()

            tenantId?.let { id ->
                val tenant = tenantRepository.findById(id)
                    .orElseThrow { BadCredentialsException("Invalid tenant") }

                if (!tenant.active) {
                    throw DisabledException("Tenant is not active")
                }

                TenantContext.setCurrentTenant(id.toString())
            }

            filterChain.doFilter(request, response)
        } catch (e: Exception) {
            e.printStackTrace()
            throw e
        } finally {
            TenantContext.clear()
        }
    }

    private fun parseJwt(request: HttpServletRequest): String? {
        val headerAuth = request.getHeader("Authorization")

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7)
        }

        return null
    }
}