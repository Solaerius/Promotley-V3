import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  Heart,
  MessageCircle,
  Instagram,
  Music2,
  Facebook,
  Sparkles,
} from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useMetaData } from "@/hooks/useMetaData";
import { useTikTokData } from "@/hooks/useTikTokData";
import { useConnections } from "@/hooks/useConnections";

// Mock data för grafer
const viewsData = [
  { name: "Mån", instagram: 2400, tiktok: 4000, facebook: 1200 },
  { name: "Tis", instagram: 3000, tiktok: 3800, facebook: 1400 },
  { name: "Ons", instagram: 2800, tiktok: 5200, facebook: 1600 },
  { name: "Tor", instagram: 3500, tiktok: 4500, facebook: 1800 },
  { name: "Fre", instagram: 4200, tiktok: 6000, facebook: 2200 },
  { name: "Lör", instagram: 5000, tiktok: 7500, facebook: 2800 },
  { name: "Sön", instagram: 4500, tiktok: 6800, facebook: 2400 },
];

const engagementData = [
  { name: "v1", engagement: 65 },
  { name: "v2", engagement: 72 },
  { name: "v3", engagement: 68 },
  { name: "v4", engagement: 78 },
  { name: "v5", engagement: 85 },
  { name: "v6", engagement: 82 },
];

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const { isConnected } = useConnections();
  const metaData = useMetaData();
  const tiktokData = useTikTokData();

  // Beräkna totaler baserat på riktiga data
  const totalFollowers = 
    (metaData.instagram?.followers_count || 0) +
    (tiktokData.user?.follower_count || 0) +
    (metaData.facebook?.followers_count || 0);

  const totalViews = tiktokData.stats?.totalViews || 15420;
  const totalLikes = tiktokData.stats?.totalLikes || 8240;
  const avgEngagement = tiktokData.stats?.avgEngagementRate || "4.2";

  const stats = [
    {
      title: "Totala följare",
      value: totalFollowers.toLocaleString(),
      change: "+12.5%",
      trending: "up" as const,
      icon: Users,
    },
    {
      title: "Visningar (7d)",
      value: totalViews.toLocaleString(),
      change: "+8.3%",
      trending: "up" as const,
      icon: Eye,
    },
    {
      title: "Engagemang",
      value: `${avgEngagement}%`,
      change: "+2.1%",
      trending: "up" as const,
      icon: Heart,
    },
    {
      title: "Kommentarer",
      value: "1,234",
      change: "-3.2%",
      trending: "down" as const,
      icon: MessageCircle,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Statistik</h1>
            <p className="text-muted-foreground">
              Översikt av dina sociala medier-prestationer
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedPeriod === "7d" ? "default" : "outline"}
              onClick={() => setSelectedPeriod("7d")}
            >
              7 dagar
            </Button>
            <Button
              variant={selectedPeriod === "30d" ? "default" : "outline"}
              onClick={() => setSelectedPeriod("30d")}
            >
              30 dagar
            </Button>
            <Button
              variant={selectedPeriod === "90d" ? "default" : "outline"}
              onClick={() => setSelectedPeriod("90d")}
            >
              90 dagar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div
                      className={`flex items-center gap-1 text-sm font-medium ${
                        stat.trending === "up" ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {stat.trending === "up" ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span>{stat.change}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* AI Analysis Section */}
        <Card className="bg-gradient-hero border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI-analys
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Få personliga insikter och rekommendationer baserat på din data med AI-assistenten.
            </p>
            <Button variant="gradient" size="lg">
              Generera analys med AI
            </Button>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Views Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Visningar per dag</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={viewsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="instagram"
                    stroke="#E1306C"
                    strokeWidth={2}
                    name="Instagram"
                  />
                  <Line
                    type="monotone"
                    dataKey="tiktok"
                    stroke="#00F2EA"
                    strokeWidth={2}
                    name="TikTok"
                  />
                  <Line
                    type="monotone"
                    dataKey="facebook"
                    stroke="#1877F2"
                    strokeWidth={2}
                    name="Facebook"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Engagement Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Engagemangsgrad per vecka</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="engagement" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Platform Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Plattformsoversikt</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="instagram" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="instagram" disabled={!isConnected('meta_ig')}>
                  <Instagram className="w-4 h-4 mr-2" />
                  Instagram
                </TabsTrigger>
                <TabsTrigger value="tiktok" disabled={!isConnected('tiktok')}>
                  <Music2 className="w-4 h-4 mr-2" />
                  TikTok
                </TabsTrigger>
                <TabsTrigger value="facebook" disabled={!isConnected('meta_fb')}>
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </TabsTrigger>
              </TabsList>
              <TabsContent value="instagram" className="space-y-4 pt-4">
                {isConnected('meta_ig') && metaData.instagram ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-muted">
                      <p className="text-sm text-muted-foreground mb-1">Följare</p>
                      <p className="text-2xl font-bold">{metaData.instagram.followers_count?.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted">
                      <p className="text-sm text-muted-foreground mb-1">Följer</p>
                      <p className="text-2xl font-bold">{metaData.instagram.follows_count?.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted">
                      <p className="text-sm text-muted-foreground mb-1">Inlägg</p>
                      <p className="text-2xl font-bold">{metaData.instagram.media_count?.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted">
                      <p className="text-sm text-muted-foreground mb-1">Namn</p>
                      <p className="text-xl font-bold">{metaData.instagram.name}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Anslut Instagram för att se statistik</p>
                )}
              </TabsContent>
              <TabsContent value="tiktok" className="space-y-4 pt-4">
                {isConnected('tiktok') && tiktokData.user ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-muted">
                      <p className="text-sm text-muted-foreground mb-1">Följare</p>
                      <p className="text-2xl font-bold">{tiktokData.user.follower_count?.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted">
                      <p className="text-sm text-muted-foreground mb-1">Visningar</p>
                      <p className="text-2xl font-bold">{tiktokData.stats?.totalViews.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted">
                      <p className="text-sm text-muted-foreground mb-1">Likes</p>
                      <p className="text-2xl font-bold">{tiktokData.stats?.totalLikes.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted">
                      <p className="text-sm text-muted-foreground mb-1">Engagemang</p>
                      <p className="text-2xl font-bold">{tiktokData.stats?.avgEngagementRate}%</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Anslut TikTok för att se statistik</p>
                )}
              </TabsContent>
              <TabsContent value="facebook" className="space-y-4 pt-4">
                {isConnected('meta_fb') && metaData.facebook ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-muted">
                      <p className="text-sm text-muted-foreground mb-1">Följare</p>
                      <p className="text-2xl font-bold">{metaData.facebook.followers_count?.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted">
                      <p className="text-sm text-muted-foreground mb-1">Sidnamn</p>
                      <p className="text-xl font-bold">{metaData.facebook.name}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Anslut Facebook för att se statistik</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
