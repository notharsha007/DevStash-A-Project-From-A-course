export default function DashboardPage() {
  return (
    <>
      <aside className="flex w-60 flex-col border-r border-border p-4">
        <h2 className="text-lg font-semibold text-muted-foreground">Sidebar</h2>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <h2 className="text-lg font-semibold text-muted-foreground">Main</h2>
      </main>
    </>
  );
}
