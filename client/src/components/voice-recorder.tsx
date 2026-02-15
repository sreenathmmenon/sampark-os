import { useState, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface VoiceRecorderProps {
  onCommand: (command: {
    species?: string;
    weight_kg?: number;
    deadline?: string;
    action: string;
  }) => void;
  language?: "ml-IN" | "hi-IN" | "kn-IN";
}

export function VoiceRecorder({ onCommand, language = "ml-IN" }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await processAudio(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setError(null);
      setTranscription(null);
    } catch (err: any) {
      setError("Microphone access denied. Please enable microphone permissions.");
      console.error("Microphone error:", err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const processAudio = useCallback(
    async (audioBlob: Blob) => {
      setIsProcessing(true);
      setError(null);

      try {
        // Convert to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const base64 = (reader.result as string).split(",")[1];
            resolve(base64);
          };
          reader.onerror = reject;
        });

        reader.readAsDataURL(audioBlob);
        const audioBase64 = await base64Promise;

        // Send to server for transcription
        const res = await apiRequest("POST", "/api/voice/transcribe", {
          audio: audioBase64,
          language,
        });

        const data = await res.json();
        setTranscription(data.text);

        // Parse command and notify parent
        if (data.command) {
          onCommand(data.command);
        }
      } catch (err: any) {
        setError(err.message || "Failed to process voice command");
        console.error("Voice processing error:", err);
      } finally {
        setIsProcessing(false);
      }
    },
    [language, onCommand]
  );

  const languageLabel = {
    "ml-IN": "മലയാളം (Malayalam)",
    "hi-IN": "हिन्दी (Hindi)",
    "kn-IN": "ಕನ್ನಡ (Kannada)",
  }[language];

  return (
    <div className="rounded-xl bg-[#1e293b]/60 backdrop-blur-sm border border-[#334155]/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#e2e8f0] tracking-wide">VOICE COMMAND</h3>
          <p className="text-xs text-[#64748b] mt-0.5">{languageLabel}</p>
        </div>
        <Volume2 className="w-5 h-5 text-[#00d4ff]" />
      </div>

      <div className="flex flex-col items-center gap-4">
        {/* Recording Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
            isRecording
              ? "bg-[#ff3b5c] animate-pulse"
              : "bg-[#00d4ff] hover:bg-[#00d4ff]/80"
          } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isProcessing ? (
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-10 h-10 text-white" />
          ) : (
            <Mic className="w-10 h-10 text-white" />
          )}
        </button>

        {/* Status Text */}
        <div className="text-center">
          {isRecording && (
            <p className="text-sm font-medium text-[#ff3b5c] animate-pulse">
              🎤 Recording... Tap to stop
            </p>
          )}
          {isProcessing && (
            <p className="text-sm font-medium text-[#ffb800]">Processing voice command...</p>
          )}
          {!isRecording && !isProcessing && !transcription && (
            <p className="text-sm text-[#64748b]">
              Tap to speak: "40kg Karimeen, dock before 3PM"
            </p>
          )}
        </div>

        {/* Transcription Display */}
        {transcription && (
          <div className="w-full p-3 rounded-lg bg-[#0f172a]/60 border border-[#334155]/30">
            <p className="text-xs font-mono text-[#94a3b8] mb-1">TRANSCRIPTION:</p>
            <p className="text-sm text-[#e2e8f0]">{transcription}</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="w-full p-3 rounded-lg bg-[#ff3b5c]/10 border border-[#ff3b5c]/30">
            <p className="text-xs font-mono text-[#ff3b5c] mb-1">ERROR:</p>
            <p className="text-sm text-[#e2e8f0]">{error}</p>
          </div>
        )}
      </div>

      {/* Example Commands */}
      <div className="mt-4 pt-4 border-t border-[#334155]/30">
        <p className="text-[10px] font-mono tracking-wider text-[#94a3b8] mb-2">EXAMPLE COMMANDS:</p>
        <div className="space-y-1 text-xs text-[#64748b]">
          <p>• "നാല്പത് കിലോ കരിമീൻ. മൂന്ന് മണി മുമ്പ് എത്താണം."</p>
          <p className="text-[10px] text-[#475569] ml-3">(40kg Karimeen, dock before 3PM)</p>
          <p>• "ഇരുപത്തഞ്ച് കിലോ ചൂര. ഓക്ഷൻ തുടങ്ങുക."</p>
          <p className="text-[10px] text-[#475569] ml-3">(25kg Seer fish, start auction)</p>
        </div>
      </div>
    </div>
  );
}
