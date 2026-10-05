import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { DataManagementPage } from "../features/data-management/page";
export const Route = createFileRoute("/settings/data")({ component: DataManagementRoute });
function DataManagementRoute() { const { pathname } = useLocation(); return <>{pathname === "/settings/data" && <DataManagementPage section="home" />}<Outlet /></>; }
