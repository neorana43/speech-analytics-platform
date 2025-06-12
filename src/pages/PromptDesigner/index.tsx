// src\pages\PromptDesigner\index.tsx

import {
  Button,
  Card,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import {
  ArrowLeft,
  ChevronsLeft,
  ChevronsRight,
  MessageSquareText,
  Plus,
  Save,
  SquarePen,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { addToast } from "@heroui/toast";

import { PromptDetail, Question, PreviewResponse } from "../../types/prompt";

import { ApiService } from "@/lib/api";
import { useAuth } from "@/auth/AuthContext";

interface Prompt {
  prompt_id: number;
  prompt_title: string;
  is_active: boolean;
}

interface MappedPreviewResponse extends PreviewResponse {
  json_result?: Array<{
    question_id: number;
    answer: string;
    question_key: string;
  }>;
  result?: string;
}

const PromptDesigner = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptDetail | null>(
    null,
  );
  const [promptTitle, setPromptTitle] = useState("");
  const [promptTitleError, setPromptTitleError] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [previewResults, setPreviewResults] = useState<MappedPreviewResponse[]>(
    [],
  );
  const [selectedTranscript, setSelectedTranscript] = useState<string | null>(
    null,
  );
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [excludedIds, setExcludedIds] = useState<number[]>([]);
  const [hasMoreResults, setHasMoreResults] = useState({
    prev: false,
    next: false,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [questionKeyErrors, setQuestionKeyErrors] = useState<{
    [key: number]: boolean;
  }>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [promptToDelete, setPromptToDelete] = useState<number | null>(null);
  const [isFetchingPromptDetails, setIsFetchingPromptDetails] = useState(false);
  const [isDeletingPrompt, setIsDeletingPrompt] = useState(false);

  useEffect(() => {
    const fetchPrompts = async () => {
      if (!token) return;

      try {
        const api = ApiService(token);
        const selectedClientStr = localStorage.getItem("selectedClient");
        const selectedClient = selectedClientStr
          ? JSON.parse(selectedClientStr)
          : null;

        if (selectedClient) {
          const data = await api.getPrompts(selectedClient.id);

          setPrompts(data);
        }
      } catch (error) {
        console.error("Failed to fetch prompts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, [token]);

  const handleEditPrompt = async (promptId: number) => {
    if (!token) return;

    setIsFetchingPromptDetails(true);
    try {
      const api = ApiService(token);
      const promptDetail = await api.getPromptDetail(promptId);

      setSelectedPrompt(promptDetail);
      setPromptTitle(promptDetail.prompt_title);
      setPromptText(promptDetail.prompt);

      const questionsWithIds = promptDetail.questions || [];

      setQuestions(questionsWithIds);
      setPromptTitleError(false);

      setPreviewResults([]);
    } catch (error) {
      console.error("Failed to fetch prompt details:", error);
    } finally {
      setIsFetchingPromptDetails(false);
    }
  };

  const validateQuestionKey = (
    questions: Question[],
    currentIndex: number,
    newKey: string,
  ): boolean => {
    const trimmedKey = newKey.trim().toLowerCase();

    if (!trimmedKey) return true;

    return questions.some(
      (q, index) =>
        index !== currentIndex &&
        q.question_key.trim().toLowerCase() === trimmedKey,
    );
  };

  const handleAddQuestion = () => {
    const selectedClientStr = localStorage.getItem("selectedClient");
    const selectedClient = selectedClientStr
      ? JSON.parse(selectedClientStr)
      : null;

    const newQuestion: Question = {
      question_id: 0,
      client_id: selectedClient?.id,
      question: "",
      is_active: true,
      prompt_id: selectedPrompt?.prompt_id,
      question_key: "",
      to_delete: 0,
    };

    setQuestions([...questions, newQuestion]);
  };

  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: string,
  ) => {
    const updatedQuestions = [...questions];
    const updatedQuestion = { ...updatedQuestions[index], [field]: value };

    if (field === "question_key") {
      const hasError = validateQuestionKey(updatedQuestions, index, value);

      updatedQuestion.isKeyError = hasError;
      setQuestionKeyErrors((prev) => ({
        ...prev,
        [index]: hasError,
      }));
    }

    updatedQuestions[index] = updatedQuestion;

    // Check if both question and key are blank
    const isQuestionBlank = !updatedQuestion.question.trim();
    const isKeyBlank = !updatedQuestion.question_key.trim();

    if (isQuestionBlank && isKeyBlank) {
      // Simply remove the row if both fields are blank
      updatedQuestions.splice(index, 1);
      // Also remove any error state for this index
      setQuestionKeyErrors((prev) => {
        const newErrors = { ...prev };

        delete newErrors[index];

        return newErrors;
      });
    }

    setQuestions(updatedQuestions);
  };

  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[index];

    // Check if both question and key are blank
    const isQuestionBlank = !question.question.trim();
    const isKeyBlank = !question.question_key.trim();

    if (isQuestionBlank && isKeyBlank) {
      // Simply remove the row if both fields are blank
      updatedQuestions.splice(index, 1);
      // Also remove any error state for this index
      setQuestionKeyErrors((prev) => {
        const newErrors = { ...prev };

        delete newErrors[index];

        return newErrors;
      });
    } else {
      // Toggle the disabled state for UI
      question.isDisabled = !question.isDisabled;
      updatedQuestions[index] = question;
    }

    setQuestions(updatedQuestions);
  };

  const handleAddNewPrompt = () => {
    if (!promptTitle.trim()) {
      setPromptTitleError(true);

      return;
    }
    setSelectedPrompt(null);
    setPromptTitle("");
    setPromptText("");
    setQuestions([]);
    setPreviewResults([]);
    setPromptTitleError(false);
  };

  const handleSavePrompt = async () => {
    if (!token) return;

    const selectedClientStr = localStorage.getItem("selectedClient");
    const selectedClient = selectedClientStr
      ? JSON.parse(selectedClientStr)
      : null;

    if (!selectedClient) {
      console.error("No client selected");

      return;
    }

    // Validate prompt title
    if (!promptTitle.trim()) {
      setPromptTitleError(true);

      return;
    }
    setPromptTitleError(false);

    // Validate question keys
    const updatedQuestions = questions.map((q, index) => {
      const hasError = validateQuestionKey(questions, index, q.question_key);

      return { ...q, isKeyError: hasError };
    });

    const hasErrors = updatedQuestions.some((q) => q.isKeyError);

    if (hasErrors) {
      setQuestions(updatedQuestions);
      const newErrorState = updatedQuestions.reduce(
        (acc, q, index) => {
          acc[index] = q.isKeyError ?? false;

          return acc;
        },
        {} as Record<number, boolean>,
      );

      setQuestionKeyErrors(newErrorState);
      console.error("Validation errors in question keys.");

      return;
    }

    // Check for incomplete questions
    const hasIncompleteQuestions = questions.some(
      (q) => !q.question.trim() || !q.question_key.trim(),
    );

    if (hasIncompleteQuestions) {
      console.error("All questions must have both question and question key");

      return;
    }

    setIsSaving(true);

    try {
      const api = ApiService(token);

      const formattedQuestions = updatedQuestions.map(
        ({ isKeyError, isDisabled, ...q }) => ({
          question_id: q.question_id,
          client_id: selectedClient.id,
          question: q.question.trim(),
          is_active: true,
          prompt_id: selectedPrompt?.prompt_id || 0,
          question_key: q.question_key.trim(),
          // Set to_delete based on isDisabled state when saving
          to_delete: isDisabled ? 1 : 0,
        }),
      );

      const promptData = {
        prompt_id: selectedPrompt?.prompt_id || 0,
        client_id: selectedClient.id,
        prompt_title: promptTitle.trim(),
        prompt: promptText.trim(),
        is_active: true,
        questions: formattedQuestions,
      };

      console.log("Saving prompt data:", promptData);

      await api.savePromptDetails(JSON.stringify(promptData));

      const updatedPrompts = await api.getPrompts(selectedClient.id);

      setPrompts(updatedPrompts);

      // Clear all state after successful save
      setPromptTitle("");
      setPromptText("");
      setQuestions([]);
      setQuestionKeyErrors({});
      setSelectedPrompt(null);
    } catch (error: any) {
      if (error.message === "DUPLICATE_QUESTION_KEY") {
        const duplicateKey = error.duplicateKey?.toLowerCase();

        addToast({
          title: "Error",
          description: duplicateKey
            ? `The key "${duplicateKey}" already exists for this client.`
            : "One or more question keys already exist for this client.",
          color: "danger",
        });

        const errorMap: Record<number, boolean> = {};

        questions.forEach((q, index) => {
          if (q.question_key.trim().toLowerCase() === duplicateKey) {
            errorMap[index] = true;
          }
        });

        setQuestionKeyErrors((prev) => ({
          ...prev,
          ...errorMap,
        }));

        const firstErrorIndex = Object.keys(errorMap).map(Number)[0];

        setTimeout(() => {
          const input = document.querySelectorAll(
            '[aria-label="Question Key Input"]',
          )[firstErrorIndex];

          if (input) {
            (input as HTMLElement).scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 0);

        return;
      }

      console.error("Failed to save prompt:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviewPrompt = async (
    direction: "prev" | "next" | "" = "",
    excludeIds: number[] = [],
  ) => {
    if (!token) return;

    const selectedClientStr = localStorage.getItem("selectedClient");
    const selectedClient = selectedClientStr
      ? JSON.parse(selectedClientStr)
      : null;

    if (!selectedClient) {
      console.error("No client selected");

      return;
    }

    if (!promptText.trim()) {
      console.error("Prompt text is required");

      return;
    }

    const hasErrors = questions.some((q) => q.error);

    if (hasErrors) {
      console.error("Please fix validation errors before previewing");

      return;
    }

    const hasIncompleteQuestions = questions.some(
      (q) => !q.question.trim() || !q.question_key.trim(),
    );

    if (hasIncompleteQuestions) {
      console.error("All questions must have both question and question key");

      return;
    }

    try {
      setIsPreviewLoading(true);
      const api = ApiService(token);

      const currentIds = previewResults.map((result) => result.id);
      const idsToExclude = direction ? currentIds : excludeIds;

      const payload = {
        prompt_id: selectedPrompt?.prompt_id || 0,
        client_id: selectedClient.id,
        prompt: promptText.trim(),
        is_active: true,
        prompt_title: promptTitle.trim(),
        ids_to_exclude: idsToExclude,
        direction: direction,
        questions: questions
          .filter((q) => q.to_delete === 0)
          .map(({ error, ...q }) => ({
            question_id: q.question_id,
            client_id: selectedClient.id,
            question: q.question.trim(),
            is_active: true,
            prompt_id: selectedPrompt?.prompt_id || 0,
            question_key: q.question_key.trim(),
            to_delete: 0,
          })),
      };

      console.log("Preview payload:", payload);

      const previewData = await api.previewPrompt(payload);

      console.log("Preview response:", previewData);

      if (!previewData || previewData.length === 0) {
        setPreviewResults([]);
        setExcludedIds([]);
        setCurrentPage(0);
        setHasMoreResults({ prev: false, next: false });

        return;
      }

      const mappedResults = previewData.map((result: PreviewResponse) => ({
        ...result,
        json_result: result.json_result
          ? result.json_result.map((item) => {
              const originalQuestion = questions.find(
                (q) => q.question_id === item.question_id,
              );

              return {
                ...item,
                question_key: originalQuestion?.question_key || "Unknown",
              };
            })
          : undefined,
      }));

      setPreviewResults(mappedResults);
      setExcludedIds(idsToExclude);

      // Update hasMoreResults based on the number of results and current page
      if (!direction) {
        setHasMoreResults({
          prev: currentPage > 0,
          next: mappedResults.length === 3,
        });
        setCurrentPage(0);
      } else {
        setHasMoreResults({
          prev: currentPage > 0,
          next: mappedResults.length === 3 && direction === "next",
        });
      }

      // Update current page
      if (direction === "prev") {
        if (currentPage > 0) setCurrentPage((prev: number) => prev - 1);
      } else if (direction === "next") {
        setCurrentPage((prev: number) => prev + 1);
      } else {
        setCurrentPage(0);
      }
    } catch (error) {
      console.error("Failed to preview prompt:", error);
      setPreviewResults([]);
      setExcludedIds([]);
      setCurrentPage(0);
      setHasMoreResults({ prev: false, next: false });
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleNextPage = () => {
    if (previewResults.length === 0) return;

    let newExcludedIds;

    if (previewResults.length < 3) {
      // If we have less than 3 results, use the last 3 records from excludedIds
      newExcludedIds = excludedIds.slice(-3);
    } else {
      // If we have 3 results, add them to excludedIds as before
      newExcludedIds = [
        ...excludedIds,
        ...previewResults.map((r) => parseInt(r.interaction_id)),
      ];
    }

    setExcludedIds(newExcludedIds);
    handlePreviewPrompt("next", newExcludedIds);
  };

  const handlePreviousPage = () => {
    if (currentPage === 0 || previewResults.length === 0) return;

    let newExcludedIds;

    if (previewResults.length < 3) {
      // If we have less than 3 results, use the last 3 records from excludedIds
      newExcludedIds = excludedIds.slice(-3);
    } else {
      // If we have 3 results, remove the last set of results
      newExcludedIds = excludedIds.slice(0, -previewResults.length);
    }

    setExcludedIds(newExcludedIds);
    handlePreviewPrompt("prev", newExcludedIds);
  };

  const handleOpenTranscript = (transcript: string) => {
    setSelectedTranscript(transcript);
    setIsTranscriptModalOpen(true);
  };

  const handleCloseTranscript = () => {
    setSelectedTranscript(null);
    setIsTranscriptModalOpen(false);
  };

  const handleDeletePrompt = async (promptId: number) => {
    if (!token) return;

    setIsDeletingPrompt(true);
    try {
      const api = ApiService(token);

      await api.deletePrompt(promptId);

      // Update the prompts list after deletion
      const selectedClientStr = localStorage.getItem("selectedClient");
      const selectedClient = selectedClientStr
        ? JSON.parse(selectedClientStr)
        : null;

      if (selectedClient) {
        const updatedPrompts = await api.getPrompts(selectedClient.id);

        setPrompts(updatedPrompts);
      }

      // If the deleted prompt was selected, clear the form
      if (selectedPrompt?.prompt_id === promptId) {
        setSelectedPrompt(null);
        setPromptTitle("");
        setPromptText("");
        setQuestions([]);
        setQuestionKeyErrors({});
      }

      // Close the modal and reset the prompt to delete
      setIsDeleteModalOpen(false);
      setPromptToDelete(null);
    } catch (error) {
      console.error("Failed to delete prompt:", error);
    } finally {
      setIsDeletingPrompt(false);
    }
  };

  const openDeleteModal = (promptId: number) => {
    setPromptToDelete(promptId);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setPromptToDelete(null);
  };

  const classNames = useMemo(
    () => ({
      base: "flex-1",
      wrapper: ["flex-1 p-0 shadow-none"],
      th: [
        "bg-transparent",
        "text-light-gray",
        "uppercase",
        "border-b",
        "border-divider",
      ],
      td: [
        "group-data-[first=true]/tr:first:before:rounded-none",
        "group-data-[middle=true]/tr:before:rounded-none",
        "group-data-[last=true]/tr:first:before:rounded-none",
        "group-data-[last=true]/tr:last:before:rounded-none",
        "align-middle",
      ],
    }),
    [],
  );

  const classNamesPreview = useMemo(
    () => ({
      wrapper: ["p-0 shadow-none h-full"],
      th: [
        "bg-white",
        "text-light-gray",
        "uppercase",
        "border-b",
        "border-divider",
        "sticky top-0 z-10",
      ],
      td: [
        "group-data-[first=true]/tr:first:before:rounded-none",
        "group-data-[middle=true]/tr:before:rounded-none",
        "group-data-[last=true]/tr:first:before:rounded-none",
        "group-data-[last=true]/tr:last:before:rounded-none",
        "align-top",
      ],
    }),
    [],
  );

  console.log("QuestionKeyErrors", questionKeyErrors);

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

      <Card className="lg:py-11  lg:px-14 px-6 py-6 flex flex-col gap-4">
        <Input
          classNames={{
            inputWrapper: "text-midnight font-roboto bg-light",
          }}
          label="Prompt"
          radius="full"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
        />

        <div className="flex flex-col gap-2">
          <Table
            aria-label="Questions table"
            classNames={classNames}
            rowHeight={50}
          >
            <TableHeader>
              <TableColumn>Question</TableColumn>
              <TableColumn width={300}>Question Key</TableColumn>
              <TableColumn width={100}>Actions</TableColumn>
            </TableHeader>
            <TableBody>
              {questions
                .filter((question) => question.to_delete === 0)
                .map((question, index) => (
                  <TableRow key={index}>
                    <TableCell className="align-top">
                      <Input
                        aria-label="Question Input"
                        classNames={{
                          inputWrapper: `text-midnight font-roboto bg-light ${question.isDisabled ? "line-through opacity-50" : ""}`,
                        }}
                        isDisabled={question.isDisabled}
                        placeholder="Question"
                        radius="full"
                        value={question.question}
                        onChange={(e) =>
                          handleQuestionChange(
                            index,
                            "question",
                            e.target.value,
                          )
                        }
                      />
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="flex flex-col gap-1">
                        <Input
                          aria-label="Question Key Input"
                          classNames={{
                            inputWrapper: `text-midnight font-roboto bg-light border ${
                              questionKeyErrors[index]
                                ? "border-red-500"
                                : "border-light"
                            } ${question.isDisabled ? "line-through opacity-50" : ""}`,
                          }}
                          errorMessage={
                            questionKeyErrors[index]
                              ? "Question key must be unique and not empty"
                              : undefined
                          }
                          isDisabled={question.isDisabled}
                          isInvalid={questionKeyErrors[index] === true}
                          placeholder="Question key"
                          radius="full"
                          value={question.question_key}
                          onChange={(e) =>
                            handleQuestionChange(
                              index,
                              "question_key",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        isIconOnly
                        aria-label={question.isDisabled ? "Restore" : "Delete"}
                        className={`bg-transparent h-auto w-auto min-w-fit ${
                          question.isDisabled
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                        size="sm"
                        onPress={() => handleDeleteQuestion(index)}
                      >
                        {question.isDisabled ? (
                          <RotateCcw className="h-4 w-4" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <Button
            className="flex gap-2 text-orange-500 mt-2 w-fit mx-auto px-7 py-3 text-sm font-medium font-roboto"
            color="primary"
            radius="full"
            startContent={<Plus className="h-4 w-4" />}
            variant="light"
            onPress={handleAddQuestion}
          >
            Add Question
          </Button>
        </div>

        <div className="ml-auto">
          <Button
            className="px-7 py-3 text-sm font-medium font-roboto"
            color="primary"
            radius="full"
            onPress={() => handlePreviewPrompt()}
          >
            Preview
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-4 relative">
          {isPreviewLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <Card
                  key={index}
                  aria-label="loading preview result"
                  className="p-4 pb-24 flex flex-col gap-4 h-[28.375rem]"
                >
                  <div className="text-sm flex flex-col gap-3 h-full">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-gray-600">
                        Sample Response
                      </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <Table
                        isHeaderSticky
                        aria-label="Loading prompt preview"
                        className="h-full"
                        classNames={classNamesPreview}
                      >
                        <TableHeader>
                          <TableColumn>Question Key</TableColumn>
                          <TableColumn>Answer</TableColumn>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                            </TableCell>
                            <TableCell>
                              <div className="h-4 w-40 bg-gray-200 animate-pulse rounded" />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <div className="h-4 w-28 bg-gray-200 animate-pulse rounded" />
                            </TableCell>
                            <TableCell>
                              <div className="h-4 w-36 bg-gray-200 animate-pulse rounded" />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                            </TableCell>
                            <TableCell>
                              <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </Card>
              ))
            : previewResults.length > 0
              ? previewResults.map((result) => (
                  <Card
                    key={result.id}
                    aria-label="prompt preview result"
                    className="p-4 pb-24 flex flex-col gap-4 h-[28.375rem]"
                  >
                    <div className="text-sm flex flex-col gap-3 h-full">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-gray-600">
                          Sample Response:{" "}
                          <span className="italic font-normal">
                            Interaction ID {result.interaction_id}
                          </span>
                        </div>
                        <Button
                          isIconOnly
                          aria-label="transcript"
                          className="bg-transparent p-0 h-auto w-auto min-w-fit text-midnight"
                          radius="none"
                          size="sm"
                          onPress={() =>
                            handleOpenTranscript(result.transcript)
                          }
                        >
                          <MessageSquareText className="h-4 w-4" />
                        </Button>
                      </div>
                      {result.json_result && result.json_result.length > 0 ? (
                        <div className="flex-1 overflow-hidden">
                          <Table
                            isHeaderSticky
                            aria-label="Prompt preview"
                            className="h-full"
                            classNames={classNamesPreview}
                          >
                            <TableHeader>
                              <TableColumn>Question Key</TableColumn>
                              <TableColumn>Answer</TableColumn>
                            </TableHeader>
                            <TableBody>
                              {result.json_result.map((item) => (
                                <TableRow
                                  key={item.question_id}
                                  aria-label="json_result"
                                >
                                  <TableCell className="max-w-[200px] truncate">
                                    {item.question_key}
                                  </TableCell>
                                  <TableCell className="max-w-[200px] truncate">
                                    {item.answer}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : result.result ? (
                        <div className="flex-1 overflow-y-auto whitespace-pre-wrap text-gray-800">
                          {result.result}
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                          No preview data available.
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              : Array.from({ length: 3 }).map((_, index) => (
                  <Card
                    key={index}
                    aria-label="empty preview result"
                    className="px-4 py-6 flex flex-col gap-4 h-[28.375rem]"
                  >
                    <div className="text-sm flex flex-col gap-3 h-full">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-gray-600">
                          Sample Response
                        </div>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <Table
                          isHeaderSticky
                          aria-label="Empty prompt preview"
                          className="h-full"
                          classNames={classNamesPreview}
                        >
                          <TableHeader>
                            <TableColumn>Question Key</TableColumn>
                            <TableColumn>Answer</TableColumn>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell>No question key awailable</TableCell>
                              <TableCell>No answer awailable</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </Card>
                ))}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between p-4">
            <Button
              isIconOnly
              aria-label="Previous"
              className="bg-transparent border-primary border-2 text-primary hover:bg-primary hover:text-white disabled:opacity-50"
              isDisabled={!hasMoreResults.prev}
              radius="full"
              onPress={handlePreviousPage}
            >
              <ChevronsLeft />
            </Button>
            <Button
              isIconOnly
              aria-label="Next"
              className="bg-transparent border-primary border-2 text-primary hover:bg-primary hover:text-white disabled:opacity-50"
              isDisabled={!hasMoreResults.next}
              radius="full"
              onPress={handleNextPage}
            >
              <ChevronsRight />
            </Button>
          </div>
        </div>

        <Card className="px-4 py-6 flex flex-col gap-4 h-[28.375rem] ">
          <div className="text-sm font-semibold text-gray-600">Prompt Name</div>
          <Input
            aria-label="Prompt Title Input"
            classNames={{
              inputWrapper: `text-midnight font-roboto bg-light border border-light ${promptTitleError ? "border-red-500" : ""}`,
            }}
            errorMessage={"Prompt name is required"}
            isInvalid={promptTitleError}
            placeholder="Call Reason"
            radius="full"
            value={promptTitle}
            onChange={(e) => {
              setPromptTitle(e.target.value);
              if (e.target.value.trim()) {
                setPromptTitleError(false);
              }
            }}
          />

          <div className="flex gap-4 justify-end">
            <Button
              aria-label="Add New Prompt"
              className="flex gap-2 text-orange-500 px-4 py-3 text-sm font-medium font-roboto"
              color="primary"
              radius="full"
              startContent={<Plus className="h-6 w-6" />}
              variant="light"
              onPress={handleAddNewPrompt}
            >
              Add New Prompt
            </Button>
            <Button
              aria-label="Save Prompt"
              className="flex gap-2 text-orange-500 px-4 py-3 text-sm font-medium font-roboto"
              color="primary"
              isLoading={isSaving}
              radius="full"
              startContent={<Save className="h-6 w-6" />}
              variant="light"
              onPress={handleSavePrompt}
            >
              Save Prompt
            </Button>
          </div>

          <div className="mt-4 text-sm font-semibold text-gray-500">
            Existing Prompts for this Project:
          </div>

          <div className="flex flex-col gap-2 text-sm">
            {loading ? (
              <div className="text-gray-500">Loading prompts...</div>
            ) : prompts.length === 0 ? (
              <div className="text-gray-500">No prompts found</div>
            ) : (
              prompts.map((prompt) => (
                <div
                  key={prompt.prompt_id}
                  aria-label="Prompt Row"
                  className="flex justify-between items-center border-b pb-1"
                >
                  <span aria-label="Prompt name">{prompt.prompt_title}</span>
                  <div className="flex gap-2">
                    <Button
                      isIconOnly
                      aria-label="Edit"
                      className="bg-transparent h-auto w-auto min-w-fit text-green-400"
                      isDisabled={isFetchingPromptDetails}
                      size="sm"
                      onPress={() => handleEditPrompt(prompt.prompt_id)}
                    >
                      <SquarePen className="h-4 w-4" />
                    </Button>
                    <Button
                      isIconOnly
                      aria-label="Delete"
                      className="bg-transparent h-auto w-auto min-w-fit text-red-400"
                      size="sm"
                      onPress={() => openDeleteModal(prompt.prompt_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Modal
        isOpen={isTranscriptModalOpen}
        size="3xl"
        onClose={handleCloseTranscript}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Transcript</ModalHeader>
          <ModalBody>
            <div className="whitespace-pre-wrap text-sm">
              {selectedTranscript}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              className="px-7 py-3 text-sm font-medium font-roboto"
              color="primary"
              radius="full"
              onPress={handleCloseTranscript}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Delete Prompt
          </ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete this prompt? This action cannot be
              undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              className="px-7 py-3 text-sm font-medium font-roboto"
              color="danger"
              radius="full"
              variant="light"
              onPress={closeDeleteModal}
            >
              Cancel
            </Button>
            <Button
              className="px-7 py-3 text-sm font-medium font-roboto"
              color="danger"
              isLoading={isDeletingPrompt}
              radius="full"
              onPress={() =>
                promptToDelete && handleDeletePrompt(promptToDelete)
              }
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default PromptDesigner;
