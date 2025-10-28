
package uz.rms.modules.v1.supplier.repository

import org.springframework.data.jpa.repository.JpaRepository
import uz.rms.modules.v1.supplier.model.Supplier


interface SupplierRepository : JpaRepository<Supplier, Long>
