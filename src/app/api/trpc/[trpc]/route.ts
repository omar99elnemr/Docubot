// This file defines the server-side entry point for handling TRPC requests.

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/trpc';

const handler = (req: Request) =>
 // This function parses the request and executes the corresponding TRPC procedure based on the method and headers.
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({})
  });


// Exports the `handler` function as both GET and POST, enabling it to handle both request methods.
export { handler as GET, handler as POST };