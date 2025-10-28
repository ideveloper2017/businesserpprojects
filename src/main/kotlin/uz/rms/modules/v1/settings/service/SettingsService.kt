package uz.rms.modules.v1.settings.service

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import uz.rms.modules.v1.settings.dto.*
import uz.rms.modules.v1.settings.model.SettingType
import uz.rms.modules.v1.settings.model.Settings

interface SettingsService {
    // Basic CRUD operations
    fun getAll(): List<SettingsDto>
    fun getById(id: Long): SettingsDto
    fun getByKey(key: String): SettingsDto?
    fun create(settingsDto: SettingsDto): SettingsDto
    fun update(id: Long, settingsDto: SettingsDto): SettingsDto
    fun delete(id: Long)
    
    // Grouped settings
    fun getGroupedSettings(): List<SettingsGroupDto>
    fun getSettingsByType(type: SettingType): List<SettingsDto>
    fun getSettingsByGroup(groupName: String): List<SettingsDto>
    
    // Specific settings
    fun getCompanySettings(): CompanySettingsDto
    fun updateCompanySettings(settings: CompanySettingsDto): CompanySettingsDto
    
    fun getSmtpSettings(): SMTPSettingsDto
    fun updateSmtpSettings(settings: SMTPSettingsDto): SMTPSettingsDto
    
    fun getBackupSettings(): BackupSettingsDto
    fun updateBackupSettings(settings: BackupSettingsDto): BackupSettingsDto
    
    // Search and filter
    fun search(query: String, pageable: Pageable): Page<SettingsDto>
    fun getPublicSettings(): List<SettingsDto>
}
