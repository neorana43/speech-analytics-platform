import { Button, Card, Input, Textarea } from "@heroui/react";
import { ArrowLeft, Download, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PromptDesigner = () => {
  const navigate = useNavigate();

  const existingPrompts = [
    "Plan Name",
    "Individual vs Family",
    "Caller Sentiment",
  ];

  const defaultPrompt = `Give me an idea on the reason behind the incoming call to the call center with the following transcription of the call conversation. Identify if the call was about a new prospective customer, an existing member calling for renewal, an existing member calling to cancel their plan, an existing member calling for service, or another reason. Responses to the answer should be classified as “New Sale”, “Renewal”, “Member Service”, or “Other” respectively.`;

  return (
    <div className="flex flex-col gap-4 flex-1">
      <div className="flex items-center gap-4">
        <Button
          className="text-midnight p-0"
          size="sm"
          variant="light"
          onPress={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </Button>
        <h2 className="page-title text-primary">Transcription Training</h2>
      </div>

      {/* Prompt Entry Section */}
      <Card className="lg:py-11  lg:px-14 px-6 py-6 flex flex-col gap-4">
        <Textarea
          classNames={{
            inputWrapper: "bg-light text-midnight p-6",
            input: "!text-midnight leading-relaxed font-roboto",
          }}
          defaultValue={defaultPrompt}
          minRows={5}
        />

        <div className="ml-auto">
          <Button color="primary" radius="full">
            Preview
          </Button>
        </div>
      </Card>

      {/* Preview and Sidebar Section */}
      <div className="grid  grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left 3 columns: Prompt Previews (empty for now) */}
        <div className="col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="px-4 py-6 flex flex-col gap-4 h-[26.125rem] "
            />
          ))}
        </div>

        {/* Right column: Prompt Save and Existing */}
        <Card className="px-4 py-6 flex flex-col gap-4 h-[26.125rem] ">
          <div className="text-sm font-semibold text-gray-600">Prompt Name</div>
          <Input
            classNames={{
              inputWrapper: "text-midnight font-roboto bg-light",
            }}
            placeholder="Call Reason"
          />

          <Button
            className="flex gap-2 text-orange-500 self-end"
            color="primary"
            startContent={<Download className="h-6 w-6" />}
            variant="light"
          >
            Save Prompt
          </Button>

          <div className="mt-4 text-sm font-semibold text-gray-500">
            Existing Prompts for this Project:
          </div>

          <div className="flex flex-col gap-2 text-sm">
            {existingPrompts.map((prompt) => (
              <div
                key={prompt}
                className="flex justify-between items-center border-b pb-1"
              >
                <span>{prompt}</span>
                <Upload className="w-4 h-4 text-orange-500 cursor-pointer" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PromptDesigner;
