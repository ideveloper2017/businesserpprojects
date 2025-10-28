
package uz.rms.modules.v1.customer.mapper

import org.springframework.stereotype.Component
import uz.rms.modules.v1.customer.dto.CustomerDto
import uz.rms.modules.v1.customer.model.Customer

@Component
class CustomerMapper {
    fun toDto(entity: Customer) = CustomerDto(
        id = entity.id,
        firstName = entity.first_name ?: "",
        lastName = entity.last_name ?: "",
        phone = entity.phone ?: "",
        address = entity.address ?: ""
    )

    fun fromDto(dto: CustomerDto): Customer {
        val customer = Customer()
        customer.first_name = dto.firstName
        customer.last_name = dto.lastName
        customer.phone = dto.phone
        customer.address = dto.address
        return customer
    }
}
