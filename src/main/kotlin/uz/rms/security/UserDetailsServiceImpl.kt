package uz.rms.security

import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import uz.rms.modules.v1.users.repository.UserRepository


@Service
@Transactional(readOnly = true)
class UserDetailsServiceImpl(
    private val userRepository: UserRepository
) : UserDetailsService {

    override fun loadUserByUsername(username: String): UserDetails {
        val user = userRepository.findByUsernameWithRolesAndPermissions(username)
            .orElseThrow {
                UsernameNotFoundException("User not found with username: $username")
            }

        return user
    }
}
