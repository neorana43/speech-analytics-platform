// src\pages\Transcription\TranscriptionTraining.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Play,
  Pause,
  SquarePen,
  Trash2,
  Save,
} from "lucide-react";
import { Button, Card, Input, Spinner, Tooltip, addToast } from "@heroui/react";
import clsx from "clsx";

import { ApiService } from "@/lib/api";
import { useAuth } from "@/auth/AuthContext";
import { baseUrl } from "@/lib/config";

interface Segment {
  segment_id: number;
  start_time: number;
  end_time: number;
  start_time_text: string;
  end_time_text: string;
  text: string;
  who: string;
  who_type: "AGENT" | "CUSTOMER" | "PAUSE";
  flagged: boolean;
}

interface Correction {
  id: number;
  original_text: string;
  corrected_text: string;
}

interface AudioDetails {
  interaction_id: string;
  interaction_date: string;
  duration: string;
  customer: string;
  agent: string;
  audio_file_uri: string;
  file_id?: number;
  segments: Segment[];
  corrections: Correction[];
  word_count: number;
}

const TranscriptionTraining = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const interactionId = Number(searchParams.get("interaction_id"));
  const clientId = Number(id);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [data, setData] = useState<AudioDetails | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [audioProgress, setAudioProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [highlightedText, setHighlightedText] = useState("");
  const [correctedText, setCorrectedText] = useState("");
  const [correctionId, setCorrectionId] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [audioDuration, setAudioDuration] = useState(0);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [isSavingAccuracy, setIsSavingAccuracy] = useState(false);

  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const extractFileIdFromUri = (uri: string): number | null => {
    const match = uri.match(/\/(\d+)_/);

    return match ? parseInt(match[1], 10) : null;
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleTextSelection = (seg: Segment) => {
    const selection = window.getSelection();

    if (!selection) return;
    const selectedText = selection.toString();

    if (selectedText && seg.text.includes(selectedText)) {
      setHighlightedText(selectedText);
      setCorrectionId(0);
      setCorrectedText("");
    }
  };

  useEffect(() => {
    if (!token || !clientId || !interactionId) return;

    const api = ApiService(token);

    setIsLoading(true);

    const fetchAudioDetails = async () => {
      try {
        const details = await api.getAudioDetails(clientId, interactionId);

        // Ensure corrections array exists
        const detailsWithCorrections = {
          ...details,
          corrections: details.corrections || [],
        };

        setData(detailsWithCorrections);

        const fileId =
          details?.file_id || extractFileIdFromUri(details.audio_file_uri);

        if (fileId) {
          const tokenString = await api.getAudioToken(fileId);

          if (tokenString) {
            const secureUrl = `${baseUrl}/api/Audio/audiocontent/${tokenString}`;

            setAudioUrl(secureUrl);
          } else {
            console.warn("⚠️ audio token is undefined for fileId:", fileId);
          }
        } else {
          console.warn("⚠️ No fileId found in details.");
        }
      } catch (err) {
        console.error("❌ Error fetching audio URL:", err);
        addToast({
          title: "Error",
          description: "Failed to fetch audio details. Please try again.",
          color: "danger",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAudioDetails();
  }, [token, clientId, interactionId]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;
    const setDuration = () => setAudioDuration(audio.duration || 0);

    audio.addEventListener("loadedmetadata", setDuration);
    setDuration();

    return () => audio.removeEventListener("loadedmetadata", setDuration);
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioUrl]);

  const playSegment = (start: number, end: number) => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.currentTime = start;
    audio.play();

    const stopAt = () => {
      if (audio.currentTime >= end) {
        audio.pause();
        audio.removeEventListener("timeupdate", stopAt);
      }
    };

    audio.addEventListener("timeupdate", stopAt);
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;

    if (!audio) return;
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("❌ Failed to copy:", err);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);

    return d.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEditCorrection = async (correction: Correction) => {
    setHighlightedText(correction.original_text);
    setCorrectionId(correction.id);
    setCorrectedText(correction.corrected_text);
  };

  const handleSaveCorrection = async (correction: Correction) => {
    try {
      const api = ApiService(token!);

      await api.saveCorrection({
        id: correction.id,
        client_id: clientId,
        interaction_id: interactionId,
        original_text: correction.original_text,
        corrected_text: correction.corrected_text,
      });

      setData((prev) =>
        prev
          ? {
              ...prev,
              corrections:
                correction.id === 0
                  ? [
                      ...prev.corrections,
                      {
                        ...correction,

                        id: Math.floor(Math.random() * 1000000),
                      },
                    ]
                  : prev.corrections.map((item) =>
                      item.id === correction.id
                        ? { ...item, ...correction }
                        : item,
                    ),
            }
          : prev,
      );

      addToast({
        title: "Correction saved",
        description: "Your correction has been saved successfully.",
        color: "success",
      });
    } catch (err) {
      addToast({
        title: "Save failed",
        description: "An error occurred while saving the correction.",
        color: "danger",
      });
    }
  };

  const handleDeleteCorrection = async (correctionId: number) => {
    try {
      const api = ApiService(token!);

      await api.deleteCorrection(correctionId);

      // Immediately update the local state
      setData((prev) =>
        prev
          ? {
              ...prev,
              corrections: prev.corrections.filter(
                (item) => item.id !== correctionId,
              ),
            }
          : null,
      );

      addToast({
        title: "Correction deleted",
        description: "The correction was deleted successfully.",
        color: "success",
      });
    } catch (err) {
      console.error("❌ Failed to delete correction:", err);
      addToast({
        title: "Delete failed",
        description: "An error occurred while deleting the correction.",
        color: "danger",
      });
    }
  };

  const handleSubmitCorrection = () => {
    if (!highlightedText.trim() || !correctedText.trim()) {
      addToast({
        title: "Missing fields",
        description: "Please select and correct some text before submitting.",
        color: "warning",
      });

      return;
    }

    const newCorrection = {
      id: correctionId,
      original_text: highlightedText,
      corrected_text: correctedText,
    };

    handleSaveCorrection(newCorrection);

    setHighlightedText("");
    setCorrectedText("");
  };

  const highlightCorrection = (text: string, corrections: Correction[]) => {
    if (!corrections || corrections.length === 0) return text;

    const sorted = [...corrections]
      .filter((c) => c.original_text)
      .sort((a, b) => b.original_text.length - a.original_text.length);

    let parts: (string | JSX.Element)[] = [text];

    sorted.forEach((correction) => {
      const newParts: (string | JSX.Element)[] = [];
      const pattern = new RegExp(
        `(${correction.original_text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi",
      );

      parts.forEach((part) => {
        if (typeof part === "string") {
          let lastIndex = 0;
          let match: RegExpExecArray | null;

          while ((match = pattern.exec(part)) !== null) {
            if (match!.index > lastIndex) {
              newParts.push(part.slice(lastIndex, match!.index));
            }

            newParts.push(
              <mark
                key={Math.random()}
                className="bg-yellow-200 text-gray-800 rounded px-1 inline-flex items-center gap-0.5"
              >
                <del className="text-red-500">{match![0]}</del>
                <span className="text-green-500 font-bold">
                  {
                    corrections.find(
                      (c) =>
                        c.original_text &&
                        c.original_text.toLowerCase() ===
                          match![0].toLowerCase(),
                    )?.corrected_text
                  }
                </span>
              </mark>,
            );
            lastIndex = match!.index + match![0].length;
          }

          if (lastIndex < part.length) {
            newParts.push(part.slice(lastIndex));
          }
        } else {
          newParts.push(part);
        }
      });
      parts = newParts;
    });

    return <>{parts}</>;
  };

  const getTotalCorrectedWords = () => {
    if (!data) return 0;

    let count = 0;

    data.segments.forEach((seg) => {
      if (!seg.text) return;
      data.corrections.forEach((correction) => {
        if (!correction.original_text) return;
        // Create a global, case-insensitive regex for all occurrences
        const pattern = new RegExp(
          correction.original_text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "gi",
        );
        const matches = seg.text.match(pattern);

        if (matches) {
          count += matches.length;
        }
      });
    });

    return count;
  };

  const handleFlagSegment = async (segmentId: number) => {
    if (!data) return;

    try {
      const api = ApiService(token!);
      const segment = data.segments.find((seg) => seg.segment_id === segmentId);

      if (!segment) return;

      await api.flagSegment(segmentId, !segment.flagged);

      // Update local state
      setData((prev) => {
        if (!prev) return null;

        return {
          ...prev,
          segments: prev.segments.map((seg) =>
            seg.segment_id === segmentId
              ? { ...seg, flagged: !seg.flagged }
              : seg,
          ),
        };
      });

      addToast({
        title: !segment.flagged ? "Segment flagged" : "Flag removed",
        description: !segment.flagged
          ? "The segment has been flagged successfully."
          : "The flag has been removed from the segment.",
        color: "success",
      });
    } catch (err) {
      console.error("❌ Failed to flag segment:", err);
      addToast({
        title: "Flag failed",
        description: "An error occurred while updating the flag.",
        color: "danger",
      });
    }
  };

  const handleSaveAccuracy = async () => {
    if (!data || !interactionId) return;

    try {
      setIsSavingAccuracy(true);
      const api = ApiService(token!);

      const response = await api.saveAccuracy({
        interaction_id: interactionId,
        correction_word_count: getTotalCorrectedWords(),
      });

      console.log("✅ Saved accuracy response:", response);

      addToast({
        title: "Success",
        description: "Accuracy data has been saved successfully.",
        color: "success",
      });
    } catch (err) {
      console.error("❌ Failed to save accuracy:", err);
      addToast({
        title: "Error",
        description: "Failed to save accuracy data. Please try again.",
        color: "danger",
      });
    } finally {
      setIsSavingAccuracy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 flex-1">
      <div className="flex items-center gap-4">
        <Button
          className="text-midnight p-0"
          size="sm"
          variant="light"
          onPress={() => navigate(`/transcription/${id}`)}
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </Button>
        <h2 className="page-title text-primary">Transcription Training</h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[400px]">
          <Spinner color="primary" size="lg" />
        </div>
      ) : data ? (
        <>
          <Card className="p-6 flex flex-col gap-4">
            <div className="flex justify-between text-sm text-midnight font-roboto font-semibold">
              <div>
                {data.agent} on {formatDate(data.interaction_date)} for{" "}
                {data.duration} min
              </div>

              <div className="flex gap-1 items-center font-normal text-xs">
                Call ID:{" "}
                <span className="font-mono">{data.interaction_id}</span>
                <Tooltip content={copied ? "Copied!" : "Copy to clipboard"}>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => handleCopy(data.interaction_id)}
                  >
                    <Copy className="w-4 h-4 text-primary" />
                  </Button>
                </Tooltip>
              </div>
            </div>
            <div className="bg-gray-100 rounded-md p-4 flex flex-col justify-end text-sm text-gray-500 relative overflow-visible">
              <div className="relative w-full flex items-center flex-col bg-gray-100 rounded-md z-50">
                <audio
                  ref={audioRef}
                  controls
                  className="invisible absolute top-0 left-0"
                >
                  <track default kind="captions" label="English" srcLang="en" />
                  {audioUrl ? (
                    <source src={audioUrl} type="audio/wav" />
                  ) : (
                    <p>Your browser does not support the audio element.</p>
                  )}
                </audio>
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-end gap-2 w-full h-12">
                    <div className="text-end text-sky-500 font-extrabold w-36">
                      Agent
                    </div>
                    <div
                      aria-label="agent transcript"
                      className="relative border-b-1 border-b-foreground-300 flex-1 h-6 bg-transparent"
                    >
                      {data.segments
                        .filter((seg) => seg.who_type === "AGENT")
                        .map((seg) => {
                          return (
                            <React.Fragment key={seg.segment_id}>
                              <div
                                className="absolute bg-sky-200 rounded"
                                style={{
                                  left: `${(seg.start_time / (audioDuration || 1)) * 100}%`,
                                  width: `${((seg.end_time - seg.start_time) / (audioDuration || 1)) * 100}%`,
                                  height: "100%",
                                  top: 0,
                                }}
                                title={seg.text}
                              />
                            </React.Fragment>
                          );
                        })}
                    </div>
                  </div>
                  <div className="flex items-end gap-2 w-full h-12">
                    <div className="text-end text-red-500 font-extrabold w-36" />
                    <div
                      aria-label="silence / pause part"
                      className="relative border-b-1 border-b-foreground-300 flex-1 h-6 bg-transparent"
                    >
                      {data.segments
                        .filter((seg) => seg.who_type === "PAUSE")
                        .map((seg) => {
                          return (
                            <React.Fragment key={seg.segment_id}>
                              <div
                                className="absolute bg-red-200 rounded"
                                style={{
                                  left: `${(seg.start_time / (audioDuration || 1)) * 100}%`,
                                  width: `${((seg.end_time - seg.start_time) / (audioDuration || 1)) * 100}%`,
                                  height: "100%",
                                  top: 0,
                                }}
                                title={seg.text}
                              />
                            </React.Fragment>
                          );
                        })}
                    </div>
                  </div>
                  <div className="flex items-end gap-2 w-full h-12">
                    <div className="text-end text-green-500 font-extrabold w-36">
                      Customer
                    </div>
                    <div
                      aria-label="customer transcript"
                      className="relative border-b-1 border-b-foreground-300 flex-1 h-6 bg-transparent"
                    >
                      {data.segments
                        .filter((seg) => seg.who_type === "CUSTOMER")
                        .map((seg) => {
                          return (
                            <React.Fragment key={seg.segment_id}>
                              <div
                                className="absolute bg-green-200 rounded"
                                style={{
                                  left: `${(seg.start_time / (audioDuration || 1)) * 100}%`,
                                  width: `${((seg.end_time - seg.start_time) / (audioDuration || 1)) * 100}%`,
                                  height: "100%",
                                  top: 0,
                                }}
                                title={seg.text}
                              />
                            </React.Fragment>
                          );
                        })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <Button
                    isIconOnly
                    aria-label={isPlaying ? "Pause" : "Play"}
                    color="primary"
                    radius="full"
                    type="button"
                    onPress={handlePlayPause}
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6" />
                    )}
                  </Button>

                  <div className="text-midnight font-medium min-w-24 text-center">
                    {formatTime(currentTime)} / {data.duration}
                  </div>

                  <div
                    ref={progressBarRef}
                    className="relative flex-1 flex h-2 items-center"
                  >
                    <div
                      aria-label="Audio progress"
                      aria-valuemax={100}
                      aria-valuemin={0}
                      aria-valuenow={audioProgress}
                      className="w-full h-full bg-gray-200 rounded-full overflow-hidden"
                      role="slider"
                      tabIndex={0}
                      onClick={(e) => {
                        if (audioRef.current) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const clickPosition = e.clientX - rect.left;
                          const percentage = (clickPosition / rect.width) * 100;
                          const newTime =
                            (percentage / 100) * audioRef.current.duration;

                          audioRef.current.currentTime = newTime;
                          setCurrentTime(newTime);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (audioRef.current) {
                          const step = 5; // 5% step
                          let newProgress = audioProgress;

                          if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                            newProgress = Math.min(100, audioProgress + step);
                          } else if (
                            e.key === "ArrowLeft" ||
                            e.key === "ArrowDown"
                          ) {
                            newProgress = Math.max(0, audioProgress - step);
                          }

                          const newTime =
                            (newProgress / 100) * audioRef.current.duration;

                          audioRef.current.currentTime = newTime;
                          setCurrentTime(newTime);
                        }
                      }}
                    >
                      <div
                        className="h-full bg-foreground-500 transition-all duration-100"
                        style={{ width: `${audioProgress}%` }}
                      />
                    </div>
                    <div
                      aria-label="Player marker"
                      className="absolute bg-foreground-500 -top-[152px] h-40 w-[2px] pointer-events-none transition-transform"
                      style={{
                        left: `${audioProgress}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="px-4 py-6 flex flex-col gap-4 h-[26.125rem]">
              <div className="overflow-y-auto space-y-5">
                {data.segments.map((seg) => (
                  <div
                    key={seg.segment_id}
                    className="text-sm flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-light-midnight font-bold">
                        {seg.start_time_text} min {seg.who || "[Pause]"}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          isIconOnly
                          aria-label="Flag"
                          className={clsx(
                            "bg-transparent p-0 h-auto w-auto min-w-fit ",
                            seg.flagged ? "text-primary" : "text-midnight",
                          )}
                          radius="none"
                          size="sm"
                          onPress={() => handleFlagSegment(seg.segment_id)}
                        >
                          <img
                            alt="Flag"
                            height={14}
                            src={
                              seg.flagged
                                ? "/icon-flag-filled.svg"
                                : "/icon-flag.svg"
                            }
                            width={14}
                          />
                        </Button>
                        <Button
                          isIconOnly
                          aria-label="Play"
                          className="bg-transparent px-1 h-auto w-auto min-w-fit"
                          radius="full"
                          size="sm"
                          variant="bordered"
                          onPress={() =>
                            playSegment(seg.start_time, seg.end_time)
                          }
                        >
                          <img
                            alt="Play"
                            height={12}
                            src="/icon-play.svg"
                            width={12}
                          />
                          Play
                        </Button>
                      </div>
                    </div>
                    <div
                      className={clsx(
                        "bg-gray-100 text-dark font-bold text-xs px-4 py-2 border-l-8",
                        seg.who_type === "CUSTOMER"
                          ? "border-green-500"
                          : seg.who_type === "AGENT"
                            ? "border-sky-500"
                            : "border-gray-500",
                      )}
                    >
                      <button
                        className="w-full text-left font-bold"
                        style={{ userSelect: "text", cursor: "text" }}
                        type="button"
                        onMouseUp={() => handleTextSelection(seg)}
                      >
                        {seg.text ? (
                          highlightCorrection(seg.text, data.corrections)
                        ) : (
                          <i>[silence]</i>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 flex flex-col gap-4 h-[26.125rem]">
              <div className="flex justify-between items-center">
                <h3 className="text-sm text-midnight font-extrabold">
                  Transcription Corrections
                </h3>

                <Button
                  isIconOnly
                  aria-label="Submit"
                  className="bg-light"
                  onPress={handleSubmitCorrection}
                >
                  <ArrowRight className="h-5 w-5 text-primary" />
                </Button>
              </div>
              <div className="overflow-y-auto flex flex-col gap-7">
                <Input
                  classNames={{
                    inputWrapper:
                      "bg-yellow-200 text-midnight  font-semibold text-sm",
                    input: "bg-yellow-200 text-midnight font-semibold text-sm",
                  }}
                  label="Highlighted Text"
                  radius="full"
                  value={highlightedText}
                  onChange={(e) => setHighlightedText(e.target.value)}
                />
                <Input
                  classNames={{
                    inputWrapper:
                      "text-midnight font-roboto bg-light  font-semibold text-sm",
                    input:
                      "text-midnight font-roboto text-sm font-semibold bg-light",
                  }}
                  label="Corrected Text"
                  radius="full"
                  value={correctedText}
                  onChange={(e) => setCorrectedText(e.target.value)}
                />
              </div>
            </Card>

            <Card className="px-4 py-6 flex flex-col gap-4 h-[26.125rem]">
              <div className="grid grid-cols-2 auto-rows-auto text-midnight gap-2 text-xs font-bold pr-4">
                <div className="text-sm text-midnight font-extrabold">
                  Original Text
                </div>
                <div className="text-sm text-primary font-extrabold">
                  Corrected Text
                </div>
              </div>
              <div className="overflow-y-auto   grid grid-cols-2 auto-rows-auto text-midnight gap-2 text-xs font-bold">
                {data.corrections.map((c) => (
                  <React.Fragment key={`${c.id}`}>
                    <div>{c.original_text}</div>
                    <div className="flex items-center gap-2 justify-between ">
                      {c.corrected_text}

                      <div className="flex gap-1">
                        <Button
                          isIconOnly
                          aria-label="Edit"
                          className="bg-transparent  h-auto w-auto min-w-fit text-green-400"
                          size="sm"
                          onPress={() => handleEditCorrection(c)}
                        >
                          <SquarePen className="h-4 w-4" />
                        </Button>

                        <Button
                          isIconOnly
                          aria-label="Delete"
                          className="bg-transparent  h-auto w-auto min-w-fit text-red-400"
                          size="sm"
                          onPress={() => {
                            setPendingDeleteId(c.id);
                            setShowDeleteModal(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
              <div className="flex items-center gap-4 justify-between mt-auto">
                <div className="text-xs text-gray-500">
                  Total words:{" "}
                  <span className="font-bold text-midnight">
                    {data?.word_count || 0}
                  </span>
                  {" | "}
                  Total corrected words:{" "}
                  <span className="font-bold text-midnight">
                    {getTotalCorrectedWords()}
                  </span>
                </div>
                {data && (
                  <div className="text-xs text-gray-500">
                    Accuracy:{" "}
                    <span className="font-bold text-midnight">
                      {(
                        ((data.word_count - getTotalCorrectedWords()) /
                          data.word_count) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                )}
                <Button
                  aria-label="Save Accuracy"
                  className="px-4 py-3 text-sm font-medium font-roboto"
                  color="primary"
                  isLoading={isSavingAccuracy}
                  radius="full"
                  onPress={handleSaveAccuracy}
                >
                  <Save className="h-5 w-5" /> Save Accuracy
                </Button>
              </div>
            </Card>
          </div>
        </>
      ) : null}

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded shadow-lg p-6 min-w-[300px]">
            <div className="mb-4 text-lg font-semibold">Delete Correction?</div>
            <div className="mb-6 text-gray-700">
              Are you sure you want to delete this correction?
            </div>
            <div className="flex justify-end gap-2">
              <Button
                className="px-7 py-3 text-sm font-medium font-roboto"
                radius="full"
                variant="light"
                onPress={() => {
                  setShowDeleteModal(false);
                  setPendingDeleteId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="px-7 py-3 text-sm font-medium font-roboto"
                color="danger"
                radius="full"
                onPress={() => {
                  if (pendingDeleteId !== null) {
                    handleDeleteCorrection(pendingDeleteId);
                  }
                  setShowDeleteModal(false);
                  setPendingDeleteId(null);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranscriptionTraining;
