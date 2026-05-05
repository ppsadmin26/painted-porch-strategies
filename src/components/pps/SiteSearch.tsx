import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Users, Mic, BookOpen, Flame, Rocket, Building, Download, Video, ArrowRight } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface SearchEntry {
  title: string;
  description: string;
  href: string;
  category: string;
  keywords: string[];
  icon: React.ReactNode;
}

const searchIndex: SearchEntry[] = [
  // Main pages
  { title: "Home", description: "Welcome to Painted Porch Strategies", href: "/", category: "Pages", keywords: ["home", "main", "landing", "painted porch"], icon: <Building className="w-4 h-4" /> },
  { title: "Start Here", description: "Take the P.A.T.H.finder quiz to discover your pathway", href: "/start-here", category: "Pages", keywords: ["start", "quiz", "pathfinder", "path", "begin", "assessment", "blue door"], icon: <ArrowRight className="w-4 h-4" /> },
  { title: "Contact Us", description: "Get in touch with us", href: "/contact", category: "Pages", keywords: ["contact", "call", "schedule", "email", "phone", "reach out"], icon: <FileText className="w-4 h-4" /> },
  { title: "Speaking", description: "Book Amy for keynotes, workshops, and events", href: "/speaking", category: "Pages", keywords: ["speaking", "keynote", "event", "workshop", "conference", "presenter"], icon: <Mic className="w-4 h-4" /> },

  // About
  { title: "Our Approach", description: "Phase Zero, P.A.T.H., and the Painted Porch philosophy", href: "/about/approach", category: "About", keywords: ["approach", "phase zero", "path", "philosophy", "stoic", "methodology", "framework"], icon: <BookOpen className="w-4 h-4" /> },
  
  { title: "Our Impact", description: "Client results, testimonials, and partner logos", href: "/about/impact", category: "About", keywords: ["impact", "results", "testimonials", "clients", "partners", "case study", "success"], icon: <FileText className="w-4 h-4" /> },

  // Partnership Tiers
  { title: "Partner With Us", description: "Three ways to partner — IGNITE, AMPLIFY, EMBODY", href: "/partner", category: "Partnership", keywords: ["partner", "partnership", "tiers", "collaborate", "work with"], icon: <Building className="w-4 h-4" /> },
  { title: "IGNITE Path", description: "Light the fire — self-led courses, assessments, and masterclasses", href: "/partner/ignite", category: "Partnership", keywords: ["ignite", "self-led", "courses", "fire", "explore", "learn"], icon: <Flame className="w-4 h-4" /> },
  { title: "IGNITE Courses", description: "Self-paced learning for change-curious leaders", href: "/partner/ignite/courses", category: "Partnership", keywords: ["courses", "self-paced", "learning", "online", "extraordinary teams", "leading change"], icon: <Flame className="w-4 h-4" /> },
  { title: "IGNITE Assessments", description: "DISC, EQ, and Working Genius assessments", href: "/partner/ignite/assessments", category: "Partnership", keywords: ["assessments", "disc", "eq", "emotional intelligence", "working genius", "personality"], icon: <Flame className="w-4 h-4" /> },
  { title: "IGNITE Masterclasses", description: "Focused skill-building masterclass sessions", href: "/partner/ignite/masterclasses", category: "Partnership", keywords: ["masterclass", "skill", "session", "mindfulness", "habit", "journaling", "meditation"], icon: <Flame className="w-4 h-4" /> },
  { title: "AMPLIFY Path", description: "Shape excellence — workshops, sprints, and labs", href: "/partner/amplify", category: "Partnership", keywords: ["amplify", "workshops", "sprints", "labs", "team", "momentum", "collaborate"], icon: <Rocket className="w-4 h-4" /> },
  { title: "AMPLIFY Workshops", description: "Facilitated team workshops for alignment and growth", href: "/partner/amplify/workshops", category: "Partnership", keywords: ["workshops", "facilitated", "team", "alignment"], icon: <Rocket className="w-4 h-4" /> },
  { title: "AMPLIFY Sprints", description: "Focused sprint engagements for targeted outcomes", href: "/partner/amplify/sprints", category: "Partnership", keywords: ["sprints", "focused", "targeted", "rapid", "intensive"], icon: <Rocket className="w-4 h-4" /> },
  { title: "AMPLIFY Labs", description: "Collaborative lab environments for innovation", href: "/partner/amplify/labs", category: "Partnership", keywords: ["labs", "innovation", "collaborative", "experiment"], icon: <Rocket className="w-4 h-4" /> },
  { title: "EMBODY Path", description: "Make it permanent — embedded partnership for lasting transformation", href: "/partner/embody", category: "Partnership", keywords: ["embody", "embedded", "permanent", "enterprise", "c-suite", "executive", "transformation"], icon: <Building className="w-4 h-4" /> },

  // Resources
  { title: "Resources Hub", description: "All resources, tools, and content in one place", href: "/resources", category: "Resources", keywords: ["resources", "tools", "content", "library"], icon: <BookOpen className="w-4 h-4" /> },
  { title: "Free Resources", description: "Free guides, templates, and frameworks", href: "/resources/free", category: "Resources", keywords: ["free", "downloads", "guides", "templates", "frameworks", "pdf", "white paper", "resources"], icon: <Download className="w-4 h-4" /> },
  { title: "Insights", description: "Thoughts from the Porch — articles and insights", href: "/resources/insights", category: "Resources", keywords: ["insights", "blog", "articles", "thoughts", "porch", "writing", "post"], icon: <FileText className="w-4 h-4" /> },
  { title: "YouTube", description: "Video content and tutorials", href: "/resources/youtube", category: "Resources", keywords: ["youtube", "video", "tutorials", "watch"], icon: <Video className="w-4 h-4" /> },
  { title: "As Seen On", description: "Media appearances, podcasts, and features", href: "/speaking/media", category: "Speaking", keywords: ["media", "podcast", "appearances", "features", "press", "seen on"], icon: <FileText className="w-4 h-4" /> },

  // Concepts (searchable topics that link to relevant pages)
  { title: "Phase Zero", description: "The strategic authorship phase before implementation", href: "/about/approach", category: "Concepts", keywords: ["phase zero", "before implementation", "preparation", "readiness", "strategic authorship"], icon: <BookOpen className="w-4 h-4" /> },
  { title: "P.A.T.H. Framework", description: "Prepare → Align → Take Off → Habit", href: "/about/approach", category: "Concepts", keywords: ["path", "prepare", "align", "take off", "habit", "framework", "methodology"], icon: <BookOpen className="w-4 h-4" /> },
  { title: "The Painted Porch Pillars", description: "Cultural Cornerstone, Operational Frame, Living Ecosystem", href: "/about/approach", category: "Concepts", keywords: ["pillars", "cultural", "operational", "living ecosystem", "architecture", "adaptability"], icon: <BookOpen className="w-4 h-4" /> },
  { title: "Change Management", description: "Organizational transformation and shift strategies", href: "/about/approach", category: "Concepts", keywords: ["change management", "transformation", "shift", "organizational change", "transition", "adoption"], icon: <BookOpen className="w-4 h-4" /> },
];

