import React, { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValue, useTransform } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface Props {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export const OPayRefresh = ({ onRefresh, children }: Props) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const y = useMotionValue(0);
  
  // Controls the spinner rotation and opacity as you pull
  const rotate = useTransform(y, [0, 100], [0, 360]);
  const opacity = useTransform(y, [0, 50], [0, 1]);
  const scale = useTransform(y, [0, 80], [0.5, 1.1]);

  const handleDragEnd = async () => {
    if (y.get() > 70 && !isRefreshing) {
      setIsRefreshing(true);
      y.set(70); // Keep spinner visible at a fixed point
      await onRefresh();
      setIsRefreshing(false);
      y.set(0); // Snap back
    } else {
      y.set(0);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* The OPay-style Spinner Overlay */}
      <motion.div
        style={{ y, opacity, scale, x: '-50%' }}
        className="fixed top-10 left-1/2 z-50 pointer-events-none"
      >
        <div className="bg-white rounded-full p-2 shadow-lg border border-emerald-100 flex items-center justify-center">
          <motion.div 
            style={{ rotate }}
            animate={isRefreshing ? { rotate: 360 } : {}}
            transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : { type: "spring" }}
          >
            <RefreshCw className="w-6 h-6 text-emerald-500" />
          </motion.div>
        </div>
      </motion.div>

      {/* The Actual Dashboard Content */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 150 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="touch-none"
      >
        {children}
      </motion.div>
    </div>
  );
};