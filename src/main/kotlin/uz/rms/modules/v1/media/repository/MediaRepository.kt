package uz.rms.modules.v1.media.repository

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import uz.rms.modules.v1.media.model.Media

@Repository
interface MediaRepository : JpaRepository<Media, Long> {
    fun findByFileName(fileName: String): Media?
    fun findByIsDeletedFalse(pageable: Pageable): Page<Media>
    fun findByIdAndIsDeletedFalse(id: Long): Media?
    fun findByFileTypeContainingAndIsDeletedFalse(fileType: String, pageable: Pageable): Page<Media>
    
    /**
     * Find all non-deleted media items where the file path does not contain a forward slash
     * (i.e., items in the root directory)
     */
    @Query("""
        SELECT m FROM Media m 
        WHERE m.isDeleted = false 
        AND m.filePath NOT LIKE '%/%'
        AND (m.filePath != '' OR m.isDirectory = true)
    """)
    fun findByIsDeletedFalseAndFilePathNotContainingSlash(pageable: Pageable): Page<Media>
    
    /**
     * Find all non-deleted media items where the file path starts with the given prefix
     * and is exactly one level deep from the given path
     */
    @Query("""
        SELECT m FROM Media m 
        WHERE m.isDeleted = false 
        AND (
            (m.filePath = :prefix AND m.isDirectory = true) OR
            (m.filePath LIKE CONCAT(:prefix, '/%') 
            AND m.filePath NOT LIKE CONCAT(:prefix, '/%/%'))
        )
    """)
    fun findByIsDeletedFalseAndFilePathStartsWith(
        @Param("prefix") prefix: String, 
        pageable: Pageable
    ): Page<Media>
}
