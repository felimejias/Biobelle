import { getDb } from "../../../db";
import { getClinicTreatments } from "../../treatment-service";

export async function GET() {
  const treatments = await getClinicTreatments(getDb(), true);
  return Response.json({ treatments });
}
