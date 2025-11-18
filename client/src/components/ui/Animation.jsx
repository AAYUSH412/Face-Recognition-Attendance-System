import { motion } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import { useInView } from 'react-intersection-observer';
import { animationVariants, staggerVariants, pageTransitions } from '../../lib/animations';

// Pre-built animated components
export const AnimatedDiv = motion.div;
export const AnimatedButton = motion.button;
export const AnimatedCard = motion.div;
export const AnimatedList = motion.ul;
export const AnimatedListItem = motion.li;

// Fade In Animation Component
export const FadeIn = ({ children, delay = 0, duration = 0.4, direction = 'up', ...props }) => {
  const variants = {
    up: animationVariants.fadeInUp,
    down: animationVariants.fadeInDown,
    left: animationVariants.fadeInLeft,
    right: animationVariants.fadeInRight,
    none: animationVariants.fadeIn
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants[direction]}
      transition={{ delay, duration }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Scale In Animation Component
export const ScaleIn = ({ children, delay = 0, duration = 0.3, ...props }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={animationVariants.scaleIn}
      transition={{ delay, duration }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Stagger Children Animation Component
export const StaggerContainer = ({ children, staggerDelay = 0.1, ...props }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, ...props }) => {
  return (
    <motion.div
      variants={staggerVariants.item}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Intersection Observer Animation Component
export const AnimateOnScroll = ({ 
  children, 
  animation = 'fadeInUp', 
  threshold = 0.1, 
  triggerOnce = true,
  ...props 
}) => {
  const [ref, inView] = useInView({
    threshold,
    triggerOnce
  });

  return (
    <motion.div
      ref={ref}
      initial="initial"
      animate={inView ? "animate" : "initial"}
      variants={animationVariants[animation]}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Loading Animation Component
export const LoadingSpinner = ({ size = 24, color = "currentColor", className = "" }) => {
  return (
    <motion.div
      className={`inline-block ${className}`}
      variants={animationVariants.spinner}
      animate="animate"
      style={{
        width: size,
        height: size,
        border: `2px solid transparent`,
        borderTopColor: color,
        borderRadius: '50%'
      }}
    />
  );
};

// Loading Dots Component
export const LoadingDots = ({ className = "" }) => {
  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 bg-current rounded-full"
          animate={{
            y: [0, -10, 0],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.2
          }}
        />
      ))}
    </div>
  );
};

// Pulsing Animation Component
export const PulseAnimation = ({ children, ...props }) => {
  return (
    <motion.div
      variants={animationVariants.pulse}
      animate="animate"
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Hover Animation Component
export const HoverScale = ({ children, scale = 1.05, ...props }) => {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Page Transition Wrapper
export const PageTransition = ({ children, type = 'fade' }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransitions[type]}
    >
      {children}
    </motion.div>
  );
};

// Number Counter Animation using react-spring
export const AnimatedCounter = ({ 
  value, 
  duration = 1000, 
  formatter = (val) => Math.floor(val).toLocaleString(),
  className = ""
}) => {
  const { number } = useSpring({
    from: { number: 0 },
    number: value,
    delay: 200,
    config: { duration }
  });

  return (
    <animated.span className={className}>
      {number.to(formatter)}
    </animated.span>
  );
};

// Progress Bar Animation
export const AnimatedProgressBar = ({ 
  value, 
  className = "",
  barClassName = "",
  duration = 1000 
}) => {
  const props = useSpring({
    width: `${value}%`,
    from: { width: '0%' },
    config: { duration }
  });

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <animated.div
        style={props}
        className={`h-2 rounded-full bg-blue-600 ${barClassName}`}
      />
    </div>
  );
};

// Slide Up Panel Animation
export const SlideUpPanel = ({ children, isOpen, ...props }) => {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: isOpen ? 0 : "100%" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-lg shadow-lg"
      {...props}
    >
      {children}
    </motion.div>
  );
};
