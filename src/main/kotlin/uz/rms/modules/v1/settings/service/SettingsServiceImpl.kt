package uz.rms.modules.v1.settings.service

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import uz.rms.modules.v1.settings.dto.*
import uz.rms.modules.v1.settings.mapper.SettingsMapper
import uz.rms.modules.v1.settings.model.SettingType
import uz.rms.modules.v1.settings.model.Settings
import uz.rms.modules.v1.settings.repository.SettingsRepository
import java.util.*
import jakarta.persistence.EntityNotFoundException
import uz.idev.app.common.exceptions.NotFoundException

@Service
@Transactional
class SettingsServiceImpl(
    private val repository: SettingsRepository,
    private val mapper: SettingsMapper
) : SettingsService {

    override fun getAll(): List<SettingsDto> =
        repository.findAll().map { mapper.toDto(it) }

    override fun getById(id: Long): SettingsDto {
        val setting = repository.findById(id)
            .orElseThrow { NotFoundException("Setting not found with id: $id") }
        return mapper.toDto(setting)
    }

    override fun getByKey(key: String): SettingsDto? {
        return repository.findByKey(key)?.let { mapper.toDto(it) }
    }

    override fun create(settingsDto: SettingsDto): SettingsDto {
        if (repository.existsByKey(settingsDto.key)) {
            throw IllegalArgumentException("Setting with key ${settingsDto.key} already exists")
        }
        val setting = mapper.toEntity(settingsDto)
        return mapper.toDto(repository.save(setting))
    }

    override fun update(id: Long, settingsDto: SettingsDto): SettingsDto {
        val existing = repository.findById(id)
            .orElseThrow { NotFoundException("Setting not found with id: $id") }
        
        // Update only non-null fields from DTO
        settingsDto.key?.takeIf { it.isNotBlank() }?.let { existing.key = it }
        settingsDto.value?.let { existing.value = it }
        settingsDto.description?.let { existing.description = it }
        settingsDto.type?.let { existing.type = it }
        settingsDto.groupName?.let { existing.groupName = it }
        settingsDto.isPublic?.let { existing.isPublic = it }
        
        return mapper.toDto(repository.save(existing))
    }

    override fun delete(id: Long) {
        if (!repository.existsById(id)) {
            throw NotFoundException("Setting not found with id: $id")
        }
        repository.deleteById(id)
    }

    override fun getGroupedSettings(): List<SettingsGroupDto> {
        val groups = repository.findAll()
            .groupBy { it.groupName ?: "General" }
            .map { (groupName, settings) ->
                mapper.toSettingsGroup(groupName, settings)
            }
        return groups.sortedBy { it.groupName }
    }

    override fun getSettingsByType(type: SettingType): List<SettingsDto> {
        return repository.findByType(type).map { mapper.toDto(it) }
    }

    override fun getSettingsByGroup(groupName: String): List<SettingsDto> {
        return repository.findByGroupName(groupName).map { mapper.toDto(it) }
    }

    // Company Settings
    override fun getCompanySettings(): CompanySettingsDto {
        val settings = repository.findByType(SettingType.COMPANY).associate { it.key to it.value }
        return CompanySettingsDto(
            companyName = settings["company.name"] ?: "",
            companyEmail = settings["company.email"] ?: "",
            companyPhone = settings["company.phone"],
            companyAddress = settings["company.address"],
            companyLogo = settings["company.logo"],
            companyWebsite = settings["company.website"]
        )
    }

    @Transactional
    override fun updateCompanySettings(settings: CompanySettingsDto): CompanySettingsDto {
        val settingsToSave = listOf(
            createOrUpdateSetting("company.name", settings.companyName, SettingType.COMPANY, "Company Information"),
            createOrUpdateSetting("company.email", settings.companyEmail, SettingType.COMPANY, "Company Information"),
            createOrUpdateSetting("company.phone", settings.companyPhone, SettingType.COMPANY, "Company Information"),
            createOrUpdateSetting("company.address", settings.companyAddress, SettingType.COMPANY, "Company Information"),
            createOrUpdateSetting("company.logo", settings.companyLogo, SettingType.COMPANY, "Company Information"),
            createOrUpdateSetting("company.website", settings.companyWebsite, SettingType.COMPANY, "Company Information")
        )
        repository.saveAll(settingsToSave)
        return settings
    }

    // SMTP Settings
    override fun getSmtpSettings(): SMTPSettingsDto {
        val settings = repository.findByType(SettingType.SMTP).associate { it.key to it.value }
        return SMTPSettingsDto(
            host = settings["smtp.host"] ?: "",
            port = settings["smtp.port"]?.toIntOrNull() ?: 587,
            username = settings["smtp.username"] ?: "",
            password = settings["smtp.password"] ?: "",
            fromEmail = settings["smtp.from.email"] ?: settings["smtp.username"] ?: "",
            fromName = settings["smtp.from.name"] ?: "",
            useSSL = settings["smtp.ssl"]?.toBoolean() ?: true,
            useTLS = settings["smtp.tls"]?.toBoolean() ?: true
        )
    }

    @Transactional
    override fun updateSmtpSettings(settings: SMTPSettingsDto): SMTPSettingsDto {
        val settingsToSave = listOf(
            createOrUpdateSetting("smtp.host", settings.host, SettingType.SMTP, "SMTP Server"),
            createOrUpdateSetting("smtp.port", settings.port.toString(), SettingType.SMTP, "SMTP Server"),
            createOrUpdateSetting("smtp.username", settings.username, SettingType.SMTP, "SMTP Server"),
            createOrUpdateSetting("smtp.password", settings.password, SettingType.SMTP, "SMTP Server", isPublic = false),
            createOrUpdateSetting("smtp.from.email", settings.fromEmail, SettingType.SMTP, "SMTP Server"),
            createOrUpdateSetting("smtp.from.name", settings.fromName, SettingType.SMTP, "SMTP Server"),
            createOrUpdateSetting("smtp.ssl", settings.useSSL.toString(), SettingType.SMTP, "SMTP Server"),
            createOrUpdateSetting("smtp.tls", settings.useTLS.toString(), SettingType.SMTP, "SMTP Server")
        )
        repository.saveAll(settingsToSave)
        return settings
    }

    // Backup Settings
    override fun getBackupSettings(): BackupSettingsDto {
        val settings = repository.findByType(SettingType.BACKUP).associate { it.key to it.value }
        return BackupSettingsDto(
            enabled = settings["backup.enabled"]?.toBoolean() ?: true,
            frequency = BackupFrequency.valueOf(settings["backup.frequency"] ?: "DAILY"),
            time = settings["backup.time"] ?: "00:00",
            keepBackups = settings["backup.keep"]?.toIntOrNull() ?: 7,
            backupPath = settings["backup.path"] ?: "./backups"
        )
    }

    @Transactional
    override fun updateBackupSettings(settings: BackupSettingsDto): BackupSettingsDto {
        val settingsToSave = listOf(
            createOrUpdateSetting("backup.enabled", settings.enabled.toString(), SettingType.BACKUP, "Backup"),
            createOrUpdateSetting("backup.frequency", settings.frequency.name, SettingType.BACKUP, "Backup"),
            createOrUpdateSetting("backup.time", settings.time, SettingType.BACKUP, "Backup"),
            createOrUpdateSetting("backup.keep", settings.keepBackups.toString(), SettingType.BACKUP, "Backup"),
            createOrUpdateSetting("backup.path", settings.backupPath, SettingType.BACKUP, "Backup")
        )
        repository.saveAll(settingsToSave)
        return settings
    }

    // Utility methods
    private fun createOrUpdateSetting(
        key: String,
        value: String?,
        type: SettingType,
        groupName: String? = null,
        isPublic: Boolean = true
    ): Settings {
        val existing = repository.findByKey(key)
        return if (existing != null) {
            existing.value = value
            existing.description = ""
            existing.type = type
            existing.groupName = groupName
            existing.isPublic = isPublic
            existing
        } else {
            Settings().apply {
                this.key = key
                this.value = value
                this.type = type
                this.groupName = groupName
                this.isPublic = isPublic
            }
        }
    }

    // Search and filter
    override fun search(query: String, pageable: Pageable): Page<SettingsDto> {
        return repository.findByKeyContainingIgnoreCaseOrValueContainingIgnoreCase(query, query, pageable)
            .map { mapper.toDto(it) }
    }

    override fun getPublicSettings(): List<SettingsDto> {
        return repository.findByIsPublic(true).map { mapper.toDto(it) }
    }
}
