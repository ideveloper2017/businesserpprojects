package uz.rms.modules.v1.units.exception

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

/**
 * Exception thrown when a unit with the given ID is not found
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
class UnitNotFoundException(id: Long) : 
    RuntimeException("Unit with ID '$id' not found")

/**
 * Exception thrown when a unit with the given code is not found
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
class UnitCodeNotFoundException(code: String) : 
    RuntimeException("Unit with code '$code' not found")
