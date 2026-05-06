import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";

function RedirectBlogToInsights() {
  const { slug } = useParams();
  return <Navigate to={`/resources/insights/${slug ?? ""}`} replace />;
}
import { useEffect } from "react";
import { getSiteUrl } from "@/lib/site-url";
import NotFound from "./pages/NotFound";

// Painted Porch Strategies Pages
import PPSLayout from "./layouts/PPSLayout";
import PPSHome from "./pages/pps/PPSHome";
import PPSAbout from "./pages/pps/PPSAbout";
import PPSForLeaders from "./pages/pps/PPSForLeaders";
import PPSForTeams from "./pages/pps/PPSForTeams";
import PPSPrograms from "./pages/pps/PPSPrograms";
import PPSBusinessPrograms from "./pages/pps/PPSBusinessPrograms";
import PPSServices from "./pages/pps/PPSServices";
import PPSPricing from "./pages/pps/PPSPricing";
import PPSBlog from "./pages/pps/PPSBlog";
import PPSBlogPost from "./pages/pps/PPSBlogPost";
import PPSContact from "./pages/pps/PPSContact";

// New About Section
import OurApproach from "./pages/pps/about/OurApproach";

import OurImpact from "./pages/pps/about/OurImpact";

// New Partner Section
import PartnerWithUs from "./pages/pps/partner/PartnerWithUs";
import PartnerWithUsAlt from "./pages/pps/partner/PartnerWithUsAlt";
import PPSHomeAlt from "./pages/pps/PPSHomeAlt";
import IgnitePath from "./pages/pps/partner/IgnitePath";
import IgnitePathAlt from "./pages/pps/partner/IgnitePathAlt";
import AmplifyPath from "./pages/pps/partner/AmplifyPath";
import AmplifyPathAlt from "./pages/pps/partner/AmplifyPathAlt";
import EmbodyPath from "./pages/pps/partner/EmbodyPath";
import EmbodyPathAlt from "./pages/pps/partner/EmbodyPathAlt";

// NOTE: "Alt" components are now the PRIMARY pages.
// Original components are archived at -archive routes.

// IGNITE Subpages
import IgniteCourses from "./pages/pps/partner/ignite/IgniteCourses";
import IgniteAssessments from "./pages/pps/partner/ignite/IgniteAssessments";
import IgniteMasterclasses from "./pages/pps/partner/ignite/IgniteMasterclasses";
import EQAssessment from "./pages/pps/partner/ignite/EQAssessment";
import EQChangeLeaderMini from "./pages/pps/EQChangeLeaderMini";

// AMPLIFY Subpages
import AmplifyWorkshops from "./pages/pps/partner/amplify/AmplifyWorkshops";
import AmplifySprints from "./pages/pps/partner/amplify/AmplifySprints";
import AmplifyLabs from "./pages/pps/partner/amplify/AmplifyLabs";
import StracticalLeaderWorkshop from "./pages/pps/partner/amplify/StracticalLeaderWorkshop";
import StracticalLeaderCheckout from "./pages/pps/partner/amplify/StracticalLeaderCheckout";

// New Resources Section
import ResourcesHub from "./pages/pps/resources/ResourcesHub";
import FreeDownloads from "./pages/pps/resources/FreeDownloads";
import YouTubePage from "./pages/pps/resources/YouTubePage";
import AsSeenOn from "./pages/pps/resources/AsSeenOn";
import FAQPage from "./pages/pps/resources/FAQPage";
import StracticalLeaderGuide from "./pages/pps/resources/StracticalLeaderGuide";
import StracticalMiniThankYou from "./pages/pps/resources/StracticalMiniThankYou";

import BurnoutResources from "./pages/pps/resources/BurnoutResources";
import BurnoutOptIn from "./pages/pps/BurnoutOptIn";

// Program Detail Pages
import RadicalMindfulness from "./pages/pps/programs/RadicalMindfulness";
import MasterYourMessage from "./pages/pps/programs/MasterYourMessage";
import ExtraordinaryTeams from "./pages/pps/programs/ExtraordinaryTeams";

