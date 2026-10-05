import { createFileRoute } from "@tanstack/react-router";
import { DataManagementPage } from "../features/data-management/page";
export const Route = createFileRoute("/settings/data/backup")({ component: () => <DataManagementPage section="backup" /> });
