package uz.rms.modules.v1.settings.controller

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import uz.rms.common.ApiResponse
import uz.rms.modules.v1.settings.dto.*
import uz.rms.modules.v1.settings.model.SettingType
import uz.rms.modules.v1.settings.service.SettingsService

@RestController
@RequestMapping("/api/v1/settings")
@Tag(name = "Settings", description = "Settings management endpoints")
class SettingsController(
    private val settingsService: SettingsService
) {
    @GetMapping
    @Operation(summary = "Get all settings")
    fun getAllSettings(): ResponseEntity<ApiResponse<List<SettingsDto>>> {
        val settings = settingsService.getAll()
        return ResponseEntity.ok(ApiResponse.success(settings))
    }

    @GetMapping("/grouped")
    @Operation(summary = "Get all settings grouped by category")
    fun getGroupedSettings(): ResponseEntity<ApiResponse<SettingsResponse>> {
        val groups = settingsService.getGroupedSettings()
        return ResponseEntity.ok(ApiResponse.success(SettingsResponse(groups)))
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get setting by ID")
    fun getSettingById(@PathVariable id: Long): ResponseEntity<ApiResponse<SettingsDto>> {
        val setting = settingsService.getById(id)
        return ResponseEntity.ok(ApiResponse.success(setting))
    }

    @GetMapping("/key/{key}")
    @Operation(summary = "Get setting by key")
    fun getSettingByKey(@PathVariable key: String): ResponseEntity<ApiResponse<SettingsDto?>> {
        val setting = settingsService.getByKey(key)
        return ResponseEntity.ok(ApiResponse.success(setting))
    }

    @PostMapping
    @Operation(summary = "Create a new setting")
    fun createSetting(@RequestBody settingsDto: SettingsDto): ResponseEntity<ApiResponse<SettingsDto>?> {
        val created = settingsService.create(settingsDto)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Setting created successfully",created, ))
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing setting")
    fun updateSetting(
        @PathVariable id: Long,
        @RequestBody settingsDto: SettingsDto
    ): ResponseEntity<ApiResponse<SettingsDto>?> {
        val updated = settingsService.update(id, settingsDto)
        return ResponseEntity.ok(ApiResponse.success("Setting updated successfully",updated))
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a setting")
    fun deleteSetting(@PathVariable id: Long): ResponseEntity<ApiResponse<Void>> {
        settingsService.delete(id)
        return ResponseEntity.ok(ApiResponse.success("Setting deleted successfully",null, ))
    }

    // Company Settings
    @GetMapping("/company")
    @Operation(summary = "Get company settings")
    fun getCompanySettings(): ResponseEntity<ApiResponse<CompanySettingsDto>> {
        val settings = settingsService.getCompanySettings()
        return ResponseEntity.ok(ApiResponse.success(settings))
    }

    @PutMapping("/company")
    @Operation(summary = "Update company settings")
    fun updateCompanySettings(
        @RequestBody settings: CompanySettingsDto
    ): ResponseEntity<ApiResponse<CompanySettingsDto>> {
        val updated = settingsService.updateCompanySettings(settings)
        return ResponseEntity.ok(ApiResponse.success("Company settings updated successfully",updated ))
    }

    // SMTP Settings
    @GetMapping("/smtp")
    @Operation(summary = "Get SMTP settings")
    fun getSmtpSettings(): ResponseEntity<ApiResponse<SMTPSettingsDto>> {
        val settings = settingsService.getSmtpSettings()
        // For security, don't return the password in the response
        val response = settings.copy(password = "")
        return ResponseEntity.ok(ApiResponse.success(response))
    }

    @PutMapping("/smtp")
    @Operation(summary = "Update SMTP settings")
    fun updateSmtpSettings(
        @RequestBody settings: SMTPSettingsDto
    ): ResponseEntity<ApiResponse<SMTPSettingsDto>> {
        val updated = settingsService.updateSmtpSettings(settings)
        // Don't return the password in the response
        val response = updated.copy(password = "")
        return ResponseEntity.ok(ApiResponse.success("SMTP settings updated successfully",response))
    }

    // Backup Settings
    @GetMapping("/backup")
    @Operation(summary = "Get backup settings")
    fun getBackupSettings(): ResponseEntity<ApiResponse<BackupSettingsDto>> {
        val settings = settingsService.getBackupSettings()
        return ResponseEntity.ok(ApiResponse.success(settings))
    }

    @PutMapping("/backup")
    @Operation(summary = "Update backup settings")
    fun updateBackupSettings(
        @RequestBody settings: BackupSettingsDto
    ): ResponseEntity<ApiResponse<BackupSettingsDto>> {
        val updated = settingsService.updateBackupSettings(settings)
        return ResponseEntity.ok(ApiResponse.success("Backup settings updated successfully",updated))
    }

    // Search and filter
    @GetMapping("/search")
    @Operation(summary = "Search settings")
    fun searchSettings(
        @RequestParam query: String,
        @PageableDefault(size = 20) pageable: Pageable
    ): ResponseEntity<ApiResponse<Page<SettingsDto>>> {
        val results = settingsService.search(query, pageable)
        return ResponseEntity.ok(ApiResponse.success(results))
    }

    @GetMapping("/public")
    @Operation(summary = "Get public settings")
    fun getPublicSettings(): ResponseEntity<ApiResponse<List<SettingsDto>>> {
        val settings = settingsService.getPublicSettings()
        return ResponseEntity.ok(ApiResponse.success(settings))
    }

    // Settings by type
    @GetMapping("/type/{type}")
    @Operation(summary = "Get settings by type")
    fun getSettingsByType(
        @PathVariable type: SettingType
    ): ResponseEntity<ApiResponse<List<SettingsDto>>> {
        val settings = settingsService.getSettingsByType(type)
        return ResponseEntity.ok(ApiResponse.success(settings))
    }

    // Settings by group
    @GetMapping("/group/{groupName}")
    @Operation(summary = "Get settings by group name")
    fun getSettingsByGroup(
        @PathVariable groupName: String
    ): ResponseEntity<ApiResponse<List<SettingsDto>>> {
        val settings = settingsService.getSettingsByGroup(groupName)
        return ResponseEntity.ok(ApiResponse.success(settings))
    }
}
