package uz.rms.modules.v1.customer.service

import org.springframework.stereotype.Service
import uz.rms.modules.v1.customer.dto.CustomerDto
import uz.rms.modules.v1.customer.mapper.CustomerMapper
import uz.rms.modules.v1.customer.model.Customer
import uz.rms.modules.v1.customer.repository.CustomerRepository
import uz.rms.modules.v1.customer.service.CustomerService
import jakarta.persistence.EntityNotFoundException

@Service
class CustomerServiceImpl(
    private val customerRepository: CustomerRepository,
    private val customerMapper: CustomerMapper
) : CustomerService {

    override fun getAllCustomers(): List<CustomerDto> {
        return customerRepository.findAllByDeletedOrderByCreatedAtDesc(false)
            .map { customerMapper.toDto(it) }
    }

    override fun getCustomerById(id: Long): CustomerDto {
        val customer = customerRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Customer not found with id: $id") }

        if (customer.deleted) {
            throw EntityNotFoundException("Customer not found with id: $id")
        }

        return customerMapper.toDto(customer)
    }

    override fun createCustomer(customerDto: CustomerDto): CustomerDto {
        val customer = customerMapper.fromDto(customerDto)
        val savedCustomer = customerRepository.save(customer)
        return customerMapper.toDto(savedCustomer)
    }

    override fun updateCustomer(id: Long, customerDto: CustomerDto): CustomerDto {
        val existingCustomer = customerRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Customer not found with id: $id") }

        if (existingCustomer.deleted) {
            throw EntityNotFoundException("Customer not found with id: $id")
        }

        // Update fields
        existingCustomer.first_name = customerDto.firstName
        existingCustomer.last_name = customerDto.lastName
        existingCustomer.phone = customerDto.phone
        existingCustomer.address = customerDto.address

        val updatedCustomer = customerRepository.save(existingCustomer)
        return customerMapper.toDto(updatedCustomer)
    }

    override fun deleteCustomer(id: Long) {
        val customer = customerRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Customer not found with id: $id") }

        if (customer.deleted) {
            throw EntityNotFoundException("Customer not found with id: $id")
        }

        // Soft delete
        customer.deleted = true
        customerRepository.save(customer)
    }

    
    override fun searchCustomers(query: String): List<CustomerDto> {
        if (query.length < 2) {
            return emptyList()
        }
        return customerRepository.search(query)
            .map { customerMapper.toDto(it) }
    }
}
