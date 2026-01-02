package com.rasp.app;
import com.rasp.app.decorator.RoundsDecorator;
import platform.decorator.DecoratorManager;
import platform.helper.HelperManager;
import platform.webservice.ServiceManager;
import com.rasp.app.helper.*;
import com.rasp.app.service.*;
public class Registry {
		public static void register(){
				 HelperManager.getInstance().register(DriveHelper.getInstance());
				 HelperManager.getInstance().register(ResourceRoleHelper.getInstance());
				 HelperManager.getInstance().register(RoleResourcePermissionHelper.getInstance());
				 HelperManager.getInstance().register(RoleUserResInstanceHelper.getInstance());
				 HelperManager.getInstance().register(RoundsHelper.getInstance());
				 HelperManager.getInstance().register(StudentHelper.getInstance());
				 HelperManager.getInstance().register(TestHelper.getInstance());
				 HelperManager.getInstance().register(UsersHelper.getInstance());
				 HelperManager.getInstance().register(UserDriveMapHelper.getInstance());
				 HelperManager.getInstance().register(UserRoundMapHelper.getInstance());
				 ServiceManager.getInstance().register(new DriveService());
				 ServiceManager.getInstance().register(new ResourceRoleService());
				 ServiceManager.getInstance().register(new RoleResourcePermissionService());
				 ServiceManager.getInstance().register(new RoleUserResInstanceService());
				 ServiceManager.getInstance().register(new RoundsService());
				 ServiceManager.getInstance().register(new StudentService());
				 ServiceManager.getInstance().register(new TestService());
				 ServiceManager.getInstance().register(new UsersService());
				 ServiceManager.getInstance().register(new UserDriveMapService());
				 ServiceManager.getInstance().register(new UserRoundMapService());
                 DecoratorManager.getInstance().register(new RoundsDecorator());
		}
}
