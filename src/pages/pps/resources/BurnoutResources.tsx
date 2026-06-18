import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Download, Play, ExternalLink, ArrowRight, Heart, Users, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ColorSplashBackground from "@/components/pps/ColorSplashBackground";

const resources = {
  awareness: [
    {
      tag: "BURNOUT 101",
      title: "[DOWNLOAD] Burnout Resource & Action Guide",
      description: "Download a copy of our resource and action guide all about how to spot and squash burnout.",
      cta: "DOWNLOAD RESOURCE GUIDE",
      url: "/Reigniting_Resilience_Resource_Guide_Painted_Porch_Strategies.pdf",
      icon: Download,
    },
  ],
  forYou: [
    {
      tag: "FIND CLARITY",
      title: "[WATCH] Mindful Moments on YouTube",
      description: "Check out Sierra's Mindful Moments on YouTube to learn small ways to bring mindfulness into your daily routine and habits.",
      cta: "CATCH A MINDFUL MOMENT",
      url: "https://www.youtube.com/playlist?list=PLhdPibIQvwhH4j94ohc0BsOJqUud4xzoL",
      icon: Play,
    },
    {
      tag: "JUST BREATHE",
      title: "[WATCH] Birthday Candle Breath",
      description: "Make a wish and then blow out the thoughts, worries, and anxieties no longer serving you.",
      cta: "CELEBRATE PRESENCE",
      url: "https://youtu.be/QC_6yGQAPz0",
      icon: Play,
    },
  ],
  forLeaders: [
    {
      tag: "LEAD THROUGH REFLECTION",
      title: "[PRACTICE] The Peach & the Pit",
      description: "Flip the script on challenges by practicing a simple reflection & gratitude habit.",
      cta: "LEARN MORE",
      url: "https://youtu.be/BzbfnQvTaWI?t=1118",
      icon: Play,
    },
    {
      tag: "LEAD THROUGH LAUGHTER",
      title: "[WATCH] Laughter Yoga",
      description: "Laughter can truly be the best medicine...and it's a simple way to shake off anxiety and recharge with others.",
      cta: "C'MON GET HAPPY",
      url: "https://youtu.be/UpR6pR1w80A",
      icon: Play,
    },
  ],
};

