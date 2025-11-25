import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Plus, Sparkles, Instagram, Music2, Facebook, Trash2, Edit } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

interface CalendarPost {
  id: string;
  date: string;
  platform: "instagram" | "tiktok" | "facebook";
  title: string;
  description: string;
  type: string;
}

const Calendar = () => {
  const { toast } = useToast();
  const [view, setView] = useState<"month" | "week">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<CalendarPost[]>([
    {
      id: "1",
      date: "2025-01-15",
      platform: "instagram",
      title: "Produktlansering",
      description: "Visa nya produkter",
      type: "Bild",
    },
    {
      id: "2",
      date: "2025-01-18",
      platform: "tiktok",
      title: "Behind the scenes",
      description: "Visa teamet",
      type: "Video",
    },
    {
      id: "3",
      date: "2025-01-22",
      platform: "facebook",
      title: "Kundcase",
      description: "Dela framgångshistoria",
      type: "Artikel",
    },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<CalendarPost | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    platform: "",
    title: "",
    description: "",
    type: "",
  });

  const platformColors = {
    instagram: "bg-pink-500",
    tiktok: "bg-cyan-500",
    facebook: "bg-blue-600",
  };

  const platformIcons = {
    instagram: Instagram,
    tiktok: Music2,
    facebook: Facebook,
  };

  // Generera kalenderdagar
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Lägg till tomma platser för dagar före månadens start
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Lägg till alla dagar i månaden
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const handleSavePost = () => {
    if (!formData.date || !formData.platform || !formData.title) {
      toast({
        title: "Felaktiga uppgifter",
        description: "Fyll i alla obligatoriska fält",
        variant: "destructive",
      });
      return;
    }

    if (editingPost) {
      setPosts(posts.map(p => p.id === editingPost.id ? { ...formData, id: p.id } as CalendarPost : p));
      toast({
        title: "Uppdaterat",
        description: "Inlägget har uppdaterats",
      });
    } else {
      const newPost: CalendarPost = {
        id: Date.now().toString(),
        ...formData,
      } as CalendarPost;
      setPosts([...posts, newPost]);
      toast({
        title: "Skapat",
        description: "Nytt inlägg har lagts till i kalendern",
      });
    }

    setIsDialogOpen(false);
    setEditingPost(null);
    setFormData({ date: "", platform: "", title: "", description: "", type: "" });
  };

  const handleDeletePost = (id: string) => {
    setPosts(posts.filter(p => p.id !== id));
    toast({
      title: "Raderat",
      description: "Inlägget har tagits bort",
    });
  };

  const handleEditPost = (post: CalendarPost) => {
    setEditingPost(post);
    setFormData(post);
    setIsDialogOpen(true);
  };

  const getPostsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return posts.filter(p => p.date === dateStr);
  };

  const monthNames = [
    "Januari", "Februari", "Mars", "April", "Maj", "Juni",
    "Juli", "Augusti", "September", "Oktober", "November", "December"
  ];

  const weekDays = ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Innehållskalender</h1>
            <p className="text-muted-foreground">
              Planera dina inlägg och håll koll på din content-strategi
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="gradient" onClick={() => toast({ title: "AI-funktion", description: "AI-generering kommer snart!" })}>
              <Sparkles className="w-4 h-4 mr-2" />
              Skapa plan med AI
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingPost(null); setFormData({ date: "", platform: "", title: "", description: "", type: "" }); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Lägg till
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingPost ? "Redigera inlägg" : "Nytt inlägg"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="date">Datum</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="platform">Plattform</Label>
                    <Select value={formData.platform} onValueChange={(value) => setFormData({ ...formData, platform: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Välj plattform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="type">Typ av innehåll</Label>
                    <Input
                      id="type"
                      placeholder="T.ex. Bild, Video, Story"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="title">Titel</Label>
                    <Input
                      id="title"
                      placeholder="Inläggstitel"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Beskrivning</Label>
                    <Textarea
                      id="description"
                      placeholder="Beskriv innehållet"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleSavePost} className="w-full">
                    {editingPost ? "Uppdatera" : "Skapa"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Calendar Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                >
                  Föregående
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Idag
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                >
                  Nästa
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Week days header */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center font-semibold text-sm text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {getDaysInMonth().map((day, index) => {
                const dayPosts = day ? getPostsForDate(day) : [];
                const isToday = day === new Date().getDate() && 
                               currentDate.getMonth() === new Date().getMonth() &&
                               currentDate.getFullYear() === new Date().getFullYear();

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] p-2 rounded-lg border transition-colors ${
                      day
                        ? isToday
                          ? "bg-primary/10 border-primary"
                          : "bg-card hover:bg-muted border-border"
                        : "bg-transparent border-transparent"
                    }`}
                  >
                    {day && (
                      <>
                        <div className="text-sm font-semibold mb-2">{day}</div>
                        <div className="space-y-1">
                          {dayPosts.map((post) => {
                            const Icon = platformIcons[post.platform];
                            return (
                              <div
                                key={post.id}
                                className={`${platformColors[post.platform]} text-white text-xs p-2 rounded cursor-pointer hover:opacity-90 transition-opacity group relative`}
                                onClick={() => handleEditPost(post)}
                              >
                                <div className="flex items-center gap-1">
                                  <Icon className="w-3 h-3" />
                                  <span className="truncate flex-1">{post.title}</span>
                                </div>
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 text-white hover:text-red-200"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeletePost(post.id);
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming posts */}
        <Card>
          <CardHeader>
            <CardTitle>Kommande inlägg</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {posts
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map((post) => {
                  const Icon = platformIcons[post.platform];
                  return (
                    <div
                      key={post.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg ${platformColors[post.platform]} flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">{post.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(post.date).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })} • {post.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditPost(post)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeletePost(post.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              {posts.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Inga planerade inlägg ännu. Lägg till ditt första!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;
