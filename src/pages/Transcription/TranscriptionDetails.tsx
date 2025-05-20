import { useEffect, useMemo, useState } from "react";
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
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";
import { Funnel, X } from "lucide-react";
import { DateValue } from "@internationalized/date";
import clsx from "clsx";

import { useAuth } from "@/auth/AuthContext";
import { ApiService } from "@/lib/api";

interface Status {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

type Interaction = Record<string, any>;

const TranscriptionDetails = () => {
  const { id } = useParams();
  const projectId = Number(id);
  const navigate = useNavigate();
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

  useEffect(() => {
    if (!token || !projectId) return;

    const api = ApiService(token);

    const fetchData = async () => {
      try {
        const [clients, rawStatuses, rawTags, rawInteractions] =
          await Promise.all([
            api.getClients(),
            api.getInteractionStatus(projectId),
            api.getInteractionTags(projectId),
            api.filterInteractions({ client_id: projectId }),
          ]);

        const matchedClient = clients.find((c: any) => c.id === projectId);

        setProjectName(matchedClient?.name ?? "Unknown Client");

        setStatuses(
          rawStatuses.map((s: any) => ({ id: s.id, name: s.status })),
        );

        setTags(rawTags.map((t: any) => ({ id: t.id, name: t.tag })));

        setInteractions(rawInteractions);
        setPage(1);
      } catch (err) {
        console.error("❌ Failed to load data:", err);
      }
    };

    fetchData();
  }, [token, projectId]);

  const applyFilters = async () => {
    const api = ApiService(token!);
    const filtered = await api.filterInteractions({
      client_id: projectId,
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

  const columnKeys: string[] = useMemo(() => {
    if (interactions.length === 0) return [];

    return Object.keys(interactions[0]);
  }, [interactions]);

  const classNames = useMemo(
    () => ({
      base: "flex-1",
      wrapper: ["flex-1"],
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
                onPress={() => setIsFilterOpen((open) => !open)}
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
                      {s.name}
                    </Checkbox>
                  ))}
                </div>

                <div className="flex flex-col gap-4">
                  <div className="text-md font-semibold text-midnight">
                    Browse by Tags
                  </div>
                  <Autocomplete
                    allowsCustomValue={false}
                    placeholder="Start typing..."
                    radius="full"
                    selectedKey={null}
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
                  className="px-7 py-3 text-sm font-medium font-roboto"
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
            aria-label="Dynamic Interactions Table"
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
              {columnKeys.map((key) => (
                <TableColumn key={key}>
                  {key === "status_color"
                    ? "QUALITY REVIEWED"
                    : key.replace(/_/g, " ").toUpperCase()}
                </TableColumn>
              ))}
            </TableHeader>
            <TableBody>
              {paginatedData.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-gray-50 transition"
                  onClick={() =>
                    navigate(
                      `/transcription/${projectId}/training?interaction_id=${row.id}`,
                    )
                  }
                >
                  {columnKeys.map((col) => (
                    <TableCell key={col}>
                      {col === "status_color" ? (
                        <div className="flex gap-2 items-center">
                          <div
                            className={clsx(
                              "h-4 flex-1 border border-black",
                              row[col] === "green"
                                ? "bg-green-500"
                                : row[col] === "red"
                                  ? "bg-red-500"
                                  : "bg-gray-300",
                            )}
                          />
                          <Button isIconOnly aria-label="play" variant="light">
                            <img alt="play" src="/icon-play.svg" />
                          </Button>
                        </div>
                      ) : col === "accuracy" ? (
                        row[col] !== null ? (
                          `${row[col]}%`
                        ) : (
                          "N/A"
                        )
                      ) : typeof row[col] === "string" &&
                        row[col]?.includes("T") ? (
                        new Date(row[col]).toLocaleString()
                      ) : (
                        (row[col] ?? "—")
                      )}
                    </TableCell>
                  ))}
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