export function SiteSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      navigate(href);
    },
    [navigate]
  );

  // Routes excluded from search indexing and autocomplete.
  // /burnout-access is gated behind the /burnout opt-in flow and must never appear
  // as a standalone search result.
  const EXCLUDED_HREFS = useMemo(() => new Set(["/burnout-access"]), []);

  const groupedEntries = useMemo(() => {
    const groups: Record<string, SearchEntry[]> = {};
    searchIndex
      .filter((entry) => !EXCLUDED_HREFS.has(entry.href))
      .forEach((entry) => {
        if (!groups[entry.category]) groups[entry.category] = [];
        groups[entry.category].push(entry);
      });
    return groups;
  }, [EXCLUDED_HREFS]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
        aria-label="Search site"
      >
        <Search className="w-5 h-5" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, resources, concepts..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {Object.entries(groupedEntries).map(([category, entries]) => (
            <CommandGroup key={category} heading={category}>
              {entries.map((entry) => (
                <CommandItem
                  key={entry.href + entry.title}
                  value={`${entry.title} ${entry.description} ${entry.keywords.join(" ")}`}
                  onSelect={() => handleSelect(entry.href)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <span className="text-primary">{entry.icon}</span>
                  <div className="flex flex-col">
                    <span className="font-medium">{entry.title}</span>
                    <span className="text-xs text-muted-foreground">{entry.description}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
