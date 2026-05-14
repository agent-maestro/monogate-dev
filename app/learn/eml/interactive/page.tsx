import type { Metadata } from "next";
import InteractiveCourseClient from "./InteractiveCourseClient";

export const metadata: Metadata = {
  title: "EML Lab — Learn EML by Compiling",
  description:
    "Interactive EML lessons with a live editor, local browser checks, target previews, and kernel contract notes.",
};

export default function InteractiveEmlLabPage() {
  return <InteractiveCourseClient />;
}
