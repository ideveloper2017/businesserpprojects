package uz.rms.modules.v1.media.model

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.LocalDateTime

@Entity
@Table(name = "media")
data class Media(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @Column(nullable = false)
    var originalName: String = "",
    
    @Column(nullable = false, unique = true)
    var fileName: String = "",
    
    @Column(nullable = false)
    var fileType: String = "",
    
    @Column(nullable = false)
    var fileSize: Long = 0,
    
    @Column(nullable = false)
    var filePath: String = "",
    
    @Column(nullable = false)
    var url: String = "",

    @Column(nullable = false)
    var isDeleted: Boolean = false,

    @Column(nullable = false)
    var isDirectory: Boolean = false,

    @CreationTimestamp
    @Column(updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @UpdateTimestamp
    var updatedAt: LocalDateTime = LocalDateTime.now(),
    

)
