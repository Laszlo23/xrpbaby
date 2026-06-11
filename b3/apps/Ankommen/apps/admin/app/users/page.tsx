export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Users</h1>
      <p className="text-muted-foreground mt-2">Requires ADMIN role JWT. Connect via API /admin/users.</p>
    </div>
  );
}
