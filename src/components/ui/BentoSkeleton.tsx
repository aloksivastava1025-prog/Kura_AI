import React from 'react';
import { motion } from 'framer-motion';

export default function BentoSkeleton() {
  // A mock array to render 6 skeleton cards of varying shapes
  const skeletonShapes = [
    { type: 'tall', colSpan: 'col-span-1', rowSpan: 'row-span-2' },
    { type: 'large', colSpan: 'col-span-1 sm:col-span-2', rowSpan: 'row-span-2' },
    { type: 'small', colSpan: 'col-span-1', rowSpan: 'row-span-1' },
    { type: 'wide', colSpan: 'col-span-1 sm:col-span-2', rowSpan: 'row-span-1' },
    { type: 'small', colSpan: 'col-span-1', rowSpan: 'row-span-1' },
    { type: 'tall', colSpan: 'col-span-1', rowSpan: 'row-span-2' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-[250px] gap-4 w-full">
      {skeletonShapes.map((shape, i) => (
        <motion.div
          key={i}
          className={`${shape.colSpan} ${shape.rowSpan} rounded-card bg-gray-100 overflow-hidden relative shadow-sm`}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.1, // Stagger the pulsing
          }}
        >
          {/* Shimmer effect overlay */}
          <motion.div
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent z-10"
            animate={{ translateX: ['-100%', '200%'] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.1,
            }}
          />

          {/* Skeleton Content */}
          <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/10 to-transparent flex items-end justify-between opacity-50">
            <div className="space-y-2 w-2/3">
              <div className="h-4 bg-gray-300 rounded-full w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded-full w-1/2"></div>
            </div>
            <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
