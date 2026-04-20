/**
 * FeedsPage — Admin Feed & Moderation Dashboard
 *
 * TODO: Replace mock data with real API calls to /api/v1/feeds
 * Features: Post creation, feed timeline, moderation controls,
 * volunteer activity monitoring
 */

import { useState } from "react";
import { mockFeedPosts, mockActivities, type FeedPost } from "@/dummy-data/feedsMockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Newspaper, Send, Trash2, EyeOff, Eye, Flag, Heart,
  MessageCircle, Clock, Activity, AlertTriangle, ImagePlus,
  MoreVertical, Shield, Search
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const roleColors: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  PUSDALOPS: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  TRC: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  PIMPINAN: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export default function FeedsPage() {
  const [posts, setPosts] = useState<FeedPost[]>(mockFeedPosts);
  const [newPost, setNewPost] = useState("");
  const [search, setSearch] = useState("");
  const [showHidden, setShowHidden] = useState(false);
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    // TODO: POST /api/v1/feeds
    await new Promise(r => setTimeout(r, 500)); // simulate
    const post: FeedPost = {
      id: Date.now(),
      author: { name: "Admin BPBD", role: "ADMIN", avatar: "A" },
      content: newPost.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      isHidden: false,
      isFlagged: false,
    };
    setPosts([post, ...posts]);
    setNewPost("");
    setPosting(false);
    toast.success("Postingan berhasil dipublikasikan");
  };

  const toggleHide = (id: number) => {
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, isHidden: !p.isHidden } : p
    ));
    toast.success("Status visibilitas diperbarui");
  };

  const deletePost = (id: number) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    toast.success("Postingan berhasil dihapus");
  };

  const filtered = posts.filter(p => {
    if (!showHidden && p.isHidden) return false;
    if (search) return p.content.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <Newspaper className="h-7 w-7 text-primary" />
          Feed & Moderasi
        </h1>
        <p className="page-subtitle">Kelola konten dan pantau aktivitas relawan</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main Feed Column ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Post Composer */}
          <div className="stat-card p-5 space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-sm font-bold">
                A
              </div>
              <div>
                <p className="text-sm font-medium">Posting sebagai Admin BPBD</p>
                <p className="text-xs text-muted-foreground">Akun resmi organisasi</p>
              </div>
            </div>
            <Textarea
              placeholder="Tulis pengumuman, update situasi, atau instruksi untuk tim..."
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" className="text-muted-foreground gap-2">
                <ImagePlus className="h-4 w-4" /> Lampirkan Foto
              </Button>
              <Button
                onClick={handlePost}
                disabled={posting || !newPost.trim()}
                className="gap-2"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Send className="h-4 w-4" />
                {posting ? "Memposting..." : "Publikasikan"}
              </Button>
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari postingan..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant={showHidden ? "default" : "outline"}
              size="sm"
              onClick={() => setShowHidden(!showHidden)}
              className="gap-1.5 shrink-0"
            >
              {showHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {showHidden ? "Sembunyikan" : "Tampilkan"} yang disembunyikan
            </Button>
          </div>

          {/* Feed Posts */}
          <div className="space-y-4 stagger-children">
            {filtered.length === 0 ? (
              <div className="stat-card p-12 text-center text-muted-foreground">
                <Newspaper className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Belum ada postingan</p>
              </div>
            ) : (
              filtered.map(post => (
                <div
                  key={post.id}
                  className={`stat-card p-5 ${post.isHidden ? "opacity-50 border-dashed" : ""}`}
                >
                  {/* Post header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        post.author.role === "ADMIN"
                          ? "bg-gradient-to-br from-red-500 to-red-600 text-white"
                          : "bg-gradient-to-br from-green-500 to-green-600 text-white"
                      }`}>
                        {post.author.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold">{post.author.name}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${roleColors[post.author.role] || "bg-gray-100 text-gray-600"}`}>
                            {post.author.role}
                          </span>
                          {post.isHidden && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 font-medium">
                              TERSEMBUNYI
                            </span>
                          )}
                          {post.isFlagged && (
                            <Flag className="h-3.5 w-3.5 text-destructive" />
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />{formatDate(post.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Moderation menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toggleHide(post.id)}>
                          {post.isHidden ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                          {post.isHidden ? "Tampilkan" : "Sembunyikan"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deletePost(post.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Hapus Permanen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Post content */}
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap mb-3">
                    {post.content}
                  </p>

                  {/* Post stats */}
                  <div className="flex items-center gap-4 pt-3 border-t text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Heart className="h-3.5 w-3.5" /> {post.likes}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="h-3.5 w-3.5" /> {post.comments}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Activity Sidebar ── */}
        <div className="space-y-4">
          <div className="stat-card p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Aktivitas Relawan
            </h3>
            <div className="space-y-4">
              {mockActivities.map(act => (
                <div key={act.id} className="flex gap-3 text-sm">
                  <div className="mt-0.5">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      act.role === "TRC"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}>
                      {act.userName.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground">
                      <span className="font-medium">{act.userName}</span>
                      <span className="text-muted-foreground"> {act.action.toLowerCase()} </span>
                      <span className="font-medium">{act.target}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />{formatDate(act.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Moderation Stats */}
          <div className="stat-card p-5">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Statistik Moderasi
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Postingan</span>
                <span className="font-semibold">{posts.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tersembunyi</span>
                <span className="font-semibold text-amber-600">{posts.filter(p => p.isHidden).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ditandai</span>
                <span className="font-semibold text-destructive">{posts.filter(p => p.isFlagged).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
