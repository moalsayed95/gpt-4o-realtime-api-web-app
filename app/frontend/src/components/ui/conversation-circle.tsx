import { motion } from "framer-motion";

type Props = {
  isRecording: boolean;
  size?: string;
};

export default function ConversationCircle({ isRecording, size = "200px" }: Props) {
  const rippleStyle = {
    position: "absolute" as const,
    inset: 0,
    borderRadius: "9999px",
    backgroundColor: "rgb(147, 51, 234)", // Purple-600
    opacity: 0,
  };

  const rippleAnimation = {
    animation: "ripple 2s linear infinite",
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <motion.div
        className="relative rounded-full bg-purple-600"
        animate={{ scale: isRecording ? 1 : 0.95 }}
        style={{ width: "100%", height: "100%" }}
      >
        {isRecording && (
          <>
            <div style={{ ...rippleStyle, ...rippleAnimation }} />
            <div style={{ ...rippleStyle, ...rippleAnimation, animationDelay: "0.6666s" }} />
            <div style={{ ...rippleStyle, ...rippleAnimation, animationDelay: "1.3333s" }} />
          </>
        )}
      </motion.div>
      <style>{`
        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
