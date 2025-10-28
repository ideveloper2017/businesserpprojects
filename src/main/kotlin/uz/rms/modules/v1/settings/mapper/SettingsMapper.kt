package uz.rms.modules.v1.settings.mapper

import org.springframework.stereotype.Component
import uz.rms.modules.v1.settings.dto.*
import uz.rms.modules.v1.settings.model.Settings

@Component
class SettingsMapper {
    
    fun toDto(entity: Settings): SettingsDto {
        return SettingsDto(
            id = entity.id,
            key = entity.key ?: "",
            value = entity.value,
            description = entity.description,
            type = entity.type,
            groupName = entity.groupName,
            isPublic = entity.isPublic
        )
    }
    
    fun toEntity(dto: SettingsDto): Settings {
        return Settings().apply {
            id = dto.id
            key = dto.key
            value = dto.value
            description = dto.description
            type = dto.type
            groupName = dto.groupName
            isPublic = dto.isPublic
        }
    }
    
    fun toSettingsGroup(groupName: String, settings: List<Settings>): SettingsGroupDto {
        return SettingsGroupDto(
            groupName = groupName,
            settings = settings.map { toDto(it) }
        )
    }
}
