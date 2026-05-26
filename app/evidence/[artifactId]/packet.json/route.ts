import { NextResponse } from "next/server";
import { artifacts, findArtifact } from "../../data";

type Params = {
  params: {
    artifactId: string;
  };
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return artifacts.map((artifact) => ({ artifactId: artifact.id }));
}

export function GET(_request: Request, { params }: Params) {
  const artifact = findArtifact(params.artifactId);
  if (!artifact) {
    return NextResponse.json({ error: "artifact_not_found" }, { status: 404 });
  }

  return NextResponse.json(artifact.reviewPacket, {
    headers: {
      "cache-control": "public, max-age=300",
    },
  });
}
