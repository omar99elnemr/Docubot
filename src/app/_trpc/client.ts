import { AppRouter } from "@/trpc";
import { createTRPCReact } from "@trpc/react-query";

// Create the TRPC client with the typed router
export const trpc = createTRPCReact<AppRouter>({})