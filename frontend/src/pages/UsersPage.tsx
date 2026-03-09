import { useEffect, useState } from "react";
import { getUsers } from "@/services/apiService";
import { StatusBadge } from "@/components/StatusBadge";

// TODO: GET /api/users

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => { getUsers().then(setUsers); }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manajemen User</h1>
        <p className="page-subtitle">Kelola pengguna sistem</p>
      </div>
      <div className="stat-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left text-muted-foreground">Nama</th>
              <th className="p-3 text-left text-muted-foreground">Email</th>
              <th className="p-3 text-left text-muted-foreground hidden sm:table-cell">Role</th>
              <th className="p-3 text-left text-muted-foreground hidden md:table-cell">Instansi</th>
              <th className="p-3 text-left text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 hidden sm:table-cell"><span className="rounded bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">{u.role}</span></td>
                <td className="p-3 hidden md:table-cell">{u.instansi}</td>
                <td className="p-3"><StatusBadge status={u.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
