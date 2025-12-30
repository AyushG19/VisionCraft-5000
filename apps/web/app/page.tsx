import {
  DotsPattern,
  TopSection,
  MainContent,
  BottomSection,
  FloatingShapes,
  DecorativeLines,
} from "@workspace/ui/index";
export default function Page() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-easy-bg">
      {/* Decorative dots pattern on the left */}
      <DotsPattern />

      {/* Top section with USERS badge and decorative elements */}
      <TopSection />

      {/* Main content area */}
      <MainContent />

      {/* Bottom section with shapes label */}
      <BottomSection />

      {/* Decorative floating shapes */}
      <FloatingShapes />

      {/* Decorative squiggly lines */}
      <DecorativeLines />
    </div>
  );
}