const BurnoutResources = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [authorized, setAuthorized] = useState(() => !!sessionStorage.getItem("burnout_access"));
  const [checking, setChecking] = useState(!authorized);

  useEffect(() => {
    if (authorized) return;

    const accessToken = searchParams.get("access");
    const email = searchParams.get("email");

    if (accessToken && email) {
      const verifyUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-burnout-optin?token=${encodeURIComponent(accessToken)}&email=${encodeURIComponent(email)}`;
      fetch(verifyUrl)
        .then((res) => res.json())
        .then((data) => {
          if (data.valid) {
            sessionStorage.setItem("burnout_access", "1");
            setAuthorized(true);
          } else {
            navigate("/burnout?invalid=1", { replace: true });
          }
        })
        .catch(() => {
          navigate("/burnout?invalid=1", { replace: true });
        })
        .finally(() => setChecking(false));
    } else {
      navigate("/burnout", { replace: true });
    }
  }, [authorized, navigate, searchParams]);

  if (checking || !authorized) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <ColorSplashBackground />
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-white flex items-center justify-center gap-3">
            <Flame className="h-10 w-10 text-orange-400 shrink-0" />
            Burnout-Busting Resources
          </h1>
          <p className="mt-5 text-white/90 text-lead leading-relaxed max-w-2xl mx-auto font-montserrat">
            Scroll down to access materials & resources to help you bust burnout in yourself, as well as how to empower your team to take the reins of resilience.
          </p>
          <a href="#resources-start">
            <Button className="mt-8 bg-white text-primary hover:bg-white/90 font-poppins font-semibold px-8 h-12">
              GET STARTED
            </Button>
          </a>
        </div>
      </div>

      {/* GET PREPARED */}
      <section id="resources-start" className="py-20 bg-background scroll-mt-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="font-poppins font-semibold text-body-sm uppercase tracking-wider text-primary mb-2">
              Get Prepared
            </p>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-foreground flex items-center justify-center gap-2">
              🔎 Action Begins with Awareness.
            </h2>
          </div>

          <div className="grid md:grid-cols-1 gap-8">
            {resources.awareness.map((item) => (
              <ResourceCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* The Painted Porch Story */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="font-poppins font-semibold text-body-sm uppercase tracking-wider text-primary mb-2">
            The Painted Porch Story
          </p>
          <h2 className="text-3xl md:text-4xl font-poppins font-bold text-foreground mb-6">
            What's a Painted Porch?
          </h2>
          <p className="text-body text-muted-foreground leading-relaxed max-w-3xl mx-auto font-montserrat">
            Painted Porch Strategies was founded in 2020 to address one of the most impactful but often overlooked drivers of successful innovation, transformation, and change, YOUR PEOPLE. Our training, coaching, and advisory programs prepare your people to step in, stand strong, speak up, and share and challenge ideas that can lead to lasting change that sticks.
          </p>
          <Link to="/about" className="inline-flex items-center gap-2 mt-6 text-primary font-poppins font-semibold hover:underline">
            Learn more <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FOR YOU */}
      <section className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="font-poppins font-semibold text-body-sm uppercase tracking-wider text-primary mb-2">
              Put Your Mask on First
            </p>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-foreground flex items-center justify-center gap-2">
              💪 Address Burnout: For YOU.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {resources.forYou.map((item) => (
              <ResourceCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="font-poppins font-semibold text-body-sm uppercase tracking-wider text-primary mb-2">
            Who We Are
          </p>
          <h2 className="text-3xl md:text-4xl font-poppins font-bold text-foreground mb-6">
            Our Team of Experts
          </h2>
          <p className="text-body text-muted-foreground leading-relaxed max-w-3xl mx-auto font-montserrat">
            While partnering with organizations embarking on change is our focus, our team comes from a diverse background of industries and experience. They bring with them the expertise of what is truly needed to empower your people to navigate this ever-evolving world and its demands.
          </p>
          <Link to="/about" className="inline-flex items-center gap-2 mt-6 text-primary font-poppins font-semibold hover:underline">
            Meet the team <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FOR LEADERS */}
      <section className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="font-poppins font-semibold text-body-sm uppercase tracking-wider text-primary mb-2">
              Support Others
            </p>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-foreground flex items-center justify-center gap-2">
              🤝 Address Burnout: As a LEADER.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {resources.forLeaders.map((item) => (
              <ResourceCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* Radical Mindfulness CTA */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="font-poppins font-semibold text-body-sm uppercase tracking-wider text-primary mb-2">
            Tackle Burnout
          </p>
          <h2 className="text-3xl md:text-4xl font-poppins font-bold text-foreground mb-6">
            Learn Radical Mindfulness
          </h2>
          <p className="text-body text-muted-foreground leading-relaxed max-w-2xl mx-auto font-montserrat mb-8">
            Want to learn more ways to help you and your team tackle burnout and overwhelm, show up strong, and have resilience to obstacles and challenges? Let Sierra show you how through her Radical Mindfulness training program.
          </p>
          <Link to="/radical-mindfulness">
            <Button className="bg-primary hover:bg-primary/90 font-poppins font-semibold px-8 h-12">
              LEARN MORE
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

interface ResourceCardProps {
  tag: string;
  title: string;
  description: string;
  cta: string;
  url: string;
  icon: React.ElementType;
}

const ResourceCard = ({ tag, title, description, cta, url, icon: Icon }: ResourceCardProps) => (
  <div className="bg-white rounded-xl border border-border/50 shadow-sm p-8 flex flex-col">
    <p className="font-poppins font-semibold text-caption uppercase tracking-wider text-primary mb-2">
      {tag}
    </p>
    <h3 className="text-xl md:text-2xl font-poppins font-bold text-foreground mb-3">
      {title}
    </h3>
    <p className="text-body text-muted-foreground font-montserrat mb-6 flex-1">
      {description}
    </p>
    <a
      href={url}
      target={url.startsWith("http") ? "_blank" : undefined}
      rel={url.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white font-poppins font-semibold gap-2">
        <Icon className="h-4 w-4" />
        {cta}
      </Button>
    </a>
  </div>
);

export default BurnoutResources;
