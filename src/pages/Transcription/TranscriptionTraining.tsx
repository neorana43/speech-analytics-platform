import React from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Button, Card } from "@heroui/react";
import { ArrowLeft } from "lucide-react";

const TranscriptionTraining = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 flex-1">
      <div className="flex items-center gap-4">
        <Button
          className="text-midnight p-0"
          size="sm"
          variant="light"
          onPress={() => navigate(`/transcription/${id}`)}
        >
          <ArrowLeft className="w-5 h-5 " /> Back
        </Button>
        <h2 className="page-title text-primary">Transcription Training</h2>
      </div>

      {/* Call Info + Waveform */}
      <Card className="p-6 flex flex-col gap-4">
        <div className="flex justify-between text-sm text-midnight font-roboto font-semibold">
          <div>Jerome Murphy on September 29, 2024 10:40 AM for 04:14 min</div>
          <div className="font-normal text-xs">
            Call ID: 171b864f-...-a96c3456k870e
          </div>
        </div>

        {/* Placeholder for waveform */}
        <div className="bg-gray-100 rounded-md h-48 flex items-center justify-center text-sm text-gray-500">
          <p>[ Waveform timeline here ]</p>
        </div>

        <div className="text-center text-sm font-medium text-midnight">
          02:33 / 04:14
        </div>
      </Card>

      {/* Transcript and Correction Panels */}
      <div className="grid grid-cols-3 gap-4">
        {/* Left: Transcript */}
        <Card className="p-4 space-y-4">
          <div className="text-sm text-gray-500 font-semibold">Transcript</div>
          {/* Placeholder lines */}
          <div className="text-sm">
            00:04 – Jerome Murphy:{" "}
            <strong>
              hello welcome to <span className="text-yellow-500">acme.com</span>
            </strong>
          </div>
          <div className="text-sm text-green-700">
            00:16 – Customer: <strong>hi i was calling because...</strong>
          </div>
        </Card>

        {/* Middle: Correction Entry */}
        <Card className="p-4 flex flex-col gap-4">
          <div className="text-sm text-gray-500 font-semibold">
            Transcription Corrections
          </div>
          <div className="bg-yellow-100 text-yellow-700 p-2 rounded">
            Highlighted Text
          </div>
          <input
            className="border border-gray-300 p-2 rounded text-sm"
            placeholder="Corrected Text"
          />
          <Button className="self-end" color="primary">
            Submit
          </Button>
        </Card>

        {/* Right: Corrections Table */}
        <Card className="p-4">
          <div className="text-sm font-semibold text-gray-500 mb-2">
            Corrections
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm font-roboto text-midnight">
            <div className="font-bold text-red-400">Original</div>
            <div className="font-bold text-green-600">Corrected</div>
            <div>acme.com</div>
            <div>AC ME</div>
            <div>FLOW Rida</div>
            <div>Florida</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TranscriptionTraining;
