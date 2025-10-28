
package uz.rms.modules.v1.settings.model

import jakarta.persistence.*
import java.io.Serializable

@Entity
@Table(name = "settings")
class Settings() : Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    open var id: Long? = null

    @Column(nullable = false, unique = true)
    var key: String? = null

    @Column(columnDefinition = "TEXT")
    var value: String? = null
    
    @Column
    var description: String? = null
    
    @Enumerated(EnumType.STRING)
    var type: SettingType = SettingType.GENERAL
    
    @Column
    var groupName: String? = null
    
    @Column
    var isPublic: Boolean = true

    constructor(key: String?, value: String?, description: String? = null, 
                type: SettingType = SettingType.GENERAL, groupName: String? = null, 
                isPublic: Boolean = true) : this() {
        this.key = key
        this.value = value
        this.description = description
        this.type = type
        this.groupName = groupName
        this.isPublic = isPublic
    }
}

enum class SettingType {
    GENERAL,
    COMPANY,
    SMTP,
    CURRENCY,
    WAREHOUSE,
    BRAND,
    CATEGORY,
    UNIT,
    BACKUP
}
