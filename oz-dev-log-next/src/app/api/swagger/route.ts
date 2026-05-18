import { getApiDocs } from "@/lib/swagger";
import { errorResponse } from "@/lib/errors";

export async function GET() {
  try {
    const spec = getApiDocs();
    return Response.json(spec);
  } catch (err) {
    return errorResponse(err);
  }
}
