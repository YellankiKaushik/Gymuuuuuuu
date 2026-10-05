import { createFileRoute } from "@tanstack/react-router";
import { DataManagementPage } from "../features/data-management/page";
export const Route = createFileRoute("/settings/data/restore")({ component: () => <DataManagementPage section="restore" /> });
