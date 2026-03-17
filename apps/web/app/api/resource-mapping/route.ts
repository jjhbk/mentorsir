import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import {
  MAINS_TEST_SERIES,
  OPTIONAL_SUBJECT_OPTIONS,
  PRELIMS_PYQ_OPTIONS,
  PRELIMS_TEST_SERIES_OPTIONS,
  RESOURCE_MAPPING_TEMPLATE,
} from "@/lib/resourceMappingTemplate";

function toText(value: FormDataEntryValue | null): string | null {
  const text = value?.toString().trim() ?? "";
  return text ? text : null;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roleRows = await prisma.$queryRaw<{ role: string }[]>`
    SELECT role::text AS role FROM profiles WHERE id = ${user.id}::uuid LIMIT 1
  `;
  const role = roleRows[0]?.role;
  const isAdmin = isAdminEmail(user.email);
  if (!isAdmin && role !== "mentor") {
    return NextResponse.json({ error: "Only mentors/admin can update resources" }, { status: 403 });
  }

  const form = await request.formData();
  const rowKey = toText(form.get("rowKey"));
  if (!rowKey) {
    return NextResponse.json({ error: "Row key is required" }, { status: 400 });
  }
  const existsInTemplate = RESOURCE_MAPPING_TEMPLATE.some((entry) => entry.rowKey === rowKey);
  if (!existsInTemplate) {
    return NextResponse.json({ error: "Invalid row key" }, { status: 400 });
  }

  const selectedResource = toText(form.get("resource"));
  const optionalOtherResource = toText(form.get("optionalOtherResource"));
  const resource =
    rowKey === "optional" && selectedResource === "Other"
      ? optionalOtherResource
      : selectedResource;
  const prelimsPyqPractice = toText(form.get("prelimsPyqPractice"));
  const prelimsTestSeries = toText(form.get("prelimsTestSeries"));
  const mainsPyq = toText(form.get("mainsPyq"));

  if (rowKey === "optional" && selectedResource) {
    const validOptionalSelections = [...OPTIONAL_SUBJECT_OPTIONS, "Other"] as const;
    if (!(validOptionalSelections as readonly string[]).includes(selectedResource)) {
      return NextResponse.json({ error: "Invalid optional subject option" }, { status: 400 });
    }
    if (selectedResource === "Other" && !optionalOtherResource) {
      return NextResponse.json({ error: "Please provide custom optional subject" }, { status: 400 });
    }
  }

  if (prelimsPyqPractice && !(PRELIMS_PYQ_OPTIONS as readonly string[]).includes(prelimsPyqPractice)) {
    return NextResponse.json({ error: "Invalid Prelims PYQ option" }, { status: 400 });
  }
  if (prelimsTestSeries && !(PRELIMS_TEST_SERIES_OPTIONS as readonly string[]).includes(prelimsTestSeries)) {
    return NextResponse.json({ error: "Invalid Prelims test series option" }, { status: 400 });
  }
  if (mainsPyq && !(MAINS_TEST_SERIES as readonly string[]).includes(mainsPyq)) {
    return NextResponse.json({ error: "Invalid Mains PYQ option" }, { status: 400 });
  }

  await prisma.$executeRaw`
    INSERT INTO resource_mapping_values (
      owner_id,
      row_key,
      resource,
      prelims_pyq_practice,
      prelims_test_series,
      mains_pyq
    )
    VALUES (
      ${user.id}::uuid,
      ${rowKey},
      ${resource},
      ${prelimsPyqPractice},
      ${prelimsTestSeries},
      ${mainsPyq}
    )
    ON CONFLICT (owner_id, row_key)
    DO UPDATE SET
      resource = EXCLUDED.resource,
      prelims_pyq_practice = EXCLUDED.prelims_pyq_practice,
      prelims_test_series = EXCLUDED.prelims_test_series,
      mains_pyq = EXCLUDED.mains_pyq,
      updated_at = NOW()
  `;

  return NextResponse.redirect(new URL("/dashboard?resourceSaved=1", request.url), { status: 303 });
}
