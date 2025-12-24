package com.rasp.app.config;

public class DefultRoleStrategy extends RoleStrategy {
    @Override
    public boolean hasAccess(String role, String action, String resourceType, String resourceId, String userId) throws Exception {
        return false;
    }
}
