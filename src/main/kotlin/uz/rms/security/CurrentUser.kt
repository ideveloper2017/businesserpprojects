package uz.idev.app.security


import org.springframework.core.MethodParameter
import org.springframework.security.core.Authentication
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.support.WebDataBinderFactory
import org.springframework.web.context.request.NativeWebRequest
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.method.support.ModelAndViewContainer
import uz.rms.modules.v1.users.domain.User
import uz.rms.security.UserDetailsImpl
import java.lang.annotation.Documented

@Target(AnnotationTarget.VALUE_PARAMETER)
@Retention(AnnotationRetention.RUNTIME)
@Documented
@AuthenticationPrincipal
annotation class CurrentUser

class CurrentUserArgumentResolver : HandlerMethodArgumentResolver {
    override fun supportsParameter(parameter: MethodParameter): Boolean {
        return parameter.parameterType == User::class.java &&
               parameter.hasParameterAnnotation(CurrentUser::class.java)
    }

    override fun resolveArgument(
        parameter: MethodParameter,
        mavContainer: ModelAndViewContainer?,
        webRequest: NativeWebRequest,
        binderFactory: WebDataBinderFactory?
    ): Any? {
        val authentication: Authentication? = SecurityContextHolder.getContext().authentication
        
        if (authentication == null) {
            throw IllegalStateException("No authenticated user")
        }

        if (authentication.principal is User) {
            return authentication.principal as User
        }

        if (authentication.principal is UserDetailsImpl) {
            // Get user ID from request attributes to avoid recreating it multiple times
            val requestKey = "current_user_${(authentication.principal as UserDetailsImpl).getId()}"
            val cachedUser = webRequest.getAttribute(requestKey, NativeWebRequest.SCOPE_REQUEST) as? User

            if (cachedUser != null) {
                return cachedUser
            }

            // Only create user when needed and cache it
            val user = (authentication.principal as UserDetailsImpl).getUser()
            webRequest.setAttribute(requestKey, user, NativeWebRequest.SCOPE_REQUEST)
            return user
        }

        if (authentication.principal is UserDetails) {
            throw IllegalStateException("User details implementation not supported")
        }

        throw IllegalStateException("Authentication principal type not supported")
    }
}
