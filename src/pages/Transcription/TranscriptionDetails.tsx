import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Pagination,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Checkbox,
  Chip,
  DatePicker,
} from "@heroui/react";
import { Funnel, X } from "lucide-react";
import clsx from "clsx";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { DateValue } from "@internationalized/date";

import { useAuth } from "@/auth/AuthContext";
import { ApiService } from "@/lib/api";

interface Interaction {
  id: number;
  interaction_id: string;
  interaction_date: string;
  queue: string;
  agent: string;
  accuracy: number | null;
  status: string;
  tag: string;
  status_color: "green" | "gray" | "red";
}

interface Status {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

const TranscriptionDetails = () => {
  const { id } = useParams();
  const projectId = Number(id);
  const { token } = useAuth();

  const [projectName, setProjectName] = useState<string>("");
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  const [startDate, setStartDate] = useState<DateValue | null>(null);
  const [endDate, setEndDate] = useState<DateValue | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

  const rowsPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !projectId) return;
    const api = ApiService(token);

    const fetchData = async () => {
      try {
        const [clients, rawStatuses, rawTags, interactions] = await Promise.all(
          [
            api.getClients(),
            api.getInteractionStatus(),
            api.getInteractionTags(),
            api.filterInteractions({}),
          ],
        );

        const matchedClient = clients.find((c: any) => c.id === projectId);

        setProjectName(matchedClient?.name ?? "Unknown Client");

        // Normalize the field names to `name`
        setStatuses(
          rawStatuses.map((s: any) => ({
            id: s.id,
            name: s.status, // ✅ normalize from `.status`
          })),
        );

        setTags(
          rawTags.map((t: any) => ({
            id: t.id,
            name: t.tag, // ✅ normalize from `.tag`
          })),
        );

        setInteractions(interactions);
      } catch (err) {
        console.error("❌ Failed to load data:", err);
      }
    };

