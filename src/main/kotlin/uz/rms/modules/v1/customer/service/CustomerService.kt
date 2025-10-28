package uz.rms.modules.v1.customer.service

import uz.rms.modules.v1.customer.dto.CustomerDto

interface CustomerService {
    fun getAllCustomers(): List<CustomerDto>
    fun getCustomerById(id: Long): CustomerDto
    fun createCustomer(customerDto: CustomerDto): CustomerDto
    fun updateCustomer(id: Long, customerDto: CustomerDto): CustomerDto
    fun deleteCustomer(id: Long)
    fun searchCustomers(query: String): List<CustomerDto>
}
