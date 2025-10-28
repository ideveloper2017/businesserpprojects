package uz.rms.modules.v1.tenant.controller

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import uz.rms.modules.v1.tenant.dto.CreateTenantRequest
import uz.rms.modules.v1.tenant.dto.TenantResponse
import uz.rms.modules.v1.tenant.dto.UpdateTenantRequest
import uz.rms.modules.v1.tenant.services.TenantService

@Tag(name = "Tenant Management", description = "APIs for managing tenants")
@RestController
@RequestMapping("/api/v1/tenants")
class TenantController(
    private val tenantService: TenantService
) {
    @Operation(summary = "Create a new tenant")
    @PostMapping
    fun createTenant(@RequestBody request: CreateTenantRequest): ResponseEntity<TenantResponse> {
        val tenant = tenantService.createTenant(request)
        return ResponseEntity(
            TenantResponse(
                success = true,
                message = "Tenant created successfully",
                data = tenant
            ),
            HttpStatus.CREATED
        )
    }

    @Operation(summary = "Get tenant by ID")
    @GetMapping("/{id}")
    fun getTenantById(@PathVariable id: Long): ResponseEntity<TenantResponse> {
        val tenant = tenantService.getTenantById(id)
        return ResponseEntity.ok(
            TenantResponse(
                success = true,
                message = "Tenant retrieved successfully",
                data = tenant
            )
        )
    }

    @Operation(summary = "Get all tenants")
    @GetMapping
    fun getAllTenants(): ResponseEntity<Map<String, Any>> {
        val tenants = tenantService.getAllTenants()
        return ResponseEntity.ok(
            mapOf(
                "success" to true,
                "message" to "Tenants retrieved successfully",
                "data" to tenants
            )
        )
    }

    @Operation(summary = "Update tenant")
    @PutMapping("/{id}")
    fun updateTenant(
        @PathVariable id: Long,
        @RequestBody request: UpdateTenantRequest
    ): ResponseEntity<TenantResponse> {
        val tenant = tenantService.updateTenant(id, request)
        return ResponseEntity.ok(
            TenantResponse(
                success = true,
                message = "Tenant updated successfully",
                data = tenant
            )
        )
    }

    @Operation(summary = "Delete tenant")
    @DeleteMapping("/{id}")
    fun deleteTenant(@PathVariable id: Long): ResponseEntity<Map<String, Any>> {
        tenantService.deleteTenant(id)
        return ResponseEntity.ok(
            mapOf(
                "success" to true,
                "message" to "Tenant deleted successfully"
            )
        )
    }

    @Operation(summary = "Toggle tenant status (activate/deactivate)")
    @PatchMapping("/{id}/toggle-status")
    fun toggleTenantStatus(@PathVariable id: Long): ResponseEntity<TenantResponse> {
        val tenant = tenantService.toggleTenantStatus(id)
        return ResponseEntity.ok(
            TenantResponse(
                success = true,
                message = "Tenant status updated successfully",
                data = tenant
            )
        )
    }
}