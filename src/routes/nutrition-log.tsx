import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/nutrition-log")({
  beforeLoad: () => {
    throw redirect({ to: "/nutrition" });
  },
});
