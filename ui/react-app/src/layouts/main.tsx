import { Navbar } from "../components/Navbar";
import { navigationHeight } from "../constants";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main
        className="overflow-hidden w-full"
        style={{
          height: `calc(100vh - ${navigationHeight}px)`,
          maxHeight: `calc(100vh - ${navigationHeight}px)`,
        }}
      >
        {children}
      </main>
    </>
  );
}
