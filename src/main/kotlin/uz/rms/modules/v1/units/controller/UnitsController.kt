package uz.rms.modules.v1.units.controller

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse as SwaggerApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses as SwaggerApiResponses
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import org.springdoc.core.annotations.ParameterObject
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import uz.rms.common.ApiResponse

import uz.rms.modules.v1.units.dto.UnitDto
import uz.rms.modules.v1.units.dto.request.UnitCreateDto
import uz.rms.modules.v1.units.dto.request.UnitUpdateDto
import uz.rms.modules.v1.units.mapper.UnitMapper
import uz.rms.modules.v1.units.service.UnitService

@RestController
@RequestMapping("/api/v1/units", produces = [MediaType.APPLICATION_JSON_VALUE])
@Tag(name = "Units", description = "Unit management API")
@SecurityRequirement(name = "bearerAuth")
class UnitsController(
    private val unitService: UnitService,
    private val mapper: UnitMapper
) {

    @Operation(summary = "Get all units", description = "Retrieves a list of all units with their products")
    @SwaggerApiResponses(
        value = [
            SwaggerApiResponse(responseCode = "200", description = "Successfully retrieved list of units")
        ]
    )
    @GetMapping
    fun getAll(): ResponseEntity<ApiResponse<List<UnitDto>>> {
        val units = unitService.getAll()
        return ResponseEntity.ok(ApiResponse.success(units))
    }

    @Operation(summary = "Get unit by ID", description = "Retrieves a unit by its ID")
    @SwaggerApiResponses(
        value = [
            SwaggerApiResponse(responseCode = "200", description = "Successfully retrieved unit"),
            SwaggerApiResponse(responseCode = "404", description = "Unit not found")
        ]
    )
    @GetMapping("/{id}")
    fun getById(
        @Parameter(description = "ID of the unit to be retrieved")
        @PathVariable id: Long
    ): ResponseEntity<ApiResponse<UnitDto>> {
        val unit = unitService.getById(id)
        return ResponseEntity.ok(ApiResponse.success(unit))
    }

    @Operation(summary = "Create a new unit", description = "Creates a new unit with the given details")
    @SwaggerApiResponses(
        value = [
            SwaggerApiResponse(responseCode = "201", description = "Unit created successfully"),
            SwaggerApiResponse(responseCode = "400", description = "Invalid input")
        ]
    )
    @PostMapping(consumes = [MediaType.APPLICATION_JSON_VALUE])
    @ResponseStatus(HttpStatus.CREATED)
    fun create(
        @Parameter(description = "Unit details to create")
        @RequestBody dto: UnitCreateDto
    ): ResponseEntity<ApiResponse<UnitDto>> {
        val createdUnit = unitService.create(dto)
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success(createdUnit))
    }

    @Operation(summary = "Update an existing unit", description = "Updates an existing unit with the given details")
    @SwaggerApiResponses(
        value = [
            SwaggerApiResponse(responseCode = "200", description = "Unit updated successfully"),
            SwaggerApiResponse(responseCode = "400", description = "Invalid input"),
            SwaggerApiResponse(responseCode = "404", description = "Unit not found")
        ]
    )
    @PutMapping("/{id}", consumes = [MediaType.APPLICATION_JSON_VALUE])
    fun update(
        @Parameter(description = "ID of the unit to be updated")
        @PathVariable id: Long,
        @Parameter(description = "Updated unit details")
        @RequestBody dto: UnitUpdateDto
    ): ResponseEntity<ApiResponse<UnitDto>> {
        val updatedUnit = unitService.update(id, dto)
        return ResponseEntity.ok(ApiResponse.success(updatedUnit))
    }

    @Operation(summary = "Delete a unit", description = "Deletes a unit by its ID")
    @SwaggerApiResponses(
        value = [
            SwaggerApiResponse(responseCode = "204", description = "Unit deleted successfully"),
            SwaggerApiResponse(responseCode = "404", description = "Unit not found")
        ]
    )
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(
        @Parameter(description = "ID of the unit to be deleted")
        @PathVariable id: Long
    ): ResponseEntity<Void> {
        unitService.delete(id)
        return ResponseEntity.noContent().build()
    }

    @Operation(summary = "Toggle unit status", description = "Activates or deactivates a unit")
    @SwaggerApiResponses(
        value = [
            SwaggerApiResponse(responseCode = "200", description = "Unit status updated successfully"),
            SwaggerApiResponse(responseCode = "404", description = "Unit not found")
        ]
    )
    @PatchMapping("/{id}/status")
    fun toggleStatus(
        @Parameter(description = "ID of the unit to update status")
        @PathVariable id: Long,
        @Parameter(description = "New status (true = active, false = inactive)")
        @RequestParam active: Boolean
    ): ResponseEntity<ApiResponse<UnitDto>> {
        val updatedUnit = unitService.toggleStatus(id, active)
        val message = if (active) "Unit activated successfully" else "Unit deactivated successfully"
        return ResponseEntity.ok(ApiResponse.success(message, updatedUnit))
    }

    @Operation(summary = "Search units", description = "Searches units by code or name")
    @SwaggerApiResponses(
        value = [
            SwaggerApiResponse(responseCode = "200", description = "Search results")
        ]
    )
    @GetMapping("/search")
    fun search(
        @Parameter(description = "Search query (searches in code and name)")
        @RequestParam("q") query: String,
        @ParameterObject
        @PageableDefault(size = 20) pageable: Pageable
    ): ResponseEntity<ApiResponse<Page<UnitDto>>> {
        val result = unitService.search(query, pageable)
        return ResponseEntity.ok(ApiResponse.success(result))
    }
}