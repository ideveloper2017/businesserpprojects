package uz.rms.config

import jakarta.annotation.PostConstruct
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.jpa.repository.config.EnableJpaAuditing
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.transaction.annotation.Transactional
import uz.rms.modules.v1.tenant.domain.Tenant
import uz.rms.modules.v1.tenant.repository.TenantRepository
import uz.rms.modules.v1.units.model.Units
import uz.rms.modules.v1.units.repository.UnitRepository
import uz.rms.modules.v1.users.domain.Permission
import uz.rms.modules.v1.users.domain.Role
import uz.rms.modules.v1.users.domain.User
import uz.rms.modules.v1.users.repository.PermissionRepository
import uz.rms.modules.v1.users.repository.RoleRepository
import uz.rms.modules.v1.users.repository.UserRepository

import java.time.LocalDateTime

@Configuration
@EnableJpaAuditing
class DataInitializer(
    private val roleRepository: RoleRepository,
    private val permissionRepository: PermissionRepository,
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val tenantRepository: TenantRepository,
    private val unitsRepository: UnitRepository
) {
    
    private lateinit var defaultTenant: Tenant
    
    @PostConstruct
    fun init() {
        // Create or get default tenant
        defaultTenant = tenantRepository.findByName("default")
            .orElseGet {
                tenantRepository.save(Tenant(name = "default", domain = "default.local"))
            }
        val defaultUnits = listOf(
            Units().apply {
                code = "шт."
                name = "Dona"
                active = true
            },
            Units().apply {
                code = "kg"
                name = "Kilogramm"
                active = true
            },
            Units().apply {
                code = "g"
                name = "Gramm"
                active = true
            },
            Units().apply {
                code = "l"
                name = "Litr"
                active = true
            },
            Units().apply {
                code = "m"
                name = "Metr"
                active = true
            },
            Units().apply {
                code = "m²"
                name = "Kvadrat metr"
                active = true
            },
            Units().apply {
                code = "m³"
                name = "Kub metr"
                active = true
            },
            Units().apply {
                code = "quti"
                name = "Quti"
                active = true
            },
            Units().apply {
                code = "set"
                name = "To'plam"
                active = true
            },
            Units().apply {
                code = "pair"
                name = "Juft"
                active = true
            }
        )
        defaultUnits.forEach { unit ->
            if (!unitsRepository.existsByCode(unit.code!!)) {
                unitsRepository.save(unit)
            }
        }

    }

    @Bean
    fun initData(): CommandLineRunner {
        return CommandLineRunner {
            initializeRoles()
            initializePermissions()
            assignPermissionsToRoles()
            createDemoUsers()
        }
    }

    @Transactional
     fun initializeRoles() {
        val roles = listOf(
            Role(
                name = "ADMIN",
                description = "Administrator with full access",
                tenant = defaultTenant
            ),
            Role(
                name = "MANAGER", 
                description = "Manager with elevated access",
                tenant = defaultTenant
            ),
            Role(
                name = "USER", 
                description = "Standard user access",
                tenant = defaultTenant
            )
        )

        roles.forEach { role ->
            if (!roleRepository.existsByNameAndTenantId(role.name, defaultTenant.id!!)) {
                roleRepository.save(role)
                println("✅ Created role: ${role.name} for tenant ${defaultTenant.name}")
            } else {
                println("ℹ️  Role ${role.name} already exists for tenant ${defaultTenant.name}")
            }
        }
    }

    private fun initializePermissions() {
        val permissions = listOf(
            // User permissions
            Permission(name = "USER_READ", description = "Read user information", resource = "USER", action = "READ"),
            Permission(name = "USER_CREATE", description = "Create new users", resource = "USER", action = "CREATE"),
            Permission(name = "USER_UPDATE", description = "Update user information", resource = "USER", action = "UPDATE"),
            Permission(name = "USER_DELETE", description = "Delete users", resource = "USER", action = "DELETE"),
            Permission(name = "USER_CHANGE_PASSWORD", description = "Change user password", resource = "USER", action = "CHANGE_PASSWORD"),
            Permission(name = "USER_TOGGLE_STATUS", description = "Enable/disable users", resource = "USER", action = "TOGGLE_STATUS"),

            // Role permissions
            Permission(name = "ROLE_READ", description = "Read role information", resource = "ROLE", action = "READ"),
            Permission(name = "ROLE_CREATE", description = "Create new roles", resource = "ROLE", action = "CREATE"),
            Permission(name = "ROLE_UPDATE", description = "Update role information", resource = "ROLE", action = "UPDATE"),
            Permission(name = "ROLE_DELETE", description = "Delete roles", resource = "ROLE", action = "DELETE"),
            Permission(name = "ROLE_ASSIGN", description = "Assign roles to users", resource = "ROLE", action = "ASSIGN"),
            Permission(name = "ROLE_REVOKE", description = "Revoke roles from users", resource = "ROLE", action = "REVOKE"),

            // Profile permissions
            Permission(name = "PROFILE_READ", description = "View own profile", resource = "PROFILE", action = "READ"),
            Permission(name = "PROFILE_UPDATE", description = "Update own profile", resource = "PROFILE", action = "UPDATE"),
            Permission(name = "PROFILE_CHANGE_PASSWORD", description = "Change own password", resource = "PROFILE", action = "CHANGE_PASSWORD"),

            // Audit log permissions
            Permission(name = "AUDIT_READ", description = "View audit logs", resource = "AUDIT", action = "READ"),
            Permission(name = "AUDIT_EXPORT", description = "Export audit logs", resource = "AUDIT", action = "EXPORT"),

            // System settings permissions
            Permission(name = "SETTINGS_READ", description = "View system settings", resource = "SETTINGS", action = "READ"),
            Permission(name = "SETTINGS_UPDATE", description = "Update system settings", resource = "SETTINGS", action = "UPDATE"),

            // Dashboard permissions
            Permission(name = "DASHBOARD_VIEW", description = "View dashboard", resource = "DASHBOARD", action = "VIEW"),
            Permission(name = "DASHBOARD_EXPORT", description = "Export dashboard data", resource = "DASHBOARD", action = "EXPORT")
        )

        permissions.forEach { permission ->
            if (!permissionRepository.existsByName(permission.name)) {
                permissionRepository.save(permission)
                println("✅ Created permission: ${permission.name} (${permission.resource}:${permission.action})")
            }
        }
    }

    @Transactional
    fun assignPermissionsToRoles() {
        // Get all permissions
        val allPermissions = permissionRepository.findAll()

        // Admin gets all permissions
        val adminRole = roleRepository.findByName("ADMIN").orElseThrow {
            IllegalStateException("ADMIN role not found")
        }
        adminRole.permissions = allPermissions.toMutableSet()
        roleRepository.save(adminRole)
        println("✅ Assigned all ${allPermissions.size} permissions to ADMIN role")

        // Manager gets most permissions except sensitive ones
        val managerRole = roleRepository.findByName("MANAGER").orElseThrow {
            IllegalStateException("MANAGER role not found")
        }
        val managerPermissions = allPermissions.filter { permission ->
            !permission.name.endsWith("_DELETE") &&
                    !permission.name.endsWith("TOGGLE_STATUS") &&
                    !permission.name.startsWith("ROLE_") &&
                    !permission.name.startsWith("SETTINGS_")
        }.toMutableSet()
        managerRole.permissions = managerPermissions
        roleRepository.save(managerRole)
        println("✅ Assigned ${managerPermissions.size} permissions to MANAGER role")

        // Regular user gets basic read permissions
        val userRole = roleRepository.findByName("USER").orElseThrow {
            IllegalStateException("USER role not found")
        }
        val userPermissions = allPermissions.filter { permission ->
            permission.name in listOf(
                "PROFILE_READ",
                "PROFILE_UPDATE",
                "PROFILE_CHANGE_PASSWORD",
                "DASHBOARD_VIEW"
            )
        }.toMutableSet()
        roleRepository.save(userRole)
        println("✅ Assigned ${userPermissions.size} permissions to USER role")
    }

    @Transactional
     fun createDemoUsers() {
        val adminRole = roleRepository.findByNameAndTenantId("ADMIN", defaultTenant.id!!)
            ?: throw IllegalStateException("ADMIN role not found for tenant ${defaultTenant.name}")
        val managerRole = roleRepository.findByNameAndTenantId("MANAGER", defaultTenant.id!!)
            ?: throw IllegalStateException("MANAGER role not found for tenant ${defaultTenant.name}")
        val userRole = roleRepository.findByNameAndTenantId("USER", defaultTenant.id!!)
            ?: throw IllegalStateException("USER role not found for tenant ${defaultTenant.name}")

        createAdminUser(adminRole)
        createManagerUser(managerRole)
        createRegularUser(userRole)
    }

    private fun createAdminUser(role: Role) {
        val username = "admin"
        if (!userRepository.existsByLoginAndTenant(username, defaultTenant)) {
            val admin = User().apply {
                login = username
                phone="+998900000001"
                email = "admin@example.com"
                passwords = passwordEncoder.encode("admin123")
                firstName = "System"
                lastName = "Administrator"
                enabled = true
                accountNonExpired = true
                accountNonLocked = true
                credentialsNonExpired = true
                tenant = defaultTenant
            }
            admin.roles = mutableSetOf(role)

            // Add direct permissions to admin
            val allPermissions = permissionRepository.findAll().toMutableSet()
            admin.permissions = allPermissions

            userRepository.save(admin)
            println("✅ Created admin user: admin / admin123")
        }
    }

    private fun createManagerUser(role: Role) {
        val username = "manager"
        if (!userRepository.existsByLoginAndTenant(username, defaultTenant)) {
            val manager = User().apply {
                login = username
                phone="+998900000000"
                email = "manager@example.com"
                passwords = passwordEncoder.encode("manager123")
                firstName = "Project"
                lastName = "Manager"
                enabled = true
                accountNonExpired = true
                accountNonLocked = true
                credentialsNonExpired = true
                tenant = defaultTenant
            }
            manager.roles = mutableSetOf(role)

            // Add direct permissions to manager
            val managerPermissions = mutableSetOf<Permission>(
                permissionRepository.findByName("AUDIT_READ").orElseThrow(),
                permissionRepository.findByName("DASHBOARD_EXPORT").orElseThrow()
            )
            manager.permissions = managerPermissions

            userRepository.save(manager)
            println("✅ Created manager user: manager / manager123")
        }
    }

    private fun createRegularUser(role: Role) {
        val username = "user"
        if (!userRepository.existsByLoginAndTenant(username, defaultTenant)) {
            val user = User().apply {
                login = username
                phone="+998900000002"
                email = "user@example.com"
                passwords = passwordEncoder.encode("user123")
                firstName = "Regular"
                lastName = "User"
                enabled = true
                accountNonExpired = true
                accountNonLocked = true
                credentialsNonExpired = true
                tenant = defaultTenant
            }
            user.roles = mutableSetOf(role)

            // Get required permissions
            val profileReadPermission = permissionRepository.findByName("PROFILE_READ")
                .orElseThrow { IllegalStateException("PROFILE_READ permission not found") }
            val profileUpdatePermission = permissionRepository.findByName("PROFILE_UPDATE")
                .orElseThrow { IllegalStateException("PROFILE_UPDATE permission not found") }
            val changePasswordPermission = permissionRepository.findByName("PROFILE_CHANGE_PASSWORD")
                .orElseThrow { IllegalStateException("PROFILE_CHANGE_PASSWORD permission not found") }
            val dashboardViewPermission = permissionRepository.findByName("DASHBOARD_VIEW")
                .orElseThrow { IllegalStateException("DASHBOARD_VIEW permission not found") }

            // Add direct permissions to regular user
            val userPermissions = mutableSetOf<Permission>(
                profileReadPermission,
                profileUpdatePermission,
                changePasswordPermission,
                dashboardViewPermission
            )
            user.permissions = userPermissions

            userRepository.save(user)
            println("✅ Created regular user: user / user123")
        }
    }
}
