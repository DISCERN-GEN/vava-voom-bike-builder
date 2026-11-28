import { createFileRoute, redirect } from "@tanstack/react-router";

// The old /collection page is now the catalogue. Keep old links working.
export const Route = createFileRoute("/collection")({
  beforeLoad: () => {
    throw redirect({ to: "/catalogue" });
  },
});
