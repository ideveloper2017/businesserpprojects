package uz.rms.modules.v1.settings.repository

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import uz.rms.modules.v1.settings.model.SettingType
import uz.rms.modules.v1.settings.model.Settings

@Repository
interface SettingsRepository : JpaRepository<Settings, Long> {
    fun findByKey(key: String): Settings?
    fun findByValue(value: String): Settings?
    fun existsByKey(key: String): Boolean
    
    fun findByType(type: SettingType): List<Settings>
    fun findByGroupName(groupName: String): List<Settings>
    fun findByIsPublic(isPublic: Boolean): List<Settings>
    
    @Query("""
        SELECT s FROM Settings s 
        WHERE LOWER(s.key) LIKE LOWER(concat('%', :query, '%')) 
        OR LOWER(s.value) LIKE LOWER(concat('%', :query, '%'))
    """)
    fun search(@Param("query") query: String, pageable: Pageable): Page<Settings>
    
    @Query("""
        SELECT s FROM Settings s 
        WHERE (LOWER(s.key) LIKE LOWER(concat('%', :query, '%')) 
        OR LOWER(s.value) LIKE LOWER(concat('%', :query, '%')))
        AND s.isPublic = true
    """)
    fun searchPublic(@Param("query") query: String, pageable: Pageable): Page<Settings>
    
    @Query("""
        SELECT s FROM Settings s 
        WHERE LOWER(s.key) LIKE LOWER(concat('%', :key, '%')) 
        OR LOWER(s.value) LIKE LOWER(concat('%', :value, '%'))
    """)
    fun findByKeyContainingIgnoreCaseOrValueContainingIgnoreCase(
        @Param("key") key: String,
        @Param("value") value: String,
        pageable: Pageable
    ): Page<Settings>
}
