package uz.rms.security

import jakarta.servlet.Filter
import jakarta.servlet.FilterChain
import jakarta.servlet.ServletRequest
import jakarta.servlet.ServletResponse
import jakarta.servlet.annotation.WebFilter
import jakarta.servlet.http.HttpServletRequest
import org.springframework.stereotype.Component
import uz.rms.modules.v1.tenant.context.TenantContext


@Component
@WebFilter("/*")
class TenantFilter : Filter {
    override fun doFilter(request: ServletRequest, response: ServletResponse, chain: FilterChain) {
        val httpRequest = request as HttpServletRequest
        val tenantId = httpRequest.getHeader("X-Tenant-ID") ?: "default"
        
        try {
            TenantContext.setCurrentTenant(tenantId)
            chain.doFilter(request, response)
        } finally {
            TenantContext.clear()
        }
    }
}