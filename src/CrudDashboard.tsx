import CssBaseline from '@mui/material/CssBaseline';
import { createHashRouter, Navigate, RouterProvider } from 'react-router';
import DashboardLayout from './components/DashboardLayout';
import EmployeeList from './components/EmployeeList';
import EmployeeShow from './components/EmployeeShow';
import EmployeeCreate from './components/EmployeeCreate';
import EmployeeEdit from './components/EmployeeEdit';
import NotificationsProvider from './hooks/useNotifications/NotificationsProvider';
import DialogsProvider from './hooks/useDialogs/DialogsProvider';
import AppTheme from './theme/AppTheme';
import SignIn from './pages/SignIn';
import {
  dataGridCustomizations,
  datePickersCustomizations,
  sidebarCustomizations,
  formInputCustomizations,
} from './theme/customizations';
import SignUp from './pages/SignUp';

import ProductList from './components/ProductList';
import ProductCreate from './components/ProductCreate';
import ProductEdit from './components/ProductEdit';
import ProductShow from './components/ProductShow';
import ProductImages from './components/ProductImages';
import TagList from './components/arguments/TagList';
import VariantTypeList from './components/arguments/VariantTypeList';
import VideoList from './components/VideoList';
import VideoCreate from './components/VideoCreate';
import VideoEdit from './components/VideoEdit';
import OrderList from './components/OrderList';
import OrderShow from './components/OrderShow';
import UserList from './components/UserList';
import UserShow from './components/UserShow';



const router = createHashRouter([
  {
    path: '/',
    element: <Navigate to="/log-in" replace />,
  },
  {
    path: '/log-in',
    Component: SignIn,
  },
    {
    path: '/sign-up',
    Component: SignUp,
  },
  {
    Component: DashboardLayout,
    children: [
      {
        path: '/employees',
        Component: EmployeeList,
      },
      {
        path: '/employees/:employeeId',
        Component: EmployeeShow,
      },
      {
        path: '/employees/new',
        Component: EmployeeCreate,
      },
      {
        path: '/employees/:employeeId/edit',
        Component: EmployeeEdit,
      },
      {
        path: '/products',
        element: <ProductList />,
      },
      {
        path: '/products/new',
        element: <ProductCreate />,
      },
      {
        path: '/products/:productId',
        element: <ProductShow />,
      },
      {
        path: '/products/:productId/edit',
        element: <ProductEdit />,
      },
      {
        path: '/products/:productId/images',
        element: <ProductImages />,
      },


      {
        path: '/tags',
        element: <TagList />,
      },
      {
        path: '/variants',
        element: <VariantTypeList />,
      },
      {
        path: '/videos',
        element: <VideoList />,
      },
      {
        path: '/videos/new',
        element: <VideoCreate />,
      },
      {
        path: '/videos/:videoId/edit',
        element: <VideoEdit />,
      },
      {
        path: '/orders',
        element: <OrderList />,
      },
      {
        path: '/orders/:orderId',
        element: <OrderShow />,
      },
      {
        path: '/users',
        element: <UserList />,
      },
      {
        path: '/users/:userId',
        element: <UserShow />,
      },

      // Fallback route for the example routes in dashboard sidebar items
      {
        path: '*',
        Component: OrderList,
      },
    ],
  },
]);

const themeComponents = {
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...sidebarCustomizations,
  ...formInputCustomizations,
};

export default function CrudDashboard(props: { disableCustomTheme?: boolean }) {
  return (
    <>
      <CssBaseline enableColorScheme />
      <NotificationsProvider>
        <DialogsProvider>
          <RouterProvider router={router} />
        </DialogsProvider>
      </NotificationsProvider>
    </>
  );
}
