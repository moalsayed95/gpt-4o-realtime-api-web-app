import { useState } from "react";
// import { GroundingFiles } from "@/components/ui/grounding-files";
import GroundingFileView from "@/components/ui/grounding-file-view";
import ConversationCircle from "@/components/ui/conversation-circle";

import useRealTime from "@/hooks/useRealtime";
import useAudioRecorder from "@/hooks/useAudioRecorder";
import useAudioPlayer from "@/hooks/useAudioPlayer";

import { GroundingFile } from "./types";

//import logo from "./assets/logo.svg";

function App() {
    const [isRecording, setIsRecording] = useState(false);
    // const [groundingFiles, setGroundingFiles] = useState<GroundingFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<GroundingFile | null>(null);

    const { startSession, addUserAudio, inputAudioBufferClear } = useRealTime({
        onWebSocketOpen: () => console.log("WebSocket connection opened"),
        onWebSocketClose: () => console.log("WebSocket connection closed"),
        onWebSocketError: event => console.error("WebSocket error:", event),
        onReceivedError: message => console.error("error", message),
        onReceivedResponseAudioDelta: message => {
            isRecording && playAudio(message.delta);
        },
        onReceivedInputAudioBufferSpeechStarted: () => {
            stopAudioPlayer();
        },
        onReceivedExtensionMiddleTierToolResponse: message => {
            console.log("Received extension middle tier tool response", message);
            // const result: ToolResult = JSON.parse(message.tool_result);
            // const files: GroundingFile[] = result.sources.map(x => {
            //     const match = x.chunk_id.match(/_pages_(\d+)$/);
            //     const name = match ? `${x.title}#page=${match[1]}` : x.title;
            //     return { id: x.chunk_id, name: name, content: x.chunk };
            // });
            // setGroundingFiles(prev => [...prev, ...files]);
        }
    });

    const { reset: resetAudioPlayer, play: playAudio, stop: stopAudioPlayer } = useAudioPlayer();
    const { start: startAudioRecording, stop: stopAudioRecording } = useAudioRecorder({ onAudioRecorded: addUserAudio });

    const onToggleListening = async () => {
        if (!isRecording) {
            startSession();
            await startAudioRecording();
            resetAudioPlayer();
            setIsRecording(true);
        } else {
            await stopAudioRecording();
            stopAudioPlayer();
            inputAudioBufferClear();
            setIsRecording(false);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 text-gray-900">
            {/* Futuristic Background */}
            <div className="absolute inset-0 z-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" className="h-full w-full opacity-30">
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    <g filter="url(#glow)">
                        <path d="M0,500 Q250,400 500,500 T1000,500" fill="none" stroke="#80ccff" strokeWidth="0.5" opacity="0.6" />
                        <path d="M0,700 Q250,600 500,700 T1000,700" fill="none" stroke="#80ccff" strokeWidth="0.5" opacity="0.4" />
                        <path d="M0,300 Q250,200 500,300 T1000,300" fill="none" stroke="#80ccff" strokeWidth="0.5" opacity="0.4" />
                    </g>

                    <g opacity="0.15">
                        <circle cx="100" cy="100" r="50" fill="#ffffff" />
                        <circle cx="900" cy="900" r="70" fill="#ffffff" />
                        <circle cx="800" cy="200" r="40" fill="#ffffff" />
                        <circle cx="200" cy="800" r="60" fill="#ffffff" />
                    </g>
                </svg>
            </div>

            {/* Content */}
            <header className="relative z-10 flex items-center p-4 sm:p-6">
                <svg className="mr-4 h-7 w-7 sm:h-12 sm:w-10" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="10" height="10" fill="#f25022" />
                    <rect x="12" y="1" width="10" height="10" fill="#7fba00" />
                    <rect x="1" y="12" width="10" height="10" fill="#00a4ef" />
                    <rect x="12" y="12" width="10" height="10" fill="#ffb900" />
                </svg>
                <h1 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl md:text-4xl lg:text-5xl">
                    Microsoft AI Tour
                </h1>
            </header>

            <main className="relative z-10 flex flex-grow flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center">
                    <div onClick={onToggleListening} className="cursor-pointer" role="button" aria-label={isRecording ? "Stop recording" : "Start recording"}>
                        <ConversationCircle isRecording={isRecording} />
                    </div>
                    <p className="mt-4 text-sm text-gray-700">{isRecording ? "Tap to stop conversation" : "Tap to start conversation"}</p>
                </div>
            </main>

            <footer className="relative z-10 py-4 text-center text-gray-700">
                <p>Built with GPT-4o-realtime-preview</p>
            </footer>

            <GroundingFileView groundingFile={selectedFile} onClosed={() => setSelectedFile(null)} />
        </div>
    );
}

export default App;
