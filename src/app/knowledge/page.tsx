import type { Metadata } from "next";
import { KnowledgeView } from "./KnowledgeView";

export const metadata: Metadata = {
  title: "Knowledge view — Sea View assistant (prototype)",
  robots: { index: false },
};

export default function KnowledgePage() {
  return <KnowledgeView />;
}
