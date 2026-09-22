"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";

interface Member {
  id: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function TeamMembers() {
  const { role } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("STAFF");
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const canInvite = role === "OWNER" || role === "ADMIN";

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api<{ members: Member[] }>("/api/organization/members");
      setMembers(result.members || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load team members");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInviting(true);
    setError("");
    setMessage("");

    try {
      await api("/api/organization/members/invite", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), role: inviteRole }),
      });
      setMessage(`Invitation sent to ${email.trim()}`);
      setEmail("");
      setInviteRole("STAFF");
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite member");
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-zinc-950">Team members</h2>
        <p className="mt-1 text-sm text-zinc-500">People who have access to this organization.</p>

        <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200">
          {loading ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : members.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No team members found" description="Your organization does not have any active members yet." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-zinc-700">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-zinc-700">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-zinc-700">Role</th>
                    <th className="px-4 py-3 text-left font-semibold text-zinc-700">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {members.map((member) => (
                    <tr key={member.id} className="bg-white">
                      <td className="px-4 py-3 font-medium text-zinc-900">{member.user.name}</td>
                      <td className="px-4 py-3 text-zinc-500">{member.user.email}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold capitalize text-zinc-700">
                          {member.role.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-500">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {canInvite && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-zinc-950">Invite team member</h3>
          <p className="mt-1 text-sm text-zinc-500">
            The person must already have an account. They can register first, then you can add them here.
          </p>

          <form onSubmit={handleInvite} className="mt-5 max-w-md space-y-4">
            {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            {message && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}

            <div>
              <label htmlFor="team-invite-email" className="block text-sm font-medium text-zinc-700">Email</label>
              <input
                id="team-invite-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="staff@example.com"
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
              />
            </div>

            <div>
              <label htmlFor="team-invite-role" className="block text-sm font-medium text-zinc-700">Role</label>
              <select
                id="team-invite-role"
                value={inviteRole}
                onChange={(event) => setInviteRole(event.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
              >
                <option value="STAFF">Staff</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={inviting}
              className="rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {inviting ? "Inviting..." : "Send invite"}
            </button>
          </form>
        </div>
      )}

      {!canInvite && (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-500">
          Only Owners and Admins can invite team members.
        </div>
      )}
    </div>
  );
}
