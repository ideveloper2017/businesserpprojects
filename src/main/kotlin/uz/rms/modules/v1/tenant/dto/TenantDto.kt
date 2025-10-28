package uz.rms.modules.v1.tenant.dto

data class TenantDto(
    val id: Long? = null,
    val name: String,
    val domain: String,
    val active: Boolean = true
)

data class CreateTenantRequest(
    val name: String,
    val domain: String,
    val active: Boolean = true
)

data class UpdateTenantRequest(
    val name: String? = null,
    val domain: String? = null,
    val active: Boolean? = null
)

data class TenantResponse(
    val success: Boolean,
    val message: String,
    val data: TenantDto? = null
)