// About Team Hubs
import AboutAmy from "./pages/pps/AboutAmy";
import AboutRob from "./pages/pps/AboutRob";
import AboutSierra from "./pages/pps/AboutSierra";
import PPSOverview from "./pages/pps/PPSOverview";

// Blue Door Pages
import BlueDoorLanding from "./pages/pps/BlueDoorLanding";
import BlueDoorLandingArchive from "./pages/pps/BlueDoorLandingArchive";
import BlueDoorPurchase from "./pages/pps/BlueDoorPurchase";
import BlueDoorSuccess from "./pages/pps/BlueDoorSuccess";

// Other Pages
import Speaking from "./pages/pps/Speaking";
import AmySpeaker from "./pages/pps/speaking/AmySpeaker";
import RobSpeaker from "./pages/pps/speaking/RobSpeaker";
import SierraSpeaker from "./pages/pps/speaking/SierraSpeaker";
import StartHere from "./pages/pps/StartHere";
import KickTheHabit from "./pages/pps/KickTheHabit";
import StoicFieldGuide from "./pages/pps/StoicFieldGuide";
import StoicFieldGuideAccess from "./pages/pps/StoicFieldGuideAccess";
import PilotTraining from "./pages/pps/PilotTraining";
import PilotTrainingWatch from "./pages/pps/PilotTrainingWatch";
import FiveDayMasterYourMessage from "./pages/pps/FiveDayMasterYourMessage";
import TeamChallenge from "./pages/pps/TeamChallenge";
import JournalingChallenge from "./pages/pps/JournalingChallenge";
import KickTheHabitWatch from "./pages/pps/KickTheHabitWatch";
import CommunicatorStyles from "./pages/pps/CommunicatorStyles";
import CommunicatorStylesWatch from "./pages/pps/CommunicatorStylesWatch";
import WFHSignUp from "./pages/pps/WFHSignUp";
import WFHThankYou from "./pages/pps/WFHThankYou";
import ElementsMiniSignUp from "./pages/pps/ElementsMiniSignUp";
import StrategicCanvasSignUp from "./pages/pps/StrategicCanvasSignUp";
import StrategicCanvasThankYou from "./pages/pps/StrategicCanvasThankYou";
import ChangeRoadmapSignUp from "./pages/pps/ChangeRoadmapSignUp";
import ChangeRoadmapThankYou from "./pages/pps/ChangeRoadmapThankYou";
import ChangeCommsSignUp from "./pages/pps/ChangeCommsSignUp";
import ChangeReadyTeamAssessment from "./pages/pps/ChangeReadyTeamAssessment";
import ChangeReadyLeaderAssessment from "./pages/pps/ChangeReadyLeaderAssessment";
import ElementalStyleAssessment from "./pages/pps/ElementalStyleAssessment";
import TeamHealthAssessment from "./pages/pps/TeamHealthAssessment";
import ChangeCommsThankYou from "./pages/pps/ChangeCommsThankYou";
import TermsAndConditions from "./pages/pps/TermsAndConditions";
import Sitemap from "./pages/pps/Sitemap";
import EasterEggForm from "./pages/pps/EasterEggForm";
import Unsubscribe from "./pages/pps/Unsubscribe";

// Admin Pages
import AdminLogin from "./pages/pps/admin/AdminLogin";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/pps/admin/AdminDashboard";
import BlogPostList from "./pages/pps/admin/BlogPostList";
import BlogPostEditor from "./pages/pps/admin/BlogPostEditor";
import AdminUsers from "./pages/pps/admin/AdminUsers";
import MediaAppearanceList from "./pages/pps/admin/MediaAppearanceList";
import MediaAppearanceEditor from "./pages/pps/admin/MediaAppearanceEditor";
import YouTubeVideoList from "./pages/pps/admin/YouTubeVideoList";
import YouTubeVideoEditor from "./pages/pps/admin/YouTubeVideoEditor";
import AccountSettings from "./pages/pps/admin/AccountSettings";
import SiteVideosManager from "./pages/pps/admin/SiteVideosManager";
import PageStatusManager from "./pages/pps/admin/PageStatusManager";
import BackupsManager from "./pages/pps/admin/BackupsManager";
import MigrateManager from "./pages/pps/admin/MigrateManager";
import RestoreWizard from "./pages/pps/admin/RestoreWizard";
import IntegrityCheck from "./pages/pps/admin/IntegrityCheck";
import SecretsHandoff from "./pages/pps/admin/SecretsHandoff";
import MigrationChecklist from "./pages/pps/admin/MigrationChecklist";
import SiteEmails from "./pages/pps/admin/SiteEmails";
import EmailOps from "./pages/pps/admin/EmailOps";
import ResetPassword from "./pages/pps/admin/ResetPassword";

