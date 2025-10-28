package uz.rms.modules.v1.customer.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import uz.rms.modules.v1.customer.model.Customer

@Repository
interface CustomerRepository : JpaRepository<Customer, Long> {
    fun existsByPhoneAndDeleted(phone: String, deleted: Boolean): Boolean
    fun findAllByDeletedOrderByCreatedAtDesc(deleted: Boolean): List<Customer>
    
    @Query("""
        SELECT c FROM Customer c 
        WHERE c.deleted = false 
        AND (LOWER(CONCAT(c.first_name, ' ', c.last_name)) LIKE LOWER(CONCAT('%', :query, '%')) 
             OR c.phone LIKE CONCAT('%', :query, '%'))
    """)
    fun search(query: String): List<Customer>
}

