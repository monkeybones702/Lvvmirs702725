import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Mic,
  Square,
  Play,
  Pause,
  Sparkles,
  Send,
  Bookmark,
  Volume2,
  RefreshCw,
  MapPin,
  Tag,
  AlertTriangle,
  FileAudio
} from "lucide-react";
import { VoiceMemo, SocialPost, UserLocationSettings, PostCategory, UrgencyLevel } from "../types";

interface VoiceMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationSettings: UserLocationSettings;
  onPublishAsPost: (newPost: SocialPost) => void;
  onSaveVoiceMemo: (memo: VoiceMemo) => void;
}

export const VoiceMemoModal: React.FC<VoiceMemoModalProps> = ({
  isOpen,
  onClose,
  locationSettings,
  onPublishAsPost,
  onSaveVoiceMemo
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [structuredData, setStructuredData] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Quick-test samples for instant testing
  const SAMPLE_MEMOS = [
    {
      label: "🐕 Lost Pet in Summerlin",
      text: "I am walking near Desert Foothills and Alta in Summerlin West. I just spotted a golden retriever with a red collar running toward the park path without an owner. Heading south toward the playground."
    },
    {
      label: "🛑 I-15 Freeway Hazard",
      text: "Warning for drivers on I-15 northbound right before the Sahara exit. There is a shredded truck tire and aluminum ladder blocking the second right lane. Traffic is braking hard."
    },
    {
      label: "🚨 Suspicious Activity",
      text: "Suspicious silver sedan parked with engine idling in the alleyway behind Charleston and Hualapai for the past 45 minutes, two individuals checking side gates with flashlights."
    }
  ];

  // Visualizer loop
  useEffect(() => {
    if (!isRecording || !canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = `rgb(245, 158, 11)`; // Amber
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    setErrorMessage(null);
    setAudioBlobUrl(null);
    setStructuredData(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Setup audio analyser for visualizer
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlobUrl(url);

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Attempt Web Speech Recognition in background for real-time transcript
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          const rec = new SpeechRec();
          rec.continuous = true;
          rec.interimResults = true;
          rec.onresult = (e: any) => {
            let current = "";
            for (let i = 0; i < e.results.length; i++) {
              current += e.results[i][0].transcript + " ";
            }
            setTranscript(current.trim());
          };
          rec.start();
        } catch {
          // ignore speech recognition failures
        }
      }
    } catch (err: any) {
      console.error("Microphone access error:", err);
      setErrorMessage("Microphone access unavailable or denied. You can still test with a sample voice note below.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleTranscribeWithGemini = async (textToProcess?: string) => {
    const rawText = textToProcess || transcript;
    if (!rawText.trim()) {
      setErrorMessage("Please speak into the mic or enter notes before analyzing.");
      return;
    }

    setIsAiProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/voice-memo/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawTranscript: rawText,
          locationHint: locationSettings.name,
          authorNeighborhood: locationSettings.name.split(" ")[0]
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setStructuredData(data.data);
      }
    } catch (err) {
      console.error("Voice memo AI error:", err);
      setErrorMessage("Failed to synthesize voice memo. Please retry.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleApplySample = (text: string) => {
    setTranscript(text);
    handleTranscribeWithGemini(text);
  };

  const handlePublishPost = () => {
    if (!structuredData) return;

    const newPost: SocialPost = {
      id: `voice-post-${Date.now()}`,
      platform: "Nextdoor",
      category: structuredData.category || "safety",
      urgency: structuredData.urgency || "normal",
      title: `[Voice Log] ${structuredData.title}`,
      content: structuredData.cleanedSummary || transcript,
      author: {
        name: "Voice Field Dispatch",
        neighborhood: structuredData.suggestedNeighborhood || locationSettings.name,
        isVerifiedNeighbor: true,
        badge: "Voice Witness"
      },
      neighborhood: structuredData.suggestedNeighborhood || locationSettings.name,
      coordinates: locationSettings.coordinates,
      addressSnippet: structuredData.addressSnippet || locationSettings.name,
      timestamp: new Date().toISOString(),
      keywords: structuredData.keywords || ["voice-memo", "resident-log"],
      engagement: {
        upvotes: 1,
        commentsCount: 0,
        shares: 0,
        helpfulVotes: 1
      },
      comments: []
    };

    onPublishAsPost(newPost);
    onClose();
  };

  const handleSaveMemoOnly = () => {
    const memo: VoiceMemo = {
      id: `memo-${Date.now()}`,
      timestamp: new Date().toISOString(),
      durationSec: recordingTime || 15,
      audioBlobUrl: audioBlobUrl || undefined,
      transcript: transcript || "Resident voice memo",
      extractedDetails: structuredData || {
        title: "Field Voice Note",
        category: "general",
        urgency: "normal",
        suggestedNeighborhood: locationSettings.name,
        keywords: ["voice-log"]
      }
    };

    onSaveVoiceMemo(memo);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs">
      <div
        id="modal-voice-memo"
        className="bg-white text-stone-900 rounded-2xl max-w-xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Resident Voice Memo Logging
              </h2>
              <p className="text-xs text-stone-500">
                Dictate hands-free incident observations, lost pet reports, or road hazards
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs text-stone-700">
          {/* Recorder Station */}
          <div className="p-6 rounded-2xl bg-stone-900 text-white text-center space-y-4 shadow-inner">
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                  isRecording
                    ? "bg-red-600 hover:bg-red-500 animate-pulse text-white"
                    : "bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold"
                }`}
              >
                {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-9 h-9" />}
              </button>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-bold tracking-wider uppercase font-mono">
                {isRecording ? `Recording... (${recordingTime}s)` : "Tap Mic To Record Audio"}
              </div>
              <p className="text-[11px] text-stone-400">
                {isRecording
                  ? "Speak clearly. Describe cross-streets, hazards, or incident description."
                  : "Audio is analyzed using Gemini to auto-extract location, category, and urgency."}
              </p>
            </div>

            {/* Audio Waveform Canvas */}
            <canvas
              ref={canvasRef}
              width={320}
              height={40}
              className="w-full max-w-xs mx-auto h-10 rounded-lg bg-stone-950/80 border border-stone-800"
            />

            {/* Playback player if recorded */}
            {audioBlobUrl && (
              <div className="pt-2 flex items-center justify-center gap-3">
                <audio ref={audioPlayerRef} src={audioBlobUrl} controls className="h-8 max-w-xs" />
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick-Sample Observations */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Or test with a sample voice observation:
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {SAMPLE_MEMOS.map((samp, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplySample(samp.text)}
                  className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-amber-50 hover:border-amber-300 text-stone-800 text-[11px] font-medium transition-colors"
                >
                  {samp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Spoken Transcript Input & AI Trigger */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-800 text-xs">
                Voice Memo Transcript:
              </label>
              {transcript && (
                <button
                  type="button"
                  onClick={() => handleTranscribeWithGemini()}
                  disabled={isAiProcessing}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-900"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Structure with Gemini AI</span>
                </button>
              )}
            </div>

            <textarea
              rows={3}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Dictated voice text will appear here automatically, or type observation notes..."
              className="w-full p-3 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* AI Structured Incident Card if generated */}
          {structuredData && (
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>AI Structured Field Dispatch</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    structuredData.urgency === "urgent"
                      ? "bg-red-100 text-red-800"
                      : structuredData.urgency === "elevated"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {structuredData.urgency} Urgency
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-stone-900 text-sm">{structuredData.title}</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {structuredData.cleanedSummary}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-[11px] text-stone-600">
                <span className="inline-flex items-center gap-1 font-semibold text-stone-800">
                  <MapPin className="w-3 h-3 text-amber-600" />
                  {structuredData.suggestedNeighborhood}
                </span>
                {structuredData.addressSnippet && (
                  <span>({structuredData.addressSnippet})</span>
                )}
                <span>•</span>
                <span className="capitalize font-medium">
                  Category: {structuredData.category}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveMemoOnly}
              disabled={!transcript.trim()}
              className="px-3.5 py-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Bookmark className="w-3.5 h-3.5 text-stone-600" />
              <span>Save Voice Memo</span>
            </button>

            <button
              type="button"
              onClick={handlePublishPost}
              disabled={!structuredData}
              className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span>Publish Alert to Feed</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
