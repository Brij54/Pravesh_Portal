//package com.rasp.app.decorator;
//
//import com.rasp.app.helper.DriveHelper;
//import com.rasp.app.resource.Drive;
//import com.rasp.app.resource.Rounds;
//
//import platform.db.Expression;
//import platform.db.REL_OP;
//import platform.decorator.BaseDecorator;
//import platform.exception.ExceptionEnum;
//import platform.resource.BaseResource;
//import platform.util.ApplicationException;
//import platform.util.ExceptionSeverity;
//import platform.webservice.BaseService;
//import platform.webservice.ServletContext;
//
//import java.util.ArrayList;
//import java.util.Collections;
//import java.util.Map;
//
//public class RoundsDecorator extends BaseDecorator {
//
//    // Frontend will call: /api/rounds?queryId=GET_DRIVE_OPTIONS
//    public static final String Q_GET_DRIVE_OPTIONS = "GET_DRIVE_OPTIONS";
//
//    public RoundsDecorator() {
//        super(new Rounds());
//    }
//
//    // ✅ validate drive_id exists when creating round
//    @Override
//    public void preAddDecorator(ServletContext ctx, BaseResource _resource) throws ApplicationException {
//        Rounds r = (Rounds) _resource;
//        validateDriveId(r.getDrive_id());
//    }
//
//    // ✅ validate drive_id exists when modifying (only if provided)
//    @Override
//    public void preModifyDecorator(ServletContext ctx, BaseResource _resource) throws ApplicationException {
//        Rounds r = (Rounds) _resource;
//        if (r.getDrive_id() != null && !r.getDrive_id().trim().isEmpty()) {
//            validateDriveId(r.getDrive_id());
//        }
//    }
//
//    // ✅ Query endpoint for dropdown
//    @Override
//    public BaseResource[] getQuery(ServletContext ctx,
//                                   String queryId,
//                                   Map<String, Object> map,
//                                   BaseService service) throws ApplicationException {
//
//        if (Q_GET_DRIVE_OPTIONS.equalsIgnoreCase(queryId)) {
//            ArrayList<BaseResource> list = new ArrayList<>();
//
//            // Return only active drives (archived = "N")
//            BaseResource[] drives = DriveHelper.getInstance().getByExpression(
//                    new Expression("archived", REL_OP.EQ, "N")
//            );
//
//            if (drives != null) Collections.addAll(list, drives);
//            return list.toArray(new BaseResource[0]);
//        }
//
//        // same behavior as BaseDecorator default (invalid query)
//        throw new ApplicationException(ExceptionSeverity.ERROR, ExceptionEnum.INVALID_QUERY);
//    }
//
//    private void validateDriveId(String driveId) throws ApplicationException {
//        if (driveId == null || driveId.trim().isEmpty()) {
//            throw new ApplicationException(ExceptionSeverity.ERROR, "drive_id is required");
//        }
//
//        Drive d = (Drive) DriveHelper.getInstance().getById(driveId.trim());
//        if (d == null) {
//            throw new ApplicationException(ExceptionSeverity.ERROR, "Invalid drive_id: " + driveId);
//        }
//
//        if ("Y".equalsIgnoreCase(d.getArchived())) {
//            throw new ApplicationException(ExceptionSeverity.ERROR, "Drive is archived: " + driveId);
//        }
//    }
//}
package com.rasp.app.decorator;

import com.rasp.app.helper.DriveHelper;
import com.rasp.app.resource.Drive;
import com.rasp.app.resource.Rounds;

import platform.db.Expression;
import platform.db.REL_OP;
import platform.decorator.BaseDecorator;
import platform.exception.ExceptionEnum;
import platform.resource.BaseResource;
import platform.util.ApplicationException;
import platform.util.ExceptionSeverity;
import platform.webservice.BaseService;
import platform.webservice.ServletContext;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Map;

public class RoundsDecorator extends BaseDecorator {
    public static final String Q_GET_DRIVE_OPTIONS = "GET_DRIVE_OPTIONS";

    public RoundsDecorator() {
        super(new Rounds());
    }

    @Override
    public void preAddDecorator(ServletContext ctx, BaseResource _resource) throws ApplicationException {
        Rounds r = (Rounds) _resource;
        validateDriveId(r.getDrive_id());
    }

    @Override
    public void preModifyDecorator(ServletContext ctx, BaseResource _resource) throws ApplicationException {
        Rounds r = (Rounds) _resource;
        if (r.getDrive_id() != null && !r.getDrive_id().trim().isEmpty()) {
            validateDriveId(r.getDrive_id());
        }
    }

    @Override
    public BaseResource[] getQuery(ServletContext ctx,
                                   String queryId,
                                   Map<String, Object> map,
                                   BaseService service) throws ApplicationException {

        if (Q_GET_DRIVE_OPTIONS.equalsIgnoreCase(queryId)) {
            ArrayList<BaseResource> list = new ArrayList<>();

            // Return active drives (archived="N")
            BaseResource[] drives = DriveHelper.getInstance().getByExpression(
                    new Expression("archived", REL_OP.EQ, "N")
            );

            if (drives != null) Collections.addAll(list, drives);
            return list.toArray(new BaseResource[0]);
        }

        throw new ApplicationException(ExceptionSeverity.ERROR, ExceptionEnum.INVALID_QUERY);
    }

    private void validateDriveId(String driveId) throws ApplicationException {
        if (driveId == null || driveId.trim().isEmpty()) {
            throw new ApplicationException(ExceptionSeverity.ERROR, "drive_id is required");
        }

        Drive d = (Drive) DriveHelper.getInstance().getById(driveId.trim());
        if (d == null) {
            throw new ApplicationException(ExceptionSeverity.ERROR, "Invalid drive_id: " + driveId);
        }

        if ("Y".equalsIgnoreCase(d.getArchived())) {
            throw new ApplicationException(ExceptionSeverity.ERROR, "Drive is archived: " + driveId);
        }
    }
}
