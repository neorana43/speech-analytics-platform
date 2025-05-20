import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Copy } from "lucide-react";
import { Button, Card, Input, Tooltip } from "@heroui/react";
import clsx from "clsx";

import { ApiService } from "@/lib/api";
import { useAuth } from "@/auth/AuthContext";

interface Segment {
  segment_id: number;
  start_time: number;
  end_time: number;
  start_time_text: string;
  end_time_text: string;
  text: string;
  who: string;
  who_type: "AGENT" | "CUSTOMER" | "PAUSE";
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
  segments: Segment[];
  corrections: Correction[];
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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token || !clientId || !interactionId) return;

    const api = ApiService(token);

    const fetchAudioDetails = async () => {
      try {
        const res = await api.getAudioDetails(clientId, interactionId);

        setData(res);
      } catch (err) {
        console.error("❌ Failed to fetch audio details:", err);
      }
    };

    fetchAudioDetails();
  }, [token, clientId, interactionId]);

  const playSegment = (start: number, end: number) => {
    const audio = audioRef.current;

    if (audio) {
      audio.currentTime = start;
      audio.play();

      const stopAt = () => {
        if (audio.currentTime >= end) {
          audio.pause();
          audio.removeEventListener("timeupdate", stopAt);
        }
      };

      audio.addEventListener("timeupdate", stopAt);
    }
  };
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500); // auto-reset
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

      {data && (
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

            {/* Audio player */}
            <div className="bg-gray-100 rounded-md h-48 flex items-center justify-center text-sm text-gray-500">
              <audio ref={audioRef} controls className="w-full h-full">
                <source src={data.audio_file_uri} type="audio/wav" />
                <track default kind="captions" label="English" src="" />
                Your browser does not support the audio element.
              </audio>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 ">
            <Card className="px-4 py-6 flex flex-col gap-4 h-[26.125rem] ">
              <div className="overflow-y-auto space-y-5">
                {data.segments.map((seg) => (
                  <div
                    key={seg.segment_id}
                    className="text-sm flex flex-col gap-3"
                  >
                    <div className="flex items-center  justify-between">
                      <div className="text-light-midnight font-bold">
                        {seg.start_time_text} min {seg.who || "[Pause]"}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          isIconOnly
                          aria-label="Comment"
                          className="bg-transparent p-0 h-auto w-auto min-w-fit"
                          size="sm"
                        >
                          <img
                            alt="Comment"
                            height={18}
                            src="/icon-comment.svg"
                            width={18}
                          />
                        </Button>
                        <Button
                          isIconOnly
                          aria-label="Flag"
                          className="bg-transparent p-0 h-auto w-auto min-w-fit"
                          size="sm"
                        >
                          <img
                            alt="Flag"
                            height={14}
                            src="/icon-flag.svg"
                            width={14}
                          />
                        </Button>
                        <Button
                          isIconOnly
                          aria-label="Play"
                          className="bg-transparent px-1 h-auto w-auto min-w-fit "
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
                      <strong>{seg.text || <i>[silence]</i>}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 flex flex-col gap-4 h-[26.125rem] ">
              <div className="flex justify-between items-center">
                <h3 className="text-sm text-midnight font-extrabold ">
                  Transcription Corrections
                </h3>
                <Button isIconOnly aria-label="Submit" className="bg-light">
                  <ArrowRight className="h-5 w-5 text-primary" />
                </Button>
              </div>
              <div className="overflow-y-auto flex flex-col gap-7">
                <div className="bg-[#FFF36E] text-midnight rounded-md px-7 py-2 font-semibold  text-sm w-fit">
                  Highlighted Text
                </div>
                <Input
                  classNames={{
                    inputWrapper: "text-midnight font-roboto bg-light",
                  }}
                  label="Corrected Text"
                  radius="md"
                />
              </div>
            </Card>

            {/* Right: Corrections Table */}
            <Card className="px-4 py-6 flex flex-col gap-4 h-[26.125rem] ">
              <div className="grid grid-cols-2 auto-rows-auto text-midnight  gap-2 text-xs font-bold">
                <div className="text-sm text-midnight font-extrabold pb-4">
                  Original Text
                </div>
                <div className="text-sm text-primary font-extrabold pb-4">
                  Corrected Text
                </div>
                {data.corrections.map((c) => (
                  <React.Fragment key={c.id}>
                    <div>{c.original_text}</div>
                    <div className="flex items-center gap-2 justify-between">
                      {c.corrected_text}

                      <div className="flex gap-1">
                        <Button
                          isIconOnly
                          aria-label="Accept"
                          className="bg-transparent p-0 h-auto w-auto min-w-fit"
                          size="sm"
                        >
                          <img
                            alt="Accept"
                            height={16}
                            src="/icon-accept.svg"
                            width={16}
                          />
                        </Button>
                        <Button
                          isIconOnly
                          aria-label="Reject"
                          className="bg-transparent p-0 h-auto w-auto min-w-fit"
                          size="sm"
                        >
                          <img
                            alt="Reject"
                            height={16}
                            src="/icon-reject.svg"
                            width={16}
                          />
                        </Button>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default TranscriptionTraining;
