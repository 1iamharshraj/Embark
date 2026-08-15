"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { PasswordForm } from "@/app/account/_components/PasswordForm";
import { ImageUpload } from "@/app/account/_components/ImageUpload";

interface ExpertAccountClientProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    image: string | null;
  };
}

export default function ExpertAccountClient({ user }: ExpertAccountClientProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [image, setImage] = useState(user.image || "");
  const [saving, setSaving] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), image }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message || "Failed to update profile.");
        return;
      }
      toast.success("Profile updated");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!deletePassword.trim()) {
      toast.error("Enter your password to confirm.");
      return;
    }
    if (!confirm("This will permanently delete your account and all associated data. Are you sure?")) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to delete account.");
        return;
      }
      toast.success("Account deleted");
      signOut({ callbackUrl: "/" });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal">Account</h1>
        <p className="text-inkSoft text-sm mt-1">Manage your personal details, password and account.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
        <h2 className="font-display font-bold text-xl text-charcoal mb-1">Profile details</h2>
        <p className="text-inkSoft text-sm mb-6">Update your name, phone and profile photo.</p>
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <ImageUpload value={image} onChange={setImage} folder="profiles" />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="expert-name" className="text-sm font-semibold text-charcoal">
              Full name
            </label>
            <input
              id="expert-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="expert-email" className="text-sm font-semibold text-charcoal">
              Email
            </label>
            <input
              id="expert-email"
              type="email"
              value={user.email || ""}
              disabled
              className="w-full rounded-xl bg-cream/70 border border-transparent px-4 py-3 text-inkSoft cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="expert-phone" className="text-sm font-semibold text-charcoal">
              Phone
            </label>
            <input
              id="expert-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-7 py-3.5 hover:bg-[#1740A8] transition disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save profile"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
        <h2 className="font-display font-bold text-xl text-charcoal mb-1">Change password</h2>
        <p className="text-inkSoft text-sm mb-6">Update your password to keep your account secure.</p>
        <PasswordForm />
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8 border border-red-100">
        <h2 className="font-display font-bold text-xl text-charcoal mb-1">Delete account</h2>
        <p className="text-inkSoft text-sm mb-6">
          This will permanently remove your account, expert profile, bookings and all related data.
          This action cannot be undone.
        </p>
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="delete-password" className="text-sm font-semibold text-charcoal">
              Enter your password to confirm
            </label>
            <input
              id="delete-password"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={deleting}
            className="inline-flex items-center justify-center rounded-full font-semibold bg-red-600 text-white px-7 py-3.5 hover:bg-red-700 transition disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete my account"}
          </button>
        </form>
      </div>
    </div>
  );
}
