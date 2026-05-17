import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, ArrowLeft, UserCircle, Upload, Crop } from "lucide-react";
import { Link } from "react-router-dom";
import HeadshotEditor from "@/components/pps/admin/HeadshotEditor";

interface Profile {
  is_author: boolean;
  author_bio: string | null;
  avatar_url: string | null;
  full_name: string | null;
}

export default function AccountSettings() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // Email change state
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Author profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bioSaving, setBioSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Headshot editor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorImageUrl, setEditorImageUrl] = useState("");

  // Fetch profile
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("is_author, author_bio, avatar_url, full_name")
        .eq("id", user.id)
        .single();
      if (data) {
        setProfile(data);
        setBio(data.author_bio || "");
        setAvatarUrl(data.avatar_url || "");
      }
      setProfileLoading(false);
    })();
  }, [user]);

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newEmail.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    setEmailLoading(true);
    try {
      const { error } = await supabase.functions.invoke("update-user-email", {
        body: { userId: user.id, newEmail: newEmail.trim() },
      });
      if (error) throw error;
      toast({ title: "Email updated", description: `Your email has been changed to ${newEmail.trim()}.` });
      setNewEmail("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update email.", variant: "destructive" });
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword.length < 6) {
      toast({ title: "Too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Mismatch", description: "New passwords do not match.", variant: "destructive" });
      return;
    }

    setPasswordLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      });
      if (signInError) {
        toast({ title: "Incorrect password", description: "Your current password is incorrect.", variant: "destructive" });
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast({ title: "Password updated", description: "Your password has been changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update password.", variant: "destructive" });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const path = `avatars/${user.id}-${Date.now()}.jpg`;
      const { error } = await supabase.storage.from("blog-images").upload(path, file, {
        contentType: file.type,
        upsert: true,
      });
      if (error) throw error;

      const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
      setAvatarUrl(data.publicUrl);

      await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", user.id);
      toast({ title: "Headshot uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleEditorSave = async (blob: Blob) => {
    if (!user) return;
    try {
      const path = `avatars/${user.id}-${Date.now()}.jpg`;
      const { error } = await supabase.storage.from("blog-images").upload(path, blob, {
        contentType: "image/jpeg",
      });
      if (error) throw error;

      const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
      setAvatarUrl(data.publicUrl);

      await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", user.id);
      toast({ title: "Headshot updated" });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setEditorOpen(false);
    }
  };

  const handleBioSave = async () => {
    if (!user) return;
    setBioSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ author_bio: bio })
        .eq("id", user.id);
      if (error) throw error;
      toast({ title: "Bio updated", description: "Your author bio has been saved." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setBioSaving(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Please sign in to access account settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-foreground">Account Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your email, password{profile?.is_author ? ", and author profile" : ""}</p>
        </div>
      </div>

      {/* Email Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5" /> Change Email
          </CardTitle>
          <CardDescription>
            Current email: <span className="font-medium text-foreground">{user.email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailChange} className="space-y-4">
            <div>
              <Label htmlFor="newEmail">New Email Address</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email address"
                required
              />
            </div>
            <Button type="submit" disabled={emailLoading || !newEmail.trim()}>
              {emailLoading ? "Updating..." : "Update Email"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-5 w-5" /> Change Password
          </CardTitle>
          <CardDescription>Use a strong password with at least 6 characters.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}>
              {passwordLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Author Profile — only shown if is_author */}
      {profile?.is_author && (
        <>
          <Separator />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserCircle className="h-5 w-5" /> Author Profile
              </CardTitle>
              <CardDescription>
                Update your author headshot and bio as they appear on blog posts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Headshot */}
              <div className="space-y-3">
                <Label>Headshot</Label>
                <div className="flex items-center gap-4">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={profile.full_name || "Author headshot"}
                      className="w-20 h-20 rounded-full object-cover border-2 border-border"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
                      <UserCircle className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild disabled={uploading}>
                        <label className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-1" />
                          {uploading ? "Uploading..." : "Upload"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarUpload}
                          />
                        </label>
                      </Button>
                      {avatarUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditorImageUrl(avatarUrl);
                            setEditorOpen(true);
                          }}
                        >
                          <Crop className="h-4 w-4 mr-1" />
                          Adjust
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Square images work best. Use Adjust to crop and reposition.</p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="authorBio">Author Bio</Label>
                <Textarea
                  id="authorBio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write a short bio about yourself..."
                  rows={4}
                  className="resize-y"
                />
                <p className="text-xs text-muted-foreground">
                  {bio.length} characters
                </p>
              </div>

              <Button onClick={handleBioSave} disabled={bioSaving}>
                {bioSaving ? "Saving..." : "Save Author Profile"}
              </Button>
            </CardContent>
          </Card>

          <HeadshotEditor
            open={editorOpen}
            onOpenChange={setEditorOpen}
            imageUrl={editorImageUrl}
            onSave={handleEditorSave}
          />
        </>
      )}
    </div>
  );
}
