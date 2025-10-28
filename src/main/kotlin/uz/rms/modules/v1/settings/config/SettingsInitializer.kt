//package uz.rms.modules.v1.settings.config
//
//import jakarta.annotation.PostConstruct
//import org.springframework.context.annotation.Configuration
//import org.springframework.stereotype.Component
//import uz.rms.modules.v1.settings.dto.BackupFrequency
//import uz.rms.modules.v1.settings.dto.BackupSettingsDto
//import uz.rms.modules.v1.settings.dto.CompanySettingsDto
//import uz.rms.modules.v1.settings.dto.SMTPSettingsDto
//import uz.rms.modules.v1.settings.model.SettingType
//import uz.rms.modules.v1.settings.service.SettingsService
//
//@Configuration
//class SettingsInitializer(
//    private val settingsService: SettingsService
//) {
//
//    @PostConstruct
//    fun init() {
//        // Initialize company settings if not exists
//        try {
//            settingsService.getCompanySettings()
//        } catch (e: Exception) {
//            settingsService.updateCompanySettings(
//                CompanySettingsDto(
//                    companyName = "OffPos Retail",
//                    companyEmail = "info@offpos.com",
//                    companyPhone = "+1234567890",
//                    companyAddress = "123 Business St, City, Country",
//                    companyLogo = "/logo.png",
//                    companyWebsite = "https://offpos.com"
//                )
//            )
//        }
//
//        // Initialize SMTP settings if not exists
//        try {
//            settingsService.getSmtpSettings()
//        } catch (e: Exception) {
//            settingsService.updateSmtpSettings(
//                SMTPSettingsDto(
//                    host = "smtp.gmail.com",
//                    port = 587,
//                    username = "noreply@offpos.com",
//                    password = "your-smtp-password",
//                    fromEmail = "noreply@offpos.com",
//                    fromName = "OffPos Retail",
//                    useSSL = true,
//                    useTLS = true
//                )
//            )
//        }
//
//        // Initialize backup settings if not exists
//        try {
//            settingsService.getBackupSettings()
//        } catch (e: Exception) {
//            settingsService.updateBackupSettings(
//                BackupSettingsDto(
//                    enabled = true,
//                    frequency = BackupFrequency.DAILY,
//                    time = "02:00",
//                    keepBackups = 7,
//                    backupPath = "./backups"
//                )
//            )
//        }
//    }
//}
