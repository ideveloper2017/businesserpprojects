package uz.rms.modules.v1.customer.controller

import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import uz.rms.common.ApiResponse

import uz.rms.modules.v1.customer.dto.CustomerDto
import uz.rms.modules.v1.customer.service.CustomerService

@RestController
@RequestMapping("/api/v1/customers")
@Tag(name = "Customer Management", description = "Endpoints for managing customers")
class CustomerController(private val customerService: CustomerService) {

    @GetMapping
    fun getAllCustomers(): ResponseEntity<ApiResponse<List<CustomerDto>>?> {
        val customers = customerService.getAllCustomers()
        return ResponseEntity.ok(ApiResponse.success(customers))
    }

    @GetMapping("/search")
    fun searchCustomers(@RequestParam("q") query: String): ResponseEntity<ApiResponse<List<CustomerDto>>?> {
        val results = customerService.searchCustomers(query)
        return ResponseEntity.ok(ApiResponse.success(results))
    }



    @GetMapping("/{id}")
    fun getCustomerById(@PathVariable id: Long): ResponseEntity<CustomerDto> {
        return ResponseEntity.ok(customerService.getCustomerById(id))
    }

    @PostMapping
    fun createCustomer(@RequestBody customerDto: CustomerDto): ResponseEntity<ApiResponse<CustomerDto>?> {
        val createdCustomer = customerService.createCustomer(customerDto)
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(createdCustomer))
    }

    @PutMapping("/{id}")
    fun updateCustomer(
        @PathVariable id: Long,
        @RequestBody customerDto: CustomerDto
    ): ResponseEntity<ApiResponse<CustomerDto>?> {
        return ResponseEntity.ok(ApiResponse.success(customerService.updateCustomer(id, customerDto)))
    }

    @DeleteMapping("/{id}")
    fun deleteCustomer(@PathVariable id: Long): ResponseEntity<Void> {
        customerService.deleteCustomer(id)
        return ResponseEntity.noContent().build()
    }
}

