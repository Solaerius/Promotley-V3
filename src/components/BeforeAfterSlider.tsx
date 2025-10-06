import { useState, useRef, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const BeforeAfterSlider = () => {
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isManuallyInteracted, setIsManuallyInteracted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const beforeStats = {
    metrics: [
      { label: "Följare", value: "1,234", change: "-3%", trending: "down" as const },
      { label: "Engagemang", value: "2.1%", change: "-0.8%", trending: "down" as const },
      { label: "Räckvidd", value: "3.2k", change: "-12%", trending: "down" as const },
      { label: "CTR", value: "0.9%", change: "-0.3%", trending: "down" as const },
    ]
  };

  const afterStats = {
    metrics: [
      { label: "Följare", value: "5,847", change: "+124%", trending: "up" as const },
      { label: "Engagemang", value: "8.4%", change: "+6.3%", trending: "up" as const },
      { label: "Räckvidd", value: "15.2k", change: "+12k", trending: "up" as const },
      { label: "CTR", value: "3.8%", change: "+2.9%", trending: "up" as const },
    ]
  };

  // Auto-animation effect
  useEffect(() => {
    if (isDragging || isManuallyInteracted) return;

    let direction = 1;
    let currentPos = sliderPosition;

    const animate = setInterval(() => {
      currentPos += direction * 0.5;
      
      if (currentPos >= 100) {
        currentPos = 100;
        direction = -1;
      } else if (currentPos <= 0) {
        currentPos = 0;
        direction = 1;
      }

      setSliderPosition(currentPos);
    }, 50);

    return () => clearInterval(animate);
  }, [isDragging, isManuallyInteracted]);

  // Reset manual interaction after 3 seconds of no dragging
  useEffect(() => {
    if (!isDragging && isManuallyInteracted) {
      const timeout = setTimeout(() => {
        setIsManuallyInteracted(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isDragging, isManuallyInteracted]);

  const handleMouseDown = () => {
    setIsDragging(true);
    setIsManuallyInteracted(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchStart = () => {
    setIsDragging(true);
    setIsManuallyInteracted(true);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ minHeight: "400px" }}
    >
      {/* Labels */}
      <div className="absolute top-4 left-0 right-0 z-20 flex justify-between px-8 pointer-events-none">
        <div className="text-destructive font-semibold text-sm uppercase tracking-wide">
          Före
        </div>
        <div className="text-accent font-semibold text-sm uppercase tracking-wide">
          Efter
        </div>
      </div>

      {/* Before Stats (Right side - always visible) */}
      <div className="absolute inset-0 p-8 pt-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {beforeStats.metrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <p className="text-sm text-white/60">{metric.label}</p>
              <p className="text-2xl font-bold text-white">{metric.value}</p>
              <div className="flex items-center gap-1">
                <TrendingDown className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">
                  {metric.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* After Stats (Left side - revealed by slider) */}
      <div 
        className="absolute inset-0 p-8 pt-16"
        style={{
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {afterStats.metrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <p className="text-sm text-white/60">{metric.label}</p>
              <p className="text-2xl font-bold text-white">{metric.value}</p>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">
                  {metric.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white/80 backdrop-blur-sm z-30 cursor-ew-resize"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Handle circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-glow flex items-center justify-center">
          <div className="flex gap-1">
            <div className="w-0.5 h-4 bg-gray-400"></div>
            <div className="w-0.5 h-4 bg-gray-400"></div>
          </div>
        </div>
      </div>

      {/* Helper Text */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-white/60 text-sm pointer-events-none z-20">
        {isManuallyInteracted ? "Släpp för att fortsätta automatisk animation" : "Dra slidern eller vänta för automatisk animation"}
      </div>
    </div>
  );
};

export default BeforeAfterSlider;