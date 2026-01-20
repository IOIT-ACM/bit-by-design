import { useRef, useEffect } from "react";
import gsap from "gsap";
import { toast } from "react-hot-toast";
import { Button } from "../ui";
import { ArrowRightIcon } from "../icons";

export function CompetitionInstructions() {
  const containerRef = useRef<HTMLDivElement>(null);
  const FIGMA_LINK = "https://www.figma.com/community/file/1591156167480577666/bit-by-design-template";

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        ease: "power2.out", 
        delay: 0.6 
      }
    );
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(FIGMA_LINK);
    toast.success("Template link copied to clipboard!");
  };

  return (
    <div 
      ref={containerRef} 
      className="mt-16 sm:mt-24 mb-12 max-w-2xl text-center flex flex-col items-center gap-8 px-4"
      style={{ opacity: 0 }}
    >
      <div className="flex flex-col gap-6">
        <h3 className="font-['Figtree',sans-serif] font-semibold text-xl sm:text-2xl text-white tracking-tight">
          Competition Guidelines
        </h3>
        
        <div className="space-y-6 text-sm sm:text-base text-white/60 font-['Figtree',sans-serif] leading-relaxed">
          <div className="flex flex-col gap-2">
            <p>
              1. <span className="text-white font-medium">Get the Template:</span> Copy the link below and open it in Figma Community to duplicate the official competition file.
            </p>
            <p>
              2. <span className="text-white font-medium">Use the Plugin:</span> To generate your presentation mockup, search for the <span className="text-[#cbff1f] font-bold italic">Bit By Design</span> plugin in the Figma resources panel. Run the plugin while selecting your design frame to automatically render it into the mockup structure.
            </p>
          </div>
          
          <p>
            You’re free to customize visual elements such as colors, border radius, and stroke widths to match your creative direction. However, please <span className="text-[#cbff1f] font-medium underline underline-offset-4">do not change the dimensions</span> of the main frame or the rectangles inside it, as these are required for consistency and judging.
          </p>
          
          <p className="italic text-white/40 border-t border-white/10 pt-4">
            Focus on bringing your unique ideas to life within the provided structure.
          </p>
        </div>
      </div>

      <Button 
        variant="primary" 
        className="w-auto px-10 h-11 group gap-3"
        onClick={handleCopyLink}
      >
        Copy Template Link
        <ArrowRightIcon className="transition-transform group-hover:translate-x-1" />
      </Button>
    </div>
  );
}