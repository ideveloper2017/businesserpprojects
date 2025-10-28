
package uz.rms.modules.v1.settings.dto

import uz.rms.modules.v1.settings.model.Settings
import uz.rms.modules.v1.settings.model.SettingType

data class SettingsDto(
    val id: Long? = null,
    val key: String,
    val value: String? = null,
    val description: String? = null,
    val type: SettingType = SettingType.GENERAL,
    val groupName: String? = null,
    val isPublic: Boolean = true
) {
    companion object {
        fun fromSettings(settings: Settings): SettingsDto {
            return SettingsDto(
                id = settings.id,
                key = settings.key ?: "",
                value = settings.value,
                description = settings.description,
                type = settings.type,
                groupName = settings.groupName,
                isPublic = settings.isPublic
            )
        }
    }
}

data class SettingsGroupDto(
    val groupName: String,
    val settings: List<SettingsDto>
)

data class SettingsResponse(
    val groups: List<SettingsGroupDto>
)

// Request DTOs for specific setting types
data class CompanySettingsDto(
    val companyName: String,
    val companyEmail: String,
    val companyPhone: String? = null,
    val companyAddress: String? = null,
    val companyLogo: String? = null,
    val companyWebsite: String? = null
)

data class SMTPSettingsDto(
    val host: String,
    val port: Int,
    val username: String,
    val password: String,
    val fromEmail: String,
    val fromName: String,
    val useSSL: Boolean = true,
    val useTLS: Boolean = true
)

data class BackupSettingsDto(
    val enabled: Boolean = true,
    val frequency: BackupFrequency = BackupFrequency.DAILY,
    val time: String = "00:00",
    val keepBackups: Int = 7,
    val backupPath: String = "./backups"
)

enum class BackupFrequency {
    HOURLY,
    DAILY,
    WEEKLY,
    MONTHLY
}
