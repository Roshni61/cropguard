import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, MessageSquare,
  Send, ShieldCheck, AlertTriangle, CheckCircle2,
  X, FileText, Lock
} from "lucide-react";
import {
  type ConsultationItem,
  type ConsultationMessageItem,
  getConsultationWebSocketURL,
  sendConsultationMessageAPI,
  reviewConsultationByExpertAPI,
  fetchConsultationDetailAPI
} from "../services/api";

interface ConsultationRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultation: ConsultationItem;
  currentUserRole?: "FARMER" | "EXPERT" | "OFFICER" | "SYS_ADMIN";
  currentUserName?: string;
  onConsultationUpdated?: () => void;
}

export const ConsultationRoomModal: React.FC<ConsultationRoomModalProps> = ({
  isOpen,
  onClose,
  consultation: initialConsultation,
  currentUserRole = "FARMER",
  currentUserName = "Farmer",
  onConsultationUpdated,
}) => {
  const [consultation, setConsultation] = useState<ConsultationItem>(initialConsultation);
  const [activeTab, setActiveTab] = useState<"video" | "chat">(
    initialConsultation.consultation_type === "VIDEO" ? "video" : "chat"
  );

  // WebRTC & Media States
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "CONNECTING" | "CONNECTED" | "CALL_ACTIVE" | "DISCONNECTED" | "ERROR"
  >("CONNECTING");
  const [peerJoined, setPeerJoined] = useState(false);

  // Chat & WebSocket states
  const socketRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<ConsultationMessageItem[]>(initialConsultation.messages || []);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Expert Clinical Review Modal State
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [assessmentText, setAssessmentText] = useState(
    initialConsultation.expert_assessment || "Early Blight (Alternaria solani) confirmed visually on foliage."
  );
  const [prescriptionText, setPrescriptionText] = useState(
    initialConsultation.expert_treatment_recommendation ||
    "Apply Indofil M-45 (Mancozeb 75% WP) @ 2.0g/L or Trichoderma viride @ 5g/L. Strictly observe 7-day PHI."
  );
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Load fresh details on mount
  useEffect(() => {
    if (initialConsultation?.id) {
      fetchConsultationDetailAPI(initialConsultation.id).then((fresh) => {
        if (fresh) {
          setConsultation(fresh);
          if (fresh.messages) setMessages(fresh.messages);
        }
      });
    }
  }, [initialConsultation?.id]);

  // Scroll chat to bottom on new message
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  // ============================================================================
  // WEBSOCKET INITIALIZATION & EVENT DISPATCHER
  // ============================================================================
  useEffect(() => {
    if (!isOpen || !consultation.room_id) return;

    const wsUrl = getConsultationWebSocketURL(consultation.room_id);
    let ws: WebSocket;

    try {
      ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus("CONNECTED");
        // Announce readiness to room
        ws.send(JSON.stringify({ type: "webrtc_ready", sender_name: currentUserName }));
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);

          // 1. Chat Message Received
          if (data.type === "chat_message") {
            setMessages((prev) => [
              ...prev,
              {
                id: data.id || `msg-${Date.now()}`,
                sender_id: data.sender_id,
                sender_name: data.sender_name,
                sender_role: data.sender_role,
                message: data.message,
                image_url: data.image_url,
                message_type: data.message_type || "TEXT",
                created_at: data.created_at || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              }
            ]);
          }

          // 2. Peer joined / left notice
          else if (data.type === "peer_joined") {
            setPeerJoined(true);
            // If we are already in the room with a local stream, initiate WebRTC offer
            if (peerConnectionRef.current && localStreamRef.current) {
              initiateWebRTCOffer();
            }
          } else if (data.type === "peer_left") {
            setPeerJoined(false);
          }

          // 3. WebRTC Signaling: Offer
          else if (data.type === "webrtc_offer") {
            handleWebRTCOffer(data.sdp);
          }

          // 4. WebRTC Signaling: Answer
          else if (data.type === "webrtc_answer") {
            handleWebRTCAnswer(data.sdp);
          }

          // 5. WebRTC Signaling: ICE Candidate
          else if (data.type === "webrtc_ice_candidate") {
            handleWebRTCIceCandidate(data.candidate);
          }

          // 6. Agronomist Review Update Notice
          else if (data.type === "expert_review_updated") {
            setConsultation((prev) => ({
              ...prev,
              expert_assessment: data.assessment,
              expert_treatment_recommendation: data.prescription,
              additional_images_requested: data.additional_images_requested,
              additional_images_request_note: data.additional_images_request_note,
              outcome: data.outcome,
              status: data.status || "COMPLETED"
            }));
            if (onConsultationUpdated) onConsultationUpdated();
          }
        } catch (e) {
          console.warn("[WS] Error parsing websocket message:", e);
        }
      };

      ws.onerror = () => {
        setConnectionStatus("ERROR");
      };

      ws.onclose = () => {
        setConnectionStatus("DISCONNECTED");
      };
    } catch (e) {
      console.warn("WebSocket init failed:", e);
      setConnectionStatus("DISCONNECTED");
    }

    return () => {
      if (ws) ws.close();
      socketRef.current = null;
    };
  }, [isOpen, consultation.room_id]);

  // ============================================================================
  // WEBRTC PEER CONNECTION & MEDIA LIFECYCLE
  // ============================================================================
  const createPeerConnection = (): RTCPeerConnection => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" }
      ]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: "webrtc_ice_candidate",
            candidate: event.candidate
          })
        );
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setConnectionStatus("CALL_ACTIVE");
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setConnectionStatus("CALL_ACTIVE");
      } else if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        setMediaError("WebRTC connection interrupted. Switching to Secure Chat.");
        setActiveTab("chat");
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  const startLocalMedia = async () => {
    setMediaError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true
      });
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // If peer is already present, create offer
      if (peerJoined) {
        initiateWebRTCOffer();
      }
    } catch (err: any) {
      console.warn("getUserMedia error:", err);
      let errMsg = "Camera or microphone permission was not granted.";
      if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        errMsg = "No camera or microphone device found on this system.";
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        errMsg = "Camera is currently in use by another application.";
      }
      setMediaError(errMsg);
    }
  };

  const initiateWebRTCOffer = async () => {
    try {
      const pc = peerConnectionRef.current;
      if (!pc) return;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: "webrtc_offer",
            sdp: pc.localDescription
          })
        );
      }
    } catch (e) {
      console.warn("Error creating WebRTC offer:", e);
    }
  };

  const handleWebRTCOffer = async (sdp: RTCSessionDescriptionInit) => {
    try {
      let pc = peerConnectionRef.current;
      if (!pc) {
        pc = createPeerConnection();
      }

      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: "webrtc_answer",
            sdp: pc.localDescription
          })
        );
      }
    } catch (e) {
      console.warn("Error answering WebRTC offer:", e);
    }
  };

  const handleWebRTCAnswer = async (sdp: RTCSessionDescriptionInit) => {
    try {
      const pc = peerConnectionRef.current;
      if (pc && pc.signalingState !== "closed") {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      }
    } catch (e) {
      console.warn("Error setting remote description from answer:", e);
    }
  };

  const handleWebRTCIceCandidate = async (candidate: RTCIceCandidateInit) => {
    try {
      const pc = peerConnectionRef.current;
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (e) {
      console.warn("Error adding ICE candidate:", e);
    }
  };

  // Toggle Mute Audio
  const toggleAudio = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
      setIsAudioMuted(!isAudioMuted);
    }
  };

  // Toggle Camera Video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
      setIsVideoDisabled(!isVideoDisabled);
    }
  };

  // Start media when video tab is selected
  useEffect(() => {
    if (isOpen && activeTab === "video") {
      startLocalMedia();
    }
    return () => {
      // Clean up local stream tracks on unmount or tab switch away from video
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };
  }, [isOpen, activeTab]);

  // ============================================================================
  // CHAT SENDING HANDLER
  // ============================================================================
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputMessage.trim();
    if (!text || isSending) return;

    setIsSending(true);
    setInputMessage("");

    try {
      // 1. Send via WebSocket if open
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: "chat_message",
            consultation_id: consultation.id,
            message: text,
            sender_name: currentUserName,
            sender_role: currentUserRole,
            message_type: "TEXT"
          })
        );
      } else {
        // Fallback to REST API
        await sendConsultationMessageAPI(consultation.id, text);
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            sender_name: currentUserName,
            sender_role: currentUserRole as any,
            message: text,
            message_type: "TEXT",
            created_at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      }
    } catch (err) {
      console.warn("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  // Agronomist Submit Clinical Assessment & Prescription
  const handleRecordPrescription = async () => {
    if (!assessmentText.trim()) return;
    setIsSubmittingReview(true);
    try {
      await reviewConsultationByExpertAPI(consultation.id, {
        expert_assessment: assessmentText.trim(),
        expert_treatment_recommendation: prescriptionText.trim(),
        outcome: "PRESCRIPTION_ISSUED",
        status: "COMPLETED"
      });
      setShowPrescriptionModal(false);
      if (onConsultationUpdated) onConsultationUpdated();
    } catch (err: any) {
      alert(err.message || "Failed to record clinical prescription.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (!isOpen) return null;

  const isExpertUser = currentUserRole === "EXPERT" || currentUserRole === "OFFICER";

  return (
    <div className="fixed inset-0 z-50 bg-forest/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-3xl max-w-5xl w-full h-[92vh] flex flex-col shadow-[var(--shadow-lift)] border border-line overflow-hidden"
      >
        {/* Top Room Banner */}
        <div className="bg-forest px-4 sm:px-6 py-3.5 text-white flex items-center justify-between gap-3 border-b border-forest-2 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-lime border border-white/10">
              {consultation.consultation_type === "VIDEO" ? (
                <Video className="w-5 h-5" />
              ) : (
                <MessageSquare className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base tracking-tight text-white">
                  {isExpertUser ? `Farmer Consultation: ${consultation.farmer_name}` : `Consulting: ${consultation.expert_name || "TNAU Agronomist"}`}
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-lime/20 text-lime border border-lime/30">
                  {consultation.crop} • {consultation.farmer_district}
                </span>
              </div>
              <p className="text-xs text-white/80">
                Slot: <strong>{consultation.scheduled_time}</strong> • Room: <span className="font-mono text-[10px] text-lime/90">{consultation.room_id}</span>
              </p>
            </div>
          </div>

          {/* Right Status & Mode Toggle */}
          <div className="flex items-center gap-2">
            {/* View Switcher Pills */}
            <div className="bg-white/10 p-1 rounded-full flex items-center gap-1 border border-white/15">
              <button
                type="button"
                onClick={() => setActiveTab("video")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "video" ? "bg-lime text-forest shadow-xs" : "text-white/80 hover:text-white"
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Video Call</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("chat")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "chat" ? "bg-lime text-forest shadow-xs" : "text-white/80 hover:text-white"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Chat</span>
                {messages.length > 0 && (
                  <span className="text-[10px] bg-forest text-lime px-1.5 rounded-full">
                    {messages.length}
                  </span>
                )}
              </button>
            </div>

            {/* Close / Leave */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Close Room Window"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prescription / Clinical Review Summary Banner if Issued */}
        {consultation.expert_assessment && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2 text-emerald-950 truncate">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="truncate">
                <strong>Certified Clinical Assessment:</strong> {consultation.expert_assessment}
              </span>
            </div>
            {consultation.expert_treatment_recommendation && (
              <span className="text-[10px] bg-emerald-200 text-emerald-950 font-black px-2 py-0.5 rounded shrink-0 uppercase">
                Prescription Issued
              </span>
            )}
          </div>
        )}

        {/* Main Body Split: Video Call vs Persistent Chat */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3">
          {/* LEFT 2 COLS: VIDEO / LEAF INSPECTION PANE */}
          <div className={`lg:col-span-2 bg-paper flex flex-col justify-between overflow-hidden border-r border-line ${
            activeTab === "chat" ? "hidden lg:flex" : "flex"
          }`}>
            {/* Video Viewport Area */}
            <div className="flex-1 relative bg-forest-2 flex items-center justify-center p-3 overflow-hidden">
              {/* Media Access Denied Fallback Notice */}
              {mediaError ? (
                <div className="max-w-md mx-auto p-6 bg-white rounded-3xl border border-line text-center space-y-4 shadow-[var(--shadow-soft)]">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-forest">Camera Access Unavailable</h4>
                    <p className="text-xs text-ink-2 leading-relaxed">{mediaError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("chat")}
                    className="w-full py-2.5 bg-forest hover:bg-forest-hover text-cream font-bold text-xs rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 text-lime" />
                    <span>Continue via Secure Real-Time Chat</span>
                  </button>
                </div>
              ) : (
                <div className="w-full h-full relative rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                  {/* Remote Video Stream (Main Screen) */}
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />

                  {/* Remote Stream Standby Poster when Peer Not Connected */}
                  {connectionStatus !== "CALL_ACTIVE" && (
                    <div className="absolute inset-0 bg-forest/90 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
                      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                        <Video className="w-8 h-8 text-lime animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-black text-base">
                          {isExpertUser ? `Waiting for Farmer ${consultation.farmer_name}` : `Waiting for Agronomist ${consultation.expert_name || "Dr. S. Lakshmi"}`}
                        </h4>
                        <p className="text-xs text-white/80 max-w-sm">
                          WebRTC peer connection standby. Room ID: <span className="font-mono text-lime">{consultation.room_id}</span>
                        </p>
                      </div>

                      {/* Shared Leaf Image Quick Card */}
                      {consultation.shared_image_url && (
                        <div className="mt-2 p-2 bg-white/10 rounded-2xl border border-white/20 flex items-center gap-2 text-left max-w-xs">
                          <img
                            src={consultation.shared_image_url}
                            alt="Shared leaf"
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                          <div className="text-[11px] leading-tight">
                            <span className="font-bold text-lime block">Foliar Specimen</span>
                            <span className="text-white/80">{consultation.crop} • {consultation.problem_description.slice(0, 40)}...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Local Self-View (Picture-in-Picture) */}
                  <div className="absolute bottom-4 right-4 w-32 sm:w-44 aspect-video rounded-xl overflow-hidden shadow-2xl border-2 border-white/40 bg-zinc-900 z-10">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    <span className="absolute bottom-1 left-2 text-[9px] font-bold text-white/90 bg-black/60 px-1.5 py-0.2 rounded backdrop-blur-xs">
                      You ({currentUserName})
                    </span>
                  </div>

                  {/* Top Overlay Badge */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-black/60 text-white px-3 py-1 rounded-full backdrop-blur-xs border border-white/15">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{connectionStatus === "CALL_ACTIVE" ? "P2P WebRTC Connected" : "Connecting..."}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Video Control Bar */}
            <div className="p-4 bg-white border-t border-line flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleAudio}
                  className={`p-3 rounded-full border transition cursor-pointer ${
                    isAudioMuted
                      ? "bg-red-100 text-red-700 border-red-300"
                      : "bg-paper hover:bg-cream-card text-forest border-line"
                  }`}
                  title={isAudioMuted ? "Unmute Microphone" : "Mute Microphone"}
                >
                  {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={toggleVideo}
                  className={`p-3 rounded-full border transition cursor-pointer ${
                    isVideoDisabled
                      ? "bg-red-100 text-red-700 border-red-300"
                      : "bg-paper hover:bg-cream-card text-forest border-line"
                  }`}
                  title={isVideoDisabled ? "Enable Camera" : "Disable Camera"}
                >
                  {isVideoDisabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              </div>

              {/* Middle Expert Action Buttons */}
              {isExpertUser && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPrescriptionModal(true)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-lime" />
                    <span>Issue Prescription</span>
                  </button>
                </div>
              )}

              {/* Right Hangup Action */}
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-full shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Leave Call</span>
              </button>
            </div>
          </div>

          {/* RIGHT 1 COL: REAL-TIME CHAT & PHOTO EVIDENCE */}
          <div className={`lg:col-span-1 bg-white flex flex-col justify-between overflow-hidden ${
            activeTab === "video" ? "hidden lg:flex" : "flex"
          }`}>
            {/* Chat Pane Header */}
            <div className="p-3.5 bg-paper border-b border-line flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-forest" />
                <h4 className="font-bold text-xs text-forest uppercase tracking-wider">
                  Consultation Messages
                </h4>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] text-ink-3">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>Encrypted</span>
              </span>
            </div>

            {/* Messages Feed */}
            <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-paper/50">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-xs text-ink-3 space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto text-ink-3" />
                  <p>No messages yet.</p>
                  <p className="text-[11px]">Send a greeting or ask a question about your crop.</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.sender_name === currentUserName;
                  const isSystem = m.sender_role === "SYSTEM" || m.message_type === "SYSTEM";

                  if (isSystem) {
                    return (
                      <div key={m.id} className="text-center my-2">
                        <span className="inline-block text-[10px] font-bold text-forest bg-forest/10 px-3 py-1 rounded-full border border-forest/15">
                          ℹ️ {m.message}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-ink-3 mb-1 px-1">
                        <span className="font-bold text-forest">{m.sender_name}</span>
                        <span className={`px-1.5 rounded uppercase font-black text-[9px] ${
                          m.sender_role === "EXPERT" ? "bg-purple-100 text-purple-900" : "bg-emerald-100 text-emerald-900"
                        }`}>
                          {m.sender_role}
                        </span>
                        <span>• {m.created_at}</span>
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed space-y-2 ${
                          isMe
                            ? "bg-forest text-cream rounded-tr-xs"
                            : "bg-white text-ink border border-line shadow-2xs rounded-tl-xs"
                        }`}
                      >
                        {/* Attached Image if present */}
                        {m.image_url && (
                          <div className="rounded-xl overflow-hidden border border-white/20 bg-black">
                            <img
                              src={m.image_url}
                              alt="Crop attachment"
                              className="w-full max-h-48 object-cover cursor-pointer hover:opacity-95"
                              onClick={() => window.open(m.image_url, "_blank")}
                            />
                          </div>
                        )}

                        <p className="whitespace-pre-wrap">{m.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Composer */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-white border-t border-line flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your question or observation..."
                className="flex-1 bg-paper border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink placeholder:text-ink-3 focus:outline-none focus:border-forest"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isSending}
                className="p-2.5 bg-forest hover:bg-forest-hover text-lime rounded-xl transition cursor-pointer disabled:opacity-50"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* CLINICAL PRESCRIPTION MODAL (EXPERT ONLY) */}
        {showPrescriptionModal && (
          <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-line">
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-forest" />
                  <h4 className="font-black text-sm text-forest">
                    Issue Verified Clinical Prescription
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPrescriptionModal(false)}
                  className="text-ink-3 hover:text-ink cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-forest">Clinical Assessment & Pathogen Confirmation:</label>
                  <textarea
                    rows={2}
                    value={assessmentText}
                    onChange={(e) => setAssessmentText(e.target.value)}
                    className="w-full bg-paper border border-line rounded-xl p-2.5 text-ink outline-none focus:border-forest"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-forest">Prescription, Dosage & Safe Pre-Harvest Interval (PHI):</label>
                  <textarea
                    rows={3}
                    value={prescriptionText}
                    onChange={(e) => setPrescriptionText(e.target.value)}
                    className="w-full bg-paper border border-line rounded-xl p-2.5 text-ink outline-none focus:border-forest"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowPrescriptionModal(false)}
                  className="px-4 py-2 bg-paper text-ink rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRecordPrescription}
                  disabled={isSubmittingReview}
                  className="px-5 py-2 bg-forest hover:bg-forest-hover text-cream rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-lime" />
                  <span>Transmit Prescription</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
