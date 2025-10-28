package uz.rms.modules.v1.tenant.context

object TenantContext {
    private val currentTenant = ThreadLocal<String>()

    fun setCurrentTenant(tenant: String) {
        currentTenant.set(tenant)
    }

    fun getCurrentTenant(): String? = currentTenant.get()

    fun clear() {
        currentTenant.remove()
    }
}