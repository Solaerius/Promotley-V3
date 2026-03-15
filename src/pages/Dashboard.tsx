import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  TrendingUp, Users, Calendar, Zap, ArrowRight, BarChart3,
  MessageSquare, CheckCircle2, Sparkles, Eye, Heart, ChevronRight, Play,
} from "lucide-react";
import { useConnections } from "@/hooks/useConnections";
import { useTikTokData } from "@/hooks/useTikTokData";
import { useMetaData } from "@/hooks/useMetaData";
import { useUserCredits } from "@/hooks/useUserCredits";
import { useCalendar } from "@/hooks/useCalendar";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import TikTokIcon from "@/components/icons/TikTokIcon";
import { Instagram } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow, format } from "date-fns";
import { sv } from "date-fns/locale";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area,
} from "recharts";

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toString();
};

const getISOWeek = (dateStr: string | null, fallback: number): string => {
  if (!dateStr) return `V${fallback + 1}`;
  const date = new Date(dateStr);
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return `V${Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)}`;
};

const STAT_COLORS = {
  primary: { bg: "bg-primary/15", text: "text-primary", border: "border-primary/50" },
  amber: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/50" },
  teal: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/50" },
  violet: { bg: "bg-violet-500/15", text: "text-violet-400", border: "border-violet-500/50" },
};

