package com.rasp.app.config;

import com.rasp.app.controller.MetaDataController;
import com.rasp.app.helper.RoleResourcePermissionHelper;
import com.rasp.app.helper.RoleUserResInstanceHelper;
import com.rasp.app.resource.MetaDataDto;
import com.rasp.app.resource.RoleResourcePermission;
import com.rasp.app.resource.RoleUserResInstance;
import jakarta.servlet.http.HttpServletRequest;
import org.json.JSONObject;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import platform.db.Expression;
import platform.db.REL_OP;
import platform.resource.BaseResource;

import java.io.UnsupportedEncodingException;
import java.util.*;

@Component
@Primary
public class RoleStrategyImplementation extends RoleStrategy {
    String resourceName = null;
    String userId;

    HttpServletRequest req = null;
    List<String> roles;

    String role;


    @Override
    public boolean hasAccess(String role, String action, String resourceType, String resourceId, String userId) throws Exception {

     BaseResource baseResource=   accessLogic(role, action, resourceType, resourceId, userId);
     if (baseResource!=null){
         return true;
     }
     return false;

    }

    private BaseResource accessLogic(String role, String action, String resourceName, String resourceInstance, String userId) throws UnsupportedEncodingException {
        if (action.equals("add") || action.equals("GET_ALL") || action.equals("DELETE_aLL")) {
            RoleResourcePermission roleResourcePermission = (RoleResourcePermission) RoleResourcePermissionHelper.getInstance().
                    getByExpressionFirstRecord(Expression.and(new Expression(RoleResourcePermission.
                                    FIELD_ROLE, REL_OP.EQ, role),
                            new Expression(RoleResourcePermission.FIELD_ACTION, REL_OP.EQ, action),
                            new Expression(RoleResourcePermission.FIELD_RESOURCE, REL_OP.EQ, resourceName)));

            if (roleResourcePermission != null) {
                this.role = role;
                if (action.equals("add")) {
                    Boolean hasAccess = getForeignAccess();
                    if (hasAccess == false) {
                        return null;
                    } else {

                        return roleResourcePermission;

                    }
                }

            }
        }
        if (resourceInstance == null) {

            RoleResourcePermission roleResourcePermission = (RoleResourcePermission) RoleResourcePermissionHelper.getInstance().
                    getByExpressionFirstRecord(Expression.and(new Expression(RoleResourcePermission.
                                    FIELD_ROLE, REL_OP.EQ, role),
                            new Expression(RoleResourcePermission.FIELD_ACTION, REL_OP.EQ, action),
                            new Expression(RoleResourcePermission.FIELD_RESOURCE, REL_OP.EQ, resourceName)));

            if (roleResourcePermission != null) {
                return roleResourcePermission;
            }
        }
        RoleResourcePermission roleResourcePermission = (RoleResourcePermission) RoleResourcePermissionHelper.getInstance().
                getByExpressionFirstRecord(Expression.and(new Expression(RoleResourcePermission.
                                FIELD_ROLE, REL_OP.EQ, role),
                        new Expression(RoleResourcePermission.FIELD_ACTION, REL_OP.EQ, action),
                        new Expression(RoleResourcePermission.FIELD_RESOURCE, REL_OP.EQ, resourceName)));

        if (roleResourcePermission != null) {
            RoleUserResInstance roleUserResInstance1 = (RoleUserResInstance) RoleUserResInstanceHelper.getInstance().
                    getByExpressionFirstRecord(Expression.and(new Expression(RoleUserResInstance.
                                    FIELD_ROLE_NAME, REL_OP.EQ, role),
                            new Expression(RoleUserResInstance.FIELD_RASP_USER_ID, REL_OP.EQ, userId),
                            new Expression(RoleUserResInstance.FIELD_RESOURCE_ID, REL_OP.EQ, resourceInstance)));
            if (roleUserResInstance1 != null) {
                return roleUserResInstance1;

            }

        }



        return null;
    }

    public boolean getForeignAccess() throws UnsupportedEncodingException {

        String user = getUserId();
        String res = resourceName;
        List<Map<String, String>> foreignResource = new ArrayList<>();
        List<MetaDataDto> dtos =new MetaDataController().processMetadata(resourceName);
        List<Map<String, Object>> fields = dtos.getFirst().getFieldValues();
        for (Map<String, Object> field : fields) {
            if (field.containsKey("foreign")) {
                String fKey = (String) field.get("foreign");
                String fName = (String) field.get("name");
                Map<String, String> foreignMap = new HashMap<>();
                foreignMap.put("resource", fKey);
                foreignMap.put("name", fName);
                foreignResource.add(foreignMap);
            }
        }
        if (!foreignResource.isEmpty()) {
            String base64Encoded = req.getParameter("resource");
            byte[] decodedBytes = Base64.getDecoder().decode(base64Encoded);
            String json = new String(decodedBytes, "UTF-8");

            // Parse JSON
            JSONObject object = new JSONObject(json);

            for (Map<String, String> foreignField : foreignResource) {
                String resource = foreignField.get("resource");
                String updatedResource = resource.substring(0, 1).toLowerCase() + resource.substring(1);
                String fieldName = foreignField.get("name");
                String foreign_id = object.getString(fieldName);


                RoleResourcePermission roleResourcePermission = (RoleResourcePermission) RoleResourcePermissionHelper.getInstance().
                        getByExpressionFirstRecord(Expression.and(new Expression(RoleResourcePermission.
                                        FIELD_ROLE, REL_OP.EQ, role),
                                new Expression(RoleResourcePermission.FIELD_ACTION, REL_OP.EQ, "GET_BY_ID"),
                                new Expression(RoleResourcePermission.FIELD_RESOURCE, REL_OP.EQ, updatedResource)));

                if(roleResourcePermission==null){
                    return false;
                }
                else{

                    RoleUserResInstance roleUserResInstance1 = (RoleUserResInstance) RoleUserResInstanceHelper.getInstance().
                            getByExpressionFirstRecord(Expression.and(new Expression(RoleUserResInstance.
                                            FIELD_ROLE_NAME, REL_OP.EQ, role),
                                    new Expression(RoleUserResInstance.FIELD_RASP_USER_ID, REL_OP.EQ, userId),
                                    new Expression(RoleUserResInstance.FIELD_RESOURCE_ID, REL_OP.EQ, foreign_id)));

                    if (roleUserResInstance1 == null) {
                        return false;
                    }
                }
            }


        }
        else{
            return true;
        }

        return true;
    }

    public static String getUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String raspuserId = null;
        if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            raspuserId = jwt.getClaim("custom_id");
        }
        return raspuserId;
    }
}

