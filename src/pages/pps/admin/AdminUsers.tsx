import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeadshotEditor from "@/components/pps/admin/HeadshotEditor";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, UserPlus, Shield, MoreHorizontal, Pencil, KeyRound, UserCog, UserX, UserCheck, Trash2, Upload, Mail, Crop } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  is_active: boolean;
  is_author: boolean;
  is_guest_author: boolean;
  author_bio: string | null;
  avatar_url: string | null;
  created_at: string;
  editor_sections: string[];
}

const roleBadgeClass: Record<string, string> = {
  admin: "bg-primary/20 text-primary",
  editor: "bg-muted text-muted-foreground",
  contributor: "bg-gold/20 text-gold",
  author: "bg-lime/20 text-lime",
};

const roleDescriptions: Record<string, string> = {
  admin: "Full access to all admin features including user management.",
  editor: "Can create, edit, and manage content in assigned sections.",
  contributor: "Can create and edit only their own blog posts. Cannot manage post settings.",
  author: "Author profile only, no admin portal access. Used for blog attribution.",
};

const ALL_SECTIONS = ["Blog", "Media", "YouTube"] as const;

export default function AdminUsers() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Invite form state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [inviteIsAuthor, setInviteIsAuthor] = useState(false);
  const [inviteIsGuestAuthor, setInviteIsGuestAuthor] = useState(false);
  const [inviteAuthorBio, setInviteAuthorBio] = useState("");
  const [inviteAvatarUrl, setInviteAvatarUrl] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteEditorSections, setInviteEditorSections] = useState<string[]>([...ALL_SECTIONS]);
  const [uploadingInviteAvatar, setUploadingInviteAvatar] = useState(false);

  // Edit profile dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("editor");
  const [editIsAuthor, setEditIsAuthor] = useState(false);
  const [editIsGuestAuthor, setEditIsGuestAuthor] = useState(false);
  const [editAuthorBio, setEditAuthorBio] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [editEditorSections, setEditEditorSections] = useState<string[]>([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState<Profile | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Email change dialog state
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailChangeProfile, setEmailChangeProfile] = useState<Profile | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [changingEmail, setChangingEmail] = useState(false);

  // Headshot editor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorImageUrl, setEditorImageUrl] = useState("");
  const [editorTarget, setEditorTarget] = useState<"invite" | "edit">("invite");

  const openHeadshotEditor = (imageUrl: string, target: "invite" | "edit") => {
    setEditorImageUrl(imageUrl);
    setEditorTarget(target);
    setEditorOpen(true);
  };

  const handleEditorSave = async (blob: Blob) => {
    const path = `avatars/${Date.now()}.jpg`;
    const { error } = await supabase.storage.from("blog-images").upload(path, blob, { contentType: "image/jpeg" });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return;
    }
    const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
    if (editorTarget === "invite") {
      setInviteAvatarUrl(data.publicUrl);
    } else {
      setEditAvatarUrl(data.publicUrl);
    }
    setEditorOpen(false);
  };

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, is_active, is_author, is_guest_author, author_bio, avatar_url, created_at, editor_sections")
      .order("created_at", { ascending: true });
    setProfiles((data as Profile[]) || []);
  };

  // Check if current user is admin & fetch all profiles
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (myProfile?.role !== "admin") {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setIsAdmin(true);
      await fetchProfiles();
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleInviteAvatarUpload = async (file: File) => {
    setUploadingInviteAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `avatars/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("blog-images").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
      setInviteAvatarUrl(data.publicUrl);
    }
    setUploadingInviteAvatar(false);
  };

  const inviteShowIsAuthorCheckbox = inviteRole !== "author";
  const inviteShowAuthorFields = inviteRole === "author" || inviteIsAuthor;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);

    const authorFields = inviteShowAuthorFields
      ? {
          is_author: true,
          is_guest_author: inviteIsGuestAuthor,
          author_bio: inviteAuthorBio || null,
          avatar_url: inviteAvatarUrl || null,
        }
      : {};

    try {
      if (inviteRole === "author") {
        // Author-only: create a profile entry directly (no auth user)
        const { error } = await supabase.from("profiles").insert({
          id: crypto.randomUUID(),
          full_name: inviteName,
          role: "author",
          is_active: true,
          ...authorFields,
        });
        if (error) throw error;
        toast({ title: "Author profile created", description: `${inviteName} has been added as an author.` });
      } else {
        // Normal invite via edge function
        const { data, error } = await supabase.functions.invoke("invite-user", {
          body: {
            email: inviteEmail,
            fullName: inviteName,
            role: inviteRole,
          },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        toast({ title: "User created", description: `${inviteEmail} has been added as ${inviteRole}.` });

        // Update the profile with author/section fields if needed, wait for trigger to create it
        if (data?.userId) {
          let retries = 0;
          while (retries < 10) {
            const { data: existing } = await supabase.from("profiles").select("id").eq("id", data.userId).single();
            if (existing) break;
            await new Promise((r) => setTimeout(r, 500));
            retries++;
          }
          const profileUpdates: Record<string, any> = {};
          if (inviteShowAuthorFields) Object.assign(profileUpdates, authorFields);
          if (inviteRole === "editor") profileUpdates.editor_sections = inviteEditorSections;
          if (Object.keys(profileUpdates).length > 0) {
            await supabase.from("profiles").update(profileUpdates as never).eq("id", data.userId);
          }
        }
      }

      setDialogOpen(false);
      setInviteEmail("");
      setInviteName("");
      setInviteRole("editor");
      setInviteIsAuthor(false);
      setInviteIsGuestAuthor(false);
      setInviteAuthorBio("");
      setInviteAvatarUrl("");
      setInviteEditorSections([...ALL_SECTIONS]);
      await fetchProfiles();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (profileId: string, newRole: string) => {
    if (profileId === user?.id) {
      toast({ title: "Cannot change your own role", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", profileId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setProfiles((prev) =>
        prev.map((p) => (p.id === profileId ? { ...p, role: newRole } : p))
      );
      toast({ title: "Role updated" });
    }
  };

  const openEditDialog = (profile: Profile) => {
    setEditingProfile(profile);
    setEditName(profile.full_name || "");
    setEditEmail(profile.email || "");
    setEditRole(profile.role);
    setEditIsAuthor(profile.is_author);
    setEditIsGuestAuthor(profile.is_guest_author);
    setEditAuthorBio(profile.author_bio || "");
    setEditAvatarUrl(profile.avatar_url || "");
    setEditEditorSections(profile.editor_sections || []);
    setEditDialogOpen(true);
  };

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `avatars/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("blog-images").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
      setEditAvatarUrl(data.publicUrl);
    }
    setUploadingAvatar(false);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;
    setSaving(true);

    try {
      const updates: Record<string, any> = {};
      if (editName !== (editingProfile.full_name || "")) updates.full_name = editName;
      if (editingProfile.role === "author" && editEmail !== (editingProfile.email || "")) updates.email = editEmail || null;
      if (editRole !== editingProfile.role) {
        if (editingProfile.id === user?.id) {
          toast({ title: "Cannot change your own role", variant: "destructive" });
          setSaving(false);
          return;
        }
        updates.role = editRole;
      }
      if (editIsAuthor !== editingProfile.is_author) updates.is_author = editIsAuthor;
      if (editIsGuestAuthor !== editingProfile.is_guest_author) updates.is_guest_author = editIsGuestAuthor;
      if (editAuthorBio !== (editingProfile.author_bio || "")) updates.author_bio = editAuthorBio || null;
      if (editAvatarUrl !== (editingProfile.avatar_url || "")) updates.avatar_url = editAvatarUrl || null;
      if (editRole === "editor") {
        updates.editor_sections = editEditorSections;
      } else {
        updates.editor_sections = [];
      }

      // For author role, always mark is_author = true
      if (editRole === "author") {
        updates.is_author = true;
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", editingProfile.id);
        if (error) throw error;
      }

      setProfiles((prev) =>
        prev.map((p) =>
          p.id === editingProfile.id
            ? {
                ...p,
                full_name: editName,
                role: editRole,
                is_author: editRole === "author" ? true : editIsAuthor,
                is_guest_author: editIsGuestAuthor,
                author_bio: editAuthorBio || null,
                avatar_url: editAvatarUrl || null,
                editor_sections: editRole === "editor" ? editEditorSections : [],
              }
            : p
        )
      );
      toast({ title: "Profile updated" });
      setEditDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/login`,
      });
      if (error) throw error;
      toast({ title: "Password reset email sent", description: `A reset link was sent to ${email}.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleToggleActive = async (profile: Profile) => {
    if (profile.id === user?.id) {
      toast({ title: "Cannot deactivate your own account", variant: "destructive" });
      return;
    }
    const newStatus = !profile.is_active;
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: newStatus })
      .eq("id", profile.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setProfiles((prev) =>
        prev.map((p) => (p.id === profile.id ? { ...p, is_active: newStatus } : p))
      );
      toast({ title: newStatus ? "User reactivated" : "User deactivated" });
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingProfile) return;
    setDeleting(true);
    try {
      if (deletingProfile.role === "author" && !deletingProfile.email) {
        // Author-only profile: just delete from profiles
        const { error } = await supabase
          .from("profiles")
          .delete()
          .eq("id", deletingProfile.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.functions.invoke("delete-user", {
          body: { userId: deletingProfile.id },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
      }

      setProfiles((prev) => prev.filter((p) => p.id !== deletingProfile.id));
      toast({ title: "User deleted", description: `${deletingProfile.full_name || deletingProfile.email} has been permanently removed.` });
      setDeleteDialogOpen(false);
      setDeletingProfile(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const handleEmailChange = async () => {
    if (!emailChangeProfile || !newEmail) return;
    setChangingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke("update-user-email", {
        body: { userId: emailChangeProfile.id, newEmail },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setProfiles((prev) =>
        prev.map((p) => (p.id === emailChangeProfile.id ? { ...p, email: newEmail } : p))
      );
      toast({ title: "Email updated", description: `Email changed to ${newEmail}.` });
      setEmailDialogOpen(false);
      setEmailChangeProfile(null);
      setNewEmail("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setChangingEmail(false);
    }
  };

  const openEmailChangeDialog = (profile: Profile) => {
    setEmailChangeProfile(profile);
    setNewEmail(profile.email || "");
    setEmailDialogOpen(true);
  };

  // Determine if "Is Author" fields should show
  const showIsAuthorCheckbox = editRole !== "author"; // Author role is always an author
  const showAuthorFields = editRole === "author" || editIsAuthor;

  if (!loading && !isAdmin) {
    return (
      <div className="min-h-full flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-navy mb-2">Admin Access Required</h1>
          <p className="text-muted-foreground mb-4">You need admin privileges to manage users.</p>
          <Button variant="outline" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 min-h-full">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-navy">User Management</h1>
            <p className="text-sm text-muted-foreground">Manage team members and author profiles</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-1" /> Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{inviteRole === "author" ? "Add Author Profile" : "Invite New User"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4 mt-2">
                <div>
                  <Label htmlFor="invite-name">Full Name</Label>
                  <Input
                    id="invite-name"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    required
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="invite-role">Role</Label>
                  <Select value={inviteRole} onValueChange={(v) => {
                    setInviteRole(v);
                    if (v === "author") setInviteIsAuthor(true);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="contributor">Contributor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="author">Author (Profile Only)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {roleDescriptions[inviteRole]}
                  </p>
                </div>
                {inviteRole === "editor" && (
                  <div>
                    <Label>Section Access</Label>
                    <div className="flex flex-col gap-2 mt-1.5">
                      {ALL_SECTIONS.map((section) => (
                        <div key={section} className="flex items-center gap-2">
                          <Checkbox
                            id={`invite-section-${section}`}
                            checked={inviteEditorSections.includes(section)}
                            onCheckedChange={(checked) => {
                              setInviteEditorSections((prev) =>
                                checked ? [...prev, section] : prev.filter((s) => s !== section)
                              );
                            }}
                          />
                          <Label htmlFor={`invite-section-${section}`} className="text-sm font-normal cursor-pointer">
                            {section}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Select which sections this editor can manage.</p>
                  </div>
                )}
                {inviteRole !== "author" && (
                  <div>
                    <Label htmlFor="invite-email">Email</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                      placeholder="user@example.com"
                    />
                  </div>
                )}

                {/* Is Author checkbox - shown for non-author roles */}
                {inviteShowIsAuthorCheckbox && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="invite-is-author"
                      checked={inviteIsAuthor}
                      onCheckedChange={(v) => setInviteIsAuthor(!!v)}
                    />
                    <Label htmlFor="invite-is-author" className="text-sm font-normal cursor-pointer">
                      Is Author, available in blog post author dropdown
                    </Label>
                  </div>
                )}

                {/* Author-specific fields */}
                {inviteShowAuthorFields && (
                  <div className="space-y-4 border-t border-border pt-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Author Details</p>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="invite-guest-author"
                        checked={inviteIsGuestAuthor}
                        onCheckedChange={(v) => setInviteIsGuestAuthor(!!v)}
                      />
                      <Label htmlFor="invite-guest-author" className="text-sm font-normal cursor-pointer">
                        Is Guest Author, displays "Guest Contributor" badge on posts
                      </Label>
                    </div>

                    {/* Avatar / Headshot */}
                    <div>
                      <Label>Author Headshot</Label>
                      <div className="flex items-center gap-3 mt-1">
                        {inviteAvatarUrl ? (
                          <div className="relative">
                            <img src={inviteAvatarUrl} alt="Headshot" className="w-16 h-16 rounded-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setInviteAvatarUrl("")}
                              className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
                            No photo
                          </div>
                        )}
                        <label className="cursor-pointer">
                          <Button type="button" variant="outline" size="sm" asChild>
                            <span>
                              <Upload className="h-3 w-3 mr-1" />
                              {uploadingInviteAvatar ? "Uploading..." : "Upload"}
                            </span>
                          </Button>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleInviteAvatarUpload(file);
                            }}
                          />
                        </label>
                        {inviteAvatarUrl && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openHeadshotEditor(inviteAvatarUrl, "invite")}
                          >
                            <Crop className="h-3 w-3 mr-1" />
                            Adjust
                          </Button>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="invite-bio">Author Bio</Label>
                      <Textarea
                        id="invite-bio"
                        value={inviteAuthorBio}
                        onChange={(e) => setInviteAuthorBio(e.target.value)}
                        placeholder="Brief bio that appears at the bottom of blog posts..."
                        rows={4}
                      />
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={inviting}>
                  {inviting ? "Creating..." : inviteRole === "author" ? "Create Author Profile" : "Create Account"}
                </Button>
                {inviteRole !== "author" && (
                  <p className="text-xs text-muted-foreground text-center">
                    A temporary password will be generated. The user should reset their password on first login.
                  </p>
                )}
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Users Table */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading users...</div>
          ) : profiles.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No users found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id} className={!profile.is_active ? "opacity-50" : ""}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {profile.avatar_url && (
                          <img src={profile.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                        )}
                        <span>
                          {profile.full_name || ", "}
                          {profile.id === user?.id && (
                            <span className="text-xs text-muted-foreground ml-2">(you)</span>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{profile.email || ", "}</TableCell>
                    <TableCell>
                      <Badge className={roleBadgeClass[profile.role] || "bg-muted text-muted-foreground"}>
                        {profile.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {profile.is_author && (
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">Author</Badge>
                          {profile.is_guest_author && (
                            <Badge variant="outline" className="text-xs border-gold text-gold">Guest</Badge>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          profile.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-destructive/15 text-destructive"
                        }
                      >
                        {profile.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="User actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(profile)}>
                            <Pencil className="h-4 w-4 mr-2" /> Edit Profile
                          </DropdownMenuItem>
                          {profile.email && profile.role !== "author" && (
                            <>
                              <DropdownMenuItem onClick={() => openEmailChangeDialog(profile)}>
                                <Mail className="h-4 w-4 mr-2" /> Change Email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleResetPassword(profile.email!)}>
                                <KeyRound className="h-4 w-4 mr-2" /> Reset Password
                              </DropdownMenuItem>
                            </>
                          )}
                          {profile.id !== user?.id && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleToggleActive(profile)}
                                className={!profile.is_active ? "text-green-600" : "text-destructive"}
                              >
                                {profile.is_active ? (
                                  <><UserX className="h-4 w-4 mr-2" /> Deactivate</>
                                ) : (
                                  <><UserCheck className="h-4 w-4 mr-2" /> Reactivate</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setDeletingProfile(profile);
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSave} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <Label>Email</Label>
              {editingProfile?.role === "author" ? (
                <>
                  <Input
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="author@example.com"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Optional for author-only profiles.</p>
                </>
              ) : (
                <>
                  <Input value={editEmail} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground mt-1">Use "Change Email" from the user's action menu to update this.</p>
                </>
              )}
            </div>
            {editingProfile?.id !== user?.id && (
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select value={editRole} onValueChange={(v) => {
                  setEditRole(v);
                  if (v === "author") setEditIsAuthor(true);
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="contributor">Contributor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="author">Author (Profile Only)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">{roleDescriptions[editRole]}</p>
              </div>
            )}
            {editRole === "editor" && (
              <div>
                <Label>Section Access</Label>
                <div className="flex flex-col gap-2 mt-1.5">
                  {ALL_SECTIONS.map((section) => (
                    <div key={section} className="flex items-center gap-2">
                      <Checkbox
                        id={`edit-section-${section}`}
                        checked={editEditorSections.includes(section)}
                        onCheckedChange={(checked) => {
                          setEditEditorSections((prev) =>
                            checked ? [...prev, section] : prev.filter((s) => s !== section)
                          );
                        }}
                      />
                      <Label htmlFor={`edit-section-${section}`} className="text-sm font-normal cursor-pointer">
                        {section}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Select which sections this editor can manage.</p>
              </div>
            )}

            {/* Is Author checkbox - shown for non-author roles */}
            {showIsAuthorCheckbox && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="edit-is-author"
                  checked={editIsAuthor}
                  onCheckedChange={(v) => setEditIsAuthor(!!v)}
                />
                <Label htmlFor="edit-is-author" className="text-sm font-normal cursor-pointer">
                  Is Author, available in blog post author dropdown
                </Label>
              </div>
            )}

            {/* Author-specific fields */}
            {showAuthorFields && (
              <div className="space-y-4 border-t border-border pt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Author Details</p>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="edit-guest-author"
                    checked={editIsGuestAuthor}
                    onCheckedChange={(v) => setEditIsGuestAuthor(!!v)}
                  />
                  <Label htmlFor="edit-guest-author" className="text-sm font-normal cursor-pointer">
                    Is Guest Author, displays "Guest Contributor" badge on posts
                  </Label>
                </div>

                {/* Avatar / Headshot */}
                <div>
                  <Label>Author Headshot</Label>
                  <div className="flex items-center gap-3 mt-1">
                    {editAvatarUrl ? (
                      <div className="relative">
                        <img src={editAvatarUrl} alt="Headshot" className="w-16 h-16 rounded-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setEditAvatarUrl("")}
                          className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
                        No photo
                      </div>
                    )}
                    <label className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="h-3 w-3 mr-1" />
                          {uploadingAvatar ? "Uploading..." : "Upload"}
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAvatarUpload(file);
                        }}
                      />
                    </label>
                    {editAvatarUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openHeadshotEditor(editAvatarUrl, "edit")}
                      >
                        <Crop className="h-3 w-3 mr-1" />
                        Adjust
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-bio">Author Bio</Label>
                  <Textarea
                    id="edit-bio"
                    value={editAuthorBio}
                    onChange={(e) => setEditAuthorBio(e.target.value)}
                    placeholder="Brief bio that appears at the bottom of blog posts..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Email Change Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Email Address</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              {emailChangeProfile?.id === user?.id
                ? "Update your email address. This takes effect immediately."
                : `Update the email for ${emailChangeProfile?.full_name || "this user"}. This takes effect immediately in both the login system and profile.`}
            </p>
            <div>
              <Label>Current Email</Label>
              <Input value={emailChangeProfile?.email || ""} disabled className="bg-muted" />
            </div>
            <div>
              <Label htmlFor="new-email">New Email</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="new@example.com"
              />
            </div>
            <Button
              onClick={handleEmailChange}
              className="w-full"
              disabled={changingEmail || !newEmail || newEmail === emailChangeProfile?.email}
            >
              {changingEmail ? "Updating..." : "Update Email"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{deletingProfile?.full_name || deletingProfile?.email}</strong> and all their data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Headshot Editor */}
      <HeadshotEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        imageUrl={editorImageUrl}
        onSave={handleEditorSave}
      />
    </div>
  );
}
