import { Navbar } from "@/components/navbar"

export function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-white">
      <Navbar />
      <main className="flex-1 overflow-x-hidden relative">
        <div className="max-w-6xl mx-auto px-6 py-12 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  )
}