const Dashboard = () => {
  const { user } = useAuth();
  const { isConnected, connections } = useConnections();
  const tiktokData = useTikTokData();
  const metaData = useMetaData();
  const { credits } = useUserCredits();
  const { posts } = useCalendar();
  const [recentActivity, setRecentActivity] = useState<{ type: string; icon: React.ElementType; label: string; detail: string; time: string }[]>([]);
  const [activePlatform, setActivePlatform] = useState<string>("overview");
  const [followerHistory, setFollowerHistory] = useState<{ date: string; followers: number }[]>([]);

  const upcomingPosts = posts?.filter((p) => new Date(p.date) >= new Date()).slice(0, 4) || [];

  const totalFollowers =
    (isConnected("meta_ig") && metaData.instagram?.followers_count || 0) +
    (isConnected("tiktok") && tiktokData.user?.follower_count || 0);

  useEffect(() => {
    if (!user?.id) return;
    const fetchActivity = async () => {
      const activities: { type: string; icon: React.ElementType; label: string; detail: string; time: string }[] = [];
      const upcomingFromPosts = posts?.filter((p) => new Date(p.date) >= new Date()).slice(0, 4) || [];
      const { data: aiMessages } = await supabase
        .from("ai_chat_messages").select("created_at, message").eq("role", "user")
        .order("created_at", { ascending: false }).limit(3);
      if (aiMessages) {
        aiMessages.forEach((msg) => {
          activities.push({
            type: "ai", icon: Sparkles, label: "AI-förfrågan",
            detail: msg.message.substring(0, 50) + (msg.message.length > 50 ? "..." : ""),
            time: msg.created_at,
          });
        });
      }
      upcomingFromPosts.forEach((post) => {
        activities.push({ type: "post", icon: Calendar, label: "Planerat inlägg", detail: post.title, time: post.date });
      });
      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setRecentActivity(activities.slice(0, 5));
    };
    fetchActivity();
  }, [user?.id, posts]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchFollowerHistory = async () => {
      const { data } = await supabase
        .from("social_stats")
        .select("followers, updated_at, platform")
        .eq("user_id", user.id)
        .order("updated_at");
      if (data && data.length >= 2) {
        const mapped = data.map((row) => ({
          date: format(new Date(row.updated_at), "d MMM", { locale: sv }),
          followers: row.followers || 0,
        }));
        setFollowerHistory(mapped);
      }
    };
    fetchFollowerHistory();
  }, [user?.id]);

  useEffect(() => {
    if (isConnected("tiktok")) setActivePlatform("tiktok");
    else if (isConnected("meta_ig")) setActivePlatform("meta_ig");
    else setActivePlatform("overview");
  }, [connections, isConnected]);

  const overviewStatCards = [
    { label: "FÖLJARE", value: formatNumber(totalFollowers), icon: Users, sub: "Alla plattformar", color: STAT_COLORS.primary },
    { label: "PLANERADE INLÄGG", value: upcomingPosts.length.toString(), icon: Calendar, sub: "Kommande", color: STAT_COLORS.amber },
    { label: "AI-KREDITER", value: (credits?.credits_left || 0).toString(), icon: Zap, sub: "Kvar", color: STAT_COLORS.teal },
    { label: "ANSLUTNA KONTON", value: connections.length.toString(), icon: CheckCircle2, sub: "Plattformar", color: STAT_COLORS.violet },
  ];

  const tiktokStatCards = [
    { label: "FÖLJARE", value: formatNumber(tiktokData.user?.follower_count || 0), icon: Users, sub: `${formatNumber(tiktokData.user?.following_count || 0)} följer`, color: STAT_COLORS.primary },
    { label: "TOTALA VISNINGAR", value: formatNumber(tiktokData.stats?.totalViews || 0), icon: Eye, sub: `${tiktokData.stats?.videoCount || 0} videor`, color: STAT_COLORS.amber },
    { label: "GILLA-MARKERINGAR", value: formatNumber(tiktokData.stats?.totalLikes || 0), icon: Heart, sub: `${formatNumber(tiktokData.stats?.totalComments || 0)} komm.`, color: STAT_COLORS.teal },
    { label: "ENGAGEMANGSGRAD", value: `${tiktokData.stats?.avgEngagementRate || "0%"}`, icon: TrendingUp, sub: "Genomsnitt", color: STAT_COLORS.violet },
  ];

  const instagramStatCards = [
    { label: "FÖLJARE", value: formatNumber(metaData.instagram?.followers_count || 0), icon: Users, sub: "Instagram", color: STAT_COLORS.primary },
    { label: "FÖLJER", value: formatNumber(metaData.instagram?.follows_count || 0), icon: TrendingUp, sub: "Konton", color: STAT_COLORS.amber },
    { label: "INLÄGG", value: (metaData.instagram?.media_count || 0).toString(), icon: BarChart3, sub: "Totalt", color: STAT_COLORS.teal },
    { label: "AI-KREDITER", value: (credits?.credits_left || 0).toString(), icon: Zap, sub: "Kvar", color: STAT_COLORS.violet },
  ];

  const activeStatCards =
    activePlatform === "tiktok" ? tiktokStatCards
    : activePlatform === "meta_ig" ? instagramStatCards
    : overviewStatCards;

  const videoChartData = (tiktokData.videos || []).slice(0, 7).map((v, i) => ({
    name: getISOWeek(v.created_at, i),
    Visningar: v.views,
    Likes: v.likes,
    fullTitle: v.title,
  }));

  const platformTabs = [
    { key: "overview", label: "Översikt", icon: null },
    ...(isConnected("tiktok") ? [{ key: "tiktok", label: "TikTok", icon: TikTokIcon }] : []),
    ...(isConnected("meta_ig") ? [{ key: "meta_ig", label: "Instagram", icon: Instagram }] : []),
  ];

  const firstName = user?.email?.split("@")[0] || "du";
  const showTikTokContent = (activePlatform === "tiktok" || activePlatform === "overview") && isConnected("tiktok");
  const anyConnected = isConnected("tiktok") || isConnected("meta_ig");
  const activePlatformLabel = platformTabs.find((tab) => tab.key === activePlatform)?.label || "Översikt";
  const primaryStatCard = activeStatCards[0];
  const secondaryStatCards = activeStatCards.slice(1);
  const PrimaryStatIcon = primaryStatCard.icon;
  const nextPost = upcomingPosts[0];
  const focusAction = !anyConnected
    ? {
        title: "Anslut ditt första konto",
        description: "Koppla TikTok eller Instagram för att fylla hemskärmen med live-data.",
        href: "/account?tab=app",
        cta: "Anslut konto",
        icon: CheckCircle2,
      }
    : upcomingPosts.length === 0
      ? {
          title: "Bygg veckans publiceringar",
          description: "Kalendern är tom. Lägg in nästa kampanj medan signalerna är färska.",
          href: "/calendar",
          cta: "Öppna kalender",
          icon: Calendar,
        }
      : {
          title: nextPost?.title || "Se nästa publicering",
          description: "Du har redan fart i planeringen. Håll rytmen uppe och jobba vidare från kalendern.",
          href: "/calendar",
          cta: "Visa plan",
          icon: Sparkles,
        };
  const heroSignals = [
    {
      label: "Kanaler",
      value: anyConnected ? `${connections.length} live` : "Startläge",
      detail: anyConnected ? "Konton är anslutna och synkar data." : "Börja med att koppla dina plattformar.",
      icon: CheckCircle2,
      color: STAT_COLORS.violet,
    },
    {
      label: "Näst på tur",
      value: nextPost ? format(new Date(nextPost.date), "d MMM", { locale: sv }) : "Ingen plan",
      detail: nextPost ? nextPost.title : "Lägg in veckans nästa publicering.",
      icon: Calendar,
      color: STAT_COLORS.amber,
    },
    {
      label: "Aktivitet",
      value: `${recentActivity.length}`,
      detail: recentActivity.length ? "Nya signaler redo att följa upp." : "Feeden fylls när du använder verktygen.",
      icon: Sparkles,
      color: STAT_COLORS.primary,
    },
  ];
  const workspaceLinks = [
    {
      title: "Djupdyk i statistik",
      desc: "Öppna analysvyn och jämför räckvidd, följare och engagemang.",
      href: "/analytics",
      icon: BarChart3,
      color: STAT_COLORS.primary,
    },
    {
      title: "Prata med AI",
      desc: "Samla idéer, captions och nästa kampanjsteg direkt från dagens läge.",
      href: "/ai/chat",
      icon: Sparkles,
      color: STAT_COLORS.teal,
    },
    {
      title: "Planera kalendern",
      desc: nextPost ? `${upcomingPosts.length} inlägg ligger redan klara i planen.` : "Bygg en tydlig rytm för veckan i kalendern.",
      href: "/calendar",
      icon: Calendar,
      color: STAT_COLORS.amber,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">

        <section className="relative overflow-hidden rounded-[28px] border border-border/40 bg-card/90 shadow-sm">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-amber-500/10" />
          <div className="pointer-events-none absolute -top-16 right-8 h-44 w-44 rounded-full bg-primary/12 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-10 h-36 w-36 rounded-full bg-amber-500/10 blur-3xl" />

          <div className="relative grid gap-4 p-5 lg:grid-cols-[1.35fr_0.95fr] lg:p-6">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-border/50 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
                  Dagens brief
                </span>
                <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {activePlatformLabel}
                </span>
              </div>

              <div className="space-y-3">
                <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                  Välkommen tillbaka, {firstName}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                  {anyConnected
                    ? "Din hemvy är nu byggd som ett arbetsbord: signaler, planering och verktyg ligger i samma flöde."
                    : "Koppla dina kanaler för att fylla hemvyn med live-data, aktivitet och smartare förslag."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {platformTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activePlatform === tab.key;

                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActivePlatform(tab.key)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                        isActive
                          ? "border-primary/30 bg-primary/15 text-primary shadow-sm"
                          : "border-border/40 bg-background/70 text-muted-foreground hover:border-border/60 hover:bg-muted/70"
                      }`}
                    >
                      {Icon && <Icon className="w-3.5 h-3.5" />}
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {heroSignals.map((signal) => {
                  const Icon = signal.icon;

                  return (
                    <div key={signal.label} className="rounded-[22px] border border-border/30 bg-background/70 p-4 backdrop-blur-sm">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
                          {signal.label}
                        </p>
                        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${signal.color.bg}`}>
                          <Icon className={`h-4 w-4 ${signal.color.text}`} />
                        </div>
                      </div>
                      <p className="text-lg font-semibold tracking-tight text-foreground">{signal.value}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{signal.detail}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[24px] border border-border/30 bg-background/70 p-5 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
                  Fokus just nu
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                  {focusAction.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{focusAction.description}</p>
                <Button className="mt-5 w-full justify-between" asChild>
                  <Link to={focusAction.href}>
                    {focusAction.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {workspaceLinks.map((link) => {
                  const Icon = link.icon;

                  return (
                    <Link
                      key={link.title}
                      to={link.href}
                      className="group rounded-[22px] border border-border/30 bg-background/70 p-4 transition-all hover:border-border/50 hover:bg-card"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${link.color.bg}`}>
                          <Icon className={`h-4 w-4 ${link.color.text}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-foreground">{link.title}</p>
                            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                          </div>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">{link.desc}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.95fr]">
          <div className="rounded-[28px] border border-border/40 bg-card/90 p-5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
              Huvudsignal
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <h2 className="text-5xl font-semibold tracking-tight text-foreground md:text-6xl">
                {primaryStatCard.value}
              </h2>
              <span className={`mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${primaryStatCard.color.bg} ${primaryStatCard.color.text} ${primaryStatCard.color.border}`}>
                <PrimaryStatIcon className="h-3.5 w-3.5" />
                {primaryStatCard.label}
              </span>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              {anyConnected
                    ? "Den stora signalen får vara ditt avstamp. Resten av hemvyn hjälper dig att gå vidare till nästa steg."
                    : "När dina konton är anslutna förvandlas den här ytan till ditt live-läge för marknadsföringen."}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {secondaryStatCards.map((stat) => {
              const Icon = stat.icon;

              return (
                <div key={stat.label} className="rounded-[24px] border border-border/40 bg-card/90 p-4 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
                      {stat.label}
                    </p>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-2xl ${stat.color.bg}`}>
                      <Icon className={`h-4 w-4 ${stat.color.text}`} />
                    </div>
                  </div>
                  <p className="text-3xl font-semibold tracking-tight text-foreground">{stat.value}</p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{stat.sub}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Main content: left + right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left column (2/3) */}
          <div className="lg:col-span-2 space-y-5">

            {/* Follower Growth Area Chart */}
            {anyConnected && followerHistory.length >= 2 && (
              <div className="rounded-2xl bg-card border border-border/40 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Följartillväxt</h2>
                  <Link to="/analytics" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                    Se alla <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={followerHistory}>
                      <defs>
                        <linearGradient id="followerGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.4} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tickFormatter={(v) => formatNumber(v)}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                        width={38}
                      />
                      <Tooltip
                        cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "3 3" }}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="rounded-lg bg-popover border border-border p-2.5 shadow-md text-xs">
                              <p className="text-muted-foreground mb-0.5">{payload[0]?.payload?.date}</p>
                              <p className="font-semibold text-foreground">{formatNumber(payload[0]?.value as number)} följare</p>
                            </div>
                          );
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="followers"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#followerGradient)"
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Video performance chart */}
            {showTikTokContent && videoChartData.length > 0 && (
              <div className="rounded-2xl bg-card border border-border/40 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Videoprestation</h2>
                  <Link to="/analytics" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                    Se alla <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={videoChartData} barGap={3} barSize={16}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        </linearGradient>
                        <linearGradient id="barGradientAmber" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(38 80% 50%)" stopOpacity={1} />
                          <stop offset="100%" stopColor="hsl(38 80% 50%)" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.4} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tickFormatter={(v) => formatNumber(v)}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                        width={38}
                      />
                      <Tooltip
                        cursor={{ fill: "hsl(var(--muted))", radius: 4 }}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="rounded-lg bg-popover border border-border p-2.5 shadow-md text-xs">
                              <p className="font-medium text-foreground mb-1.5 max-w-[180px] truncate">
                                {payload[0]?.payload?.fullTitle || "Video"}
                              </p>
                              {payload.map((p) => (
                                <p key={p.name} className="text-muted-foreground">
                                  {p.name}: <span className="text-foreground font-semibold">{formatNumber(p.value as number)}</span>
                                </p>
                              ))}
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="Visningar" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Likes" fill="url(#barGradientAmber)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 bg-primary/10 rounded-full px-2.5 py-1">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-[11px] font-medium text-primary">Visningar</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-amber-500/10 rounded-full px-2.5 py-1">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-[11px] font-medium text-amber-400">Likes</span>
                  </div>
                </div>
              </div>
            )}

            {/* Top videos table */}
            {showTikTokContent && tiktokData.videos?.length > 0 && (
              <div className="rounded-2xl bg-card border border-border/40 shadow-sm overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-border/40">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Senaste videor</h2>
                  <Link to="/analytics" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                    Se alla <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="divide-y divide-border/40">
                  {tiktokData.videos.slice(0, 5).map((video, i) => (
                    <div key={video.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/20 transition-colors group">
                      {/* Rank badge */}
                      <div className="w-5 shrink-0 text-center">
                        <span className={`text-xs font-bold ${i === 0 ? "text-amber-400" : i === 1 ? "text-slate-400" : i === 2 ? "text-orange-600" : "text-muted-foreground/40"}`}>
                          {i + 1}
                        </span>
                      </div>
                      {/* Thumbnail placeholder */}
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-border/40 flex items-center justify-center shrink-0">
                        <Play className="w-3.5 h-3.5 text-primary/60" />
                      </div>
                      <p className="text-sm text-foreground flex-1 truncate min-w-0">
                        {video.title || `Video ${i + 1}`}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />{formatNumber(video.views)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />{formatNumber(video.likes)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />{formatNumber(video.comments)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Not connected states */}
            {activePlatform === "tiktok" && !isConnected("tiktok") && (
              <div className="rounded-2xl bg-card border border-border/40 p-8 text-center">
                <p className="text-sm text-muted-foreground">Anslut ditt TikTok-konto för att se data här.</p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link to="/account?tab=app">Anslut konto</Link>
                </Button>
              </div>
            )}
            {activePlatform === "meta_ig" && !isConnected("meta_ig") && (
              <div className="rounded-2xl bg-card border border-border/40 p-8 text-center">
                <p className="text-sm text-muted-foreground">Anslut ditt Instagram-konto för att se data här.</p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link to="/account?tab=app">Anslut konto</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Right column (1/3) */}
          <div className="space-y-5">

            {/* Activity Feed */}
            <div className="rounded-2xl bg-card border border-border/40 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Senaste aktivitet</h2>
              </div>
              {recentActivity.length === 0 ? (
                <p className="text-xs text-muted-foreground py-3 text-center">Ingen aktivitet ännu.</p>
              ) : (
                <div className="space-y-2">
                  {recentActivity.map((activity, i) => {
                    const Icon = activity.icon;
                    const initials = activity.label.slice(0, 2).toUpperCase();
                    return (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 p-2.5 rounded-xl border border-border/30 hover:bg-muted/20 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-primary/15 shrink-0 mt-0.5">
                          <Icon className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground leading-none mb-0.5">{activity.label}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{activity.detail}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground/50 shrink-0 mt-0.5">
                          {formatDistanceToNow(new Date(activity.time), { addSuffix: false, locale: sv })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Upcoming Posts */}
            <div className="rounded-2xl bg-card border border-border/40 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Kommande inlägg</h2>
                <Link to="/calendar" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                  Se alla <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              {upcomingPosts.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-xs text-muted-foreground">Inga inlägg planerade.</p>
                  <Button variant="ghost" size="sm" className="mt-2 text-xs" asChild>
                    <Link to="/calendar">Planera ett inlägg</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingPosts.map((post, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-border/30 hover:bg-muted/20 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary leading-none">
                          {format(new Date(post.date), "d", { locale: sv })}
                        </span>
                        <span className="text-[9px] text-primary/70 leading-none uppercase mt-0.5">
                          {format(new Date(post.date), "MMM", { locale: sv })}
                        </span>
                      </div>
                      <p className="text-xs text-foreground truncate flex-1 font-medium">{post.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upgrade Banner */}
            {credits && (credits.plan === "free_trial" || credits.plan === "starter") && (
              <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4">
                <p className="text-sm font-semibold text-foreground">Uppgradera din plan</p>
                <p className="text-xs text-muted-foreground mt-0.5 mb-3">Fler krediter och avancerad analys</p>
                <Button size="sm" className="w-full" asChild>
                  <Link to="/pricing">Se planer <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

