package com.rasp.app.config;

import org.springframework.stereotype.Component;

@Component
public abstract class RoleStrategy {
    abstract public boolean hasAccess(String role, String action,String resourceType, String resourceId,String userId) throws Exception;

}