// Legacy redirect: forward /pps/* paths to clean URLs
function LegacyPPSRedirect() {
  const path = window.location.pathname;
  if (path.startsWith('/pps')) {
    const cleanPath = path.replace(/^\/pps/, '') || '/';
    return <Navigate to={`${cleanPath}${window.location.search}${window.location.hash}`} replace />;
  }
  return <NotFound />;
}

function ScrollToHash() {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [hash, pathname]);
  return null;
}

function RouteSeoGuards() {
  const { pathname } = useLocation();

  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isApiRoute = pathname === "/api" || pathname.startsWith("/api/");
  const isInternalOnlyRoute = [
    "/reset-password",
    "/unsubscribe",
    "/blue-door/success",
    "/wfh-thank-you",
    "/thank-you-change-canvas",
    "/thank-you-change-roadmap",
    "/change-comms-thank-you",
    "/stractical-mini-thank-you",
    "/sitemap",
  ].includes(pathname);
  const isSystemOutcomeRoute = /(thank-you|success)$/.test(pathname);
  const shouldNoIndex = isAdminRoute || isApiRoute || isInternalOnlyRoute || isSystemOutcomeRoute;

  useEffect(() => {
    if (!shouldNoIndex) return;

    const ensureMeta = (name: string, content: string) => {
      let el = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const ensureCanonical = (href: string) => {
      let el = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", "canonical");
        document.head.appendChild(el);
      }
      el.setAttribute("href", `${getSiteUrl()}${href}`);
    };

    ensureMeta("robots", "noindex, nofollow, noarchive, nosnippet");
    ensureCanonical(pathname);
  }, [pathname, shouldNoIndex]);

  return null;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToHash />
        <RouteSeoGuards />
        <Routes>
          {/* Painted Porch Strategies Routes */}
          <Route path="/" element={<PPSLayout />}>
            <Route index element={<PPSHome />} />
            <Route path="home-alt" element={<PPSHomeAlt />} />
            {/* About Section */}
            <Route path="about" element={<PPSAbout />} />
            <Route path="about/approach" element={<OurApproach />} />
            <Route path="about/impact" element={<OurImpact />} />
            
            {/* Partner Section (P.A.T.H. hub) */}
            <Route path="partner" element={<PartnerWithUsAlt />} />
            <Route path="partner-archive" element={<PartnerWithUs />} />
            
            <Route path="partner/ignite" element={<IgnitePathAlt />} />
            <Route path="partner/ignite/courses" element={<IgniteCourses />} />
            <Route path="partner/ignite/assessments" element={<IgniteAssessments />} />
            <Route path="partner/ignite/masterclasses" element={<IgniteMasterclasses />} />
            <Route path="eq" element={<EQAssessment />} />
            <Route path="eq-change-leader" element={<EQChangeLeaderMini />} />
            <Route path="eq-change-leader-mini" element={<Navigate to="/eq-change-leader" replace />} />
            <Route path="partner/ignite-archive" element={<IgnitePath />} />
            <Route path="partner/amplify" element={<AmplifyPathAlt />} />
            <Route path="partner/amplify/workshops" element={<AmplifyWorkshops />} />
            <Route path="partner/amplify/sprints" element={<AmplifySprints />} />
            <Route path="partner/amplify/labs" element={<AmplifyLabs />} />
            <Route path="partner/amplify/stractical-leader" element={<StracticalLeaderWorkshop />} />
            <Route path="partner/amplify/stractical-leader/enroll" element={<StracticalLeaderCheckout />} />
            <Route path="partner/amplify-archive" element={<AmplifyPath />} />
            <Route path="partner/embody" element={<EmbodyPathAlt />} />
            <Route path="partner/embody-archive" element={<EmbodyPath />} />
            
            {/* Resources Section */}
            <Route path="resources" element={<ResourcesHub />} />
            <Route path="resources/free" element={<FreeDownloads />} />
            <Route path="resources/insights" element={<PPSBlog />} />
            <Route path="resources/insights/:slug" element={<PPSBlogPost />} />
            {/* Legacy /resources/blog redirects */}
            <Route path="resources/blog" element={<Navigate to="/resources/insights" replace />} />
            <Route path="resources/blog/:slug" element={<RedirectBlogToInsights />} />
            <Route path="resources/youtube" element={<YouTubePage />} />
            <Route path="speaking/media" element={<AsSeenOn />} />
            <Route path="resources/faq" element={<FAQPage />} />
            <Route path="resources/stractical-mini" element={<StracticalLeaderGuide />} />
            <Route path="stractical-mini-thank-you" element={<StracticalMiniThankYou />} />
            
            <Route path="burnout-access" element={<BurnoutResources />} />
            <Route path="burnout" element={<BurnoutOptIn />} />
            {/* Legacy redirects */}
            <Route path="resources/burnout" element={<Navigate to="/burnout-access" replace />} />
            <Route path="burnout-resources-opt-in" element={<Navigate to="/burnout" replace />} />
            
            {/* Other Pages */}
            
            <Route path="speaking" element={<Speaking />} />
            <Route path="speaking/amy" element={<AmySpeaker />} />
            <Route path="speaking/rob" element={<RobSpeaker />} />
            <Route path="speaking/sierra" element={<SierraSpeaker />} />
            <Route path="start-here" element={<StartHere />} />
            <Route path="kick-the-habit" element={<KickTheHabit />} />
            <Route path="kick-the-habit-watch" element={<KickTheHabitWatch />} />
            <Route path="stoic-field-guide" element={<StoicFieldGuide />} />
            <Route path="stoic-field-guide-access" element={<StoicFieldGuideAccess />} />
            <Route path="pilot-training" element={<PilotTraining />} />
            <Route path="pilot-training-watch" element={<PilotTrainingWatch />} />
            <Route path="6-communicator-styles" element={<CommunicatorStyles />} />
            <Route path="6-communicator-styles-watch" element={<CommunicatorStylesWatch />} />
            <Route path="talking-to-strangers" element={<FiveDayMasterYourMessage />} />
            <Route path="5-day-master-your-message-challenge" element={<Navigate to="/talking-to-strangers" replace />} />
            <Route path="team-superpowers" element={<TeamChallenge />} />
            <Route path="team-challenge" element={<Navigate to="/team-superpowers" replace />} />
            <Route path="mym-journal-challenge" element={<JournalingChallenge />} />
            <Route path="master-your-message-journal-challenge-feb2021" element={<Navigate to="/mym-journal-challenge" replace />} />
            
            <Route path="wfh-sign-up" element={<WFHSignUp />} />
            <Route path="wfh-thank-you" element={<WFHThankYou />} />
            <Route path="elements-mini" element={<ElementsMiniSignUp />} />
            <Route path="change-canvas" element={<StrategicCanvasSignUp />} />
            <Route path="thank-you-change-canvas" element={<StrategicCanvasThankYou />} />
            <Route path="change-roadmap" element={<ChangeRoadmapSignUp />} />
            <Route path="thank-you-change-roadmap" element={<ChangeRoadmapThankYou />} />
            <Route path="change-comms" element={<ChangeCommsSignUp />} />
            <Route path="change-comms-thank-you" element={<ChangeCommsThankYou />} />
            <Route path="change-ready-team-assessment" element={<ChangeReadyTeamAssessment />} />
            <Route path="change-ready-leader-assessment" element={<ChangeReadyLeaderAssessment />} />
            <Route path="elemental-style-assessment" element={<ElementalStyleAssessment />} />
            <Route path="team-health-assessment" element={<TeamHealthAssessment />} />
            {/* Legacy redirects */}
            <Route path="strategic-plan" element={<Navigate to="/change-canvas" replace />} />
            <Route path="thank-you-strategic-plan" element={<Navigate to="/thank-you-change-canvas" replace />} />
            <Route path="blue-door" element={<BlueDoorLanding />} />
            <Route path="blue-door-archive" element={<BlueDoorLandingArchive />} />
            <Route path="blue-door/purchase" element={<BlueDoorPurchase />} />
            <Route path="blue-door/success" element={<BlueDoorSuccess />} />
            <Route path="contact" element={<PPSContact />} />
            <Route path="terms" element={<TermsAndConditions />} />
            <Route path="sitemap" element={<Sitemap />} />
            <Route path="found-it" element={<EasterEggForm />} />
            <Route path="unsubscribe" element={<Unsubscribe />} />
            
            {/* Legacy routes - keep for now */}
            <Route path="for-leaders" element={<PPSForLeaders />} />
            <Route path="for-teams" element={<PPSForTeams />} />
            <Route path="services" element={<PPSServices />} />
            <Route path="business-programs" element={<PPSBusinessPrograms />} />
            
            {/* Redirects for moved pages */}
            <Route path="programs" element={<PPSPrograms />} />
            <Route path="radical-mindfulness" element={<RadicalMindfulness />} />
            <Route path="communication" element={<MasterYourMessage />} />
            <Route path="extraordinary-teams" element={<ExtraordinaryTeams />} />

            {/* Quick-access redirect shortcuts */}
            <Route path="stracticalleader" element={<Navigate to="/partner/amplify/stractical-leader" replace />} />
            <Route path="blog" element={<Navigate to="/resources/insights" replace />} />
            <Route path="blog/:slug" element={<RedirectBlogToInsights />} />
            <Route path="insights" element={<Navigate to="/resources/insights" replace />} />
            <Route path="stracticalmini" element={<Navigate to="/resources/stractical-mini" replace />} />
            <Route path="media" element={<Navigate to="/speaking/media" replace />} />
            <Route path="free" element={<Navigate to="/resources/free" replace />} />
            <Route path="ignite" element={<Navigate to="/partner/ignite" replace />} />
            <Route path="amplify" element={<Navigate to="/partner/amplify" replace />} />
            <Route path="embody" element={<Navigate to="/partner/embody" replace />} />
            <Route path="courses" element={<Navigate to="/partner/ignite/courses" replace />} />
            <Route path="masterclass" element={<Navigate to="/partner/ignite/masterclasses" replace />} />
            <Route path="workshops" element={<Navigate to="/partner/amplify/workshops" replace />} />
            <Route path="sprints" element={<Navigate to="/partner/amplify/sprints" replace />} />
            <Route path="labs" element={<Navigate to="/partner/amplify/labs" replace />} />
          </Route>

          {/* Link-in-Bio Hub Pages (standalone, no nav/footer) */}
          <Route path="/amy" element={<AboutAmy />} />
          <Route path="/rob" element={<AboutRob />} />
          <Route path="/sierra" element={<AboutSierra />} />
          <Route path="/overview" element={<PPSOverview />} />
          

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="posts" element={<BlogPostList />} />
            <Route path="posts/:id" element={<BlogPostEditor />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="media" element={<MediaAppearanceList />} />
            <Route path="media/:id" element={<MediaAppearanceEditor />} />
            <Route path="youtube" element={<YouTubeVideoList />} />
            <Route path="youtube/:id" element={<YouTubeVideoEditor />} />
            <Route path="account" element={<AccountSettings />} />
            <Route path="videos" element={<SiteVideosManager />} />
            <Route path="pages" element={<PageStatusManager />} />
            <Route path="backups" element={<BackupsManager />} />
            <Route path="migrate" element={<MigrateManager />} />
            <Route path="restore" element={<RestoreWizard />} />
            <Route path="verify" element={<IntegrityCheck />} />
            <Route path="secrets-handoff" element={<SecretsHandoff />} />
            <Route path="migration-checklist" element={<MigrationChecklist />} />
            <Route path="emails" element={<SiteEmails />} />
            <Route path="emails/health" element={<EmailHealth />} />
            <Route path="emails/queue" element={<EmailQueue />} />
          </Route>
          
          {/* Legacy /pps/* redirects + 404 catch-all */}
          <Route path="/pps/*" element={<LegacyPPSRedirect />} />
          <Route path="/pps" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
