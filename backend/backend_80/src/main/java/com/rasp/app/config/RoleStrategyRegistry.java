package com.rasp.app.config;

import java.util.HashMap;
import java.util.Map;

public class RoleStrategyRegistry {
    private  final Map<String, RoleStrategy> strategyMap = new HashMap<>();
    private final RoleStrategy defaultStrategy = new DefultRoleStrategy();
    // Singleton instance
    private static RoleStrategyRegistry instance;

    public RoleStrategyRegistry() {
        strategyMap.put("SUPER_ADMIN", new RoleStrategyImplementation());
        strategyMap.put("DefultRoleStrategy", defaultStrategy);
    }
    public RoleStrategy getStrategy(String role) {
        if (role == null) return defaultStrategy;
        return strategyMap.getOrDefault(role.toUpperCase(), defaultStrategy);
    }
    // Public method to get singleton instance
    public static synchronized RoleStrategyRegistry getInstance() {
        if (instance == null) {
            instance = new RoleStrategyRegistry();
        }
        return instance;
    }
}
