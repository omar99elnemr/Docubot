import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

/**
 * This function handles GET requests related to Kinde authentication.
 * It extracts the `kindeAuth` parameter from the URL and passes it to the
 * `handleAuth` function from the Kinde auth library.
 *
 * @param request The incoming Next.js request object.
 * @returns The response from the `handleAuth` function.
 */
export async function GET(request: NextRequest, { params }: any) {
  // Extract the endpoint from the URL parameters.
  const endpoint = params.kindeAuth;

  // Use the Kinde auth library to handle the request.
  return handleAuth(request, endpoint);
}
