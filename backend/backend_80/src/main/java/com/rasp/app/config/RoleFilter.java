package com.rasp.app.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;


@Component
public class RoleFilter extends OncePerRequestFilter {
    @Value("${isScope}")
    private boolean isScoped;
    @Value("${spring.security.oauth2.client.provider.keycloak.clientId}")
    private  String cId ;

    // Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        List<String> roles=RoleResourceAccess.getInstance(cId,isScoped).getRoles();
//        List<String> roles=RoleResourceAccess.getRoles();
        if (request.getRequestURI().equals("/api/auth/login") ||
                request.getRequestURI().equals("/api/v1/role_resource")||
                request.getRequestURI().startsWith("/api/auth/callback") ||
                request.getRequestURI().startsWith("/api/sign/batch")||
                request.getRequestURI().startsWith("admin/realms/new/users")||
                request.getRequestURI().startsWith("/api/auth/register")||
               request.getRequestURI().startsWith("/api/auth/addUser")||
                request.getRequestURI().equals( "/api/auth/add-client-role")||
                request.getRequestURI().equals("/api/auth/assign-client-role")||
                request.getRequestURI().equals("/api/auth/user_resource_role")||
                request.getRequestURI().equals("/api/role_resource_permission")||
                request.getRequestURI().equals("/api/auth/add_user")||
                request.getRequestURI().equals("/api/generateApp")||
                request.getRequestURI().equals("/api/resource_role")||
                request.getRequestURI().equals("/api/auth/user_role_mapping")||
                request.getRequestURI().equals("/api/getAllResourceMetaData")||
                request.getRequestURI().equals("/api/GetAllResource")||
                request.getRequestURI().startsWith("/api/getAllResourceMetaData/")||
                request.getRequestURI().startsWith("/api/generate_app_zip")||
                request.getRequestURI().startsWith("/api/auth/logout")) {

            filterChain.doFilter(request, response); // Allow the request to continue without role checks
            return;
        }


        RoleResourceAccess roleResourceAccess= RoleResourceAccess.getInstance(cId,isScoped);

        boolean baseResource = false;//true or false}
        try {
            baseResource = roleResourceAccess.getAccess(request);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }


        if (!baseResource) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied");
                return;

            }

            filterChain.doFilter(request, response);
        }

}
