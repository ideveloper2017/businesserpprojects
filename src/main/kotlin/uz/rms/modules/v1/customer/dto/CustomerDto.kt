
package uz.rms.modules.v1.customer.dto

import uz.rms.modules.v1.customer.model.Customer

data class CustomerDto(
    val id: Long?,
    val firstName: String?,
    val lastName: String?,
    val phone: String?,
    val address: String?
) {
    companion object {
    fun toDto(customer: Customer): CustomerDto {
        return CustomerDto(
            id = customer.id,
            firstName = customer.first_name,
            lastName = customer.last_name,
            phone = customer.phone,
            address = customer.address
        )
    }

//    fun toEntity(dto: CustomerDto): Customer {
//        return Customer(
//            id = dto.id,
//            first_name = dto.firstName,
//            last_name = dto.lastName,
//            phone = dto.phone,
//            address = dto.address
//        )
//    }

    fun toDtoList(customers: List<Customer>): List<CustomerDto> {
        return customers.map { toDto(it) }
    }

//    fun toEntityList(dtos: List<CustomerDto>): List<Customer> {
//        return dtos.map { toEntity(it) }
//    }
        }
}