    fetchData();
  }, [token, projectId]);

  const applyFilters = async () => {
    const api = ApiService(token!);
    const filtered = await api.filterInteractions({
      start_date: startDate?.toString(),
      end_date: endDate?.toString(),
      status_ids: selectedStatuses,
      tag_ids: selectedTags,
    });

    setInteractions(filtered);
    setPage(1);
  };

  const pages = Math.ceil(interactions.length / rowsPerPage);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;

    return interactions.slice(start, start + rowsPerPage);
  }, [page, interactions]);

  const classNames = useMemo(
    () => ({
      base: "flex-1",
      wrapper: ["px-0", "shadow-none", "rounded-none", "flex-1"],
      th: [
        "bg-transparent",
        "text-light-gray",
        "uppercase",
        "border-b",
        "border-divider",
      ],
      td: [
        "group-data-[first=true]/tr:first:before:rounded-none",
        "group-data-[first=true]/tr:last:before:rounded-none",
        "group-data-[middle=true]/tr:before:rounded-none",
        "group-data-[last=true]/tr:first:before:rounded-none",
        "group-data-[last=true]/tr:last:before:rounded-none",
      ],
    }),
    [],
  );

  return (
    <div className="flex flex-col gap-4 flex-1">
      <div className="pl-[3.25rem] w-full">
        <h2 className="page-title text-primary">Call Processing: Status</h2>
      </div>
      <Card className="w-full pt-8 px-2 gap-0 flex-1">
        <CardHeader className="flex items-center px-8 gap-4 font-roboto text-midnight justify-between">
          <h1 className="text-3xl font-medium">{projectName}</h1>
          <Popover
            isOpen={isFilterOpen}
            placement="bottom-end"
            onOpenChange={setIsFilterOpen}
          >
            <PopoverTrigger>
              <Button
                isIconOnly
                aria-label="filter"
                variant="light"
                onPress={() => setIsFilterOpen((open) => !open)} // toggle
              >
                <Funnel className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full max-w-[25rem]">
              <div className="ml-auto">
                <Button
                  isIconOnly
                  aria-label="close"
                  className="p-1"
                  size="sm"
                  variant="light"
                  onPress={() => setIsFilterOpen(false)}
                >
                  <X className="h-5 w-5 text-primary" />
                </Button>
              </div>
              <div className="flex flex-col gap-12 p-2 w-full">
                <div className="flex flex-col gap-4">
                  <div className="text-md font-semibold text-midnight">
                    Date Range
                  </div>
                  <div className="flex gap-6 items-center">
                    <DatePicker
                      classNames={{
                        inputWrapper: "text-midnight font-roboto bg-light",
                      }}
                      radius="full"
                      value={startDate}
                      onChange={setStartDate}
                    />
                    <div>to</div>
                    <DatePicker
                      classNames={{
                        inputWrapper: "text-midnight font-roboto bg-light",
                      }}
                      radius="full"
                      value={endDate}
                      onChange={setEndDate}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="text-md font-semibold text-midnight">
                    Status
                  </div>
                  <div className="flex flex-col gap-1">
                    {statuses.map((s) => (
                      <Checkbox
                        key={s.id}
                        isSelected={selectedStatuses.includes(s.id)}
                        onValueChange={(checked) =>
                          setSelectedStatuses((prev) =>
                            checked
                              ? [...prev, s.id]
                              : prev.filter((id) => id !== s.id),
                          )
                        }
                      >
                        {s.name || "Unknown Status"}
                      </Checkbox>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="text-md font-semibold text-midnight">
                    Browse by Tags
                  </div>

                  <Autocomplete
                    allowsCustomValue={false}
                    placeholder="Start typing..."
                    radius="full"
                    selectedKey={null} // Allow re-selecting the same tag
                    size="sm"
                    onSelectionChange={(id) => {
                      const tagId = Number(id);

                      if (tagId && !selectedTags.includes(tagId)) {
                        setSelectedTags([...selectedTags, tagId]);
                      }
                    }}
                  >
                    {tags
                      .filter((tag) => !selectedTags.includes(tag.id))
                      .map((tag) => (
                        <AutocompleteItem key={tag.id}>
                          {tag.name}
                        </AutocompleteItem>
                      ))}
                  </Autocomplete>

                  <div className="flex gap-2 mt-3 flex-wrap">
                    {selectedTags.map((id) => {
                      const tag = tags.find((t) => t.id === id);

                      return (
                        <Chip
                          key={id}
                          color="primary"
                          onClose={() =>
                            setSelectedTags((prev) =>
                              prev.filter((t) => t !== id),
                            )
                          }
                        >
                          {tag?.name || "Unnamed"}
                        </Chip>
                      );
                    })}
                  </div>
                </div>

                <Button
                  className=" px-7 py-3 text-sm font-medium font-roboto"
                  color="primary"
                  radius="full"
                  onPress={applyFilters}
                >
                  Apply Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </CardHeader>
        <CardBody className="p-0">
          <Table
            aria-label="Interactions Table"
            bottomContent={
              <div className="flex w-full justify-center">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="primary"
                  page={page}
                  total={pages}
                  onChange={(p) => setPage(p)}
                />
              </div>
            }
            classNames={classNames}
            rowHeight={50}
          >
            <TableHeader>
              <TableColumn>INTERACTION ID</TableColumn>
              <TableColumn>DATE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>QUEUE</TableColumn>
              <TableColumn>AGENT</TableColumn>
              <TableColumn>DISPOSITION</TableColumn>
              <TableColumn>ACCURACY</TableColumn>
              <TableColumn>QUALITY REVIEWED</TableColumn>
            </TableHeader>
            <TableBody>
              {paginatedData.map((i) => (
                <TableRow
                  key={i.id}
                  className="cursor-pointer hover:bg-gray-50 transition"
                  onClick={() =>
                    navigate(
                      `/transcription/${projectId}/training?interaction_id=${i.interaction_id}`,
                    )
                  }
                >
                  <TableCell>{i.interaction_id}</TableCell>
                  <TableCell>
                    {new Date(i.interaction_date).toLocaleString()}
                  </TableCell>
                  <TableCell>{i.status}</TableCell>
                  <TableCell>{i.queue}</TableCell>
                  <TableCell>{i.agent}</TableCell>
                  <TableCell>{i.tag}</TableCell>
                  <TableCell>
                    {i.accuracy !== null ? `${i.accuracy}%` : "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 items-center">
                      <div
                        className={clsx(
                          "h-4 flex-1 border border-black",
                          i.status_color === "green"
                            ? "bg-green-500"
                            : i.status_color === "red"
                              ? "bg-red-500"
                              : "bg-gray-300",
                        )}
                      />
                      <Button isIconOnly aria-label="play" variant="light">
                        <img alt="play" src="/icon-play.svg" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
};

export default TranscriptionDetails;
