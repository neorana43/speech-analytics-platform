import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  getKeyValue,
} from "@heroui/react";
import { Link } from "react-router-dom"; // ✅ import

import mockData from "@/data/projects.json";

const Transcription = () => {
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 4;

  const projects = mockData.projects;
  const pages = Math.ceil(projects.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return projects.slice(start, end);
  }, [page, projects]);

  const classNames = React.useMemo(
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
        // first
        "group-data-[first=true]/tr:first:before:rounded-none",
        "group-data-[first=true]/tr:last:before:rounded-none",
        // middle
        "group-data-[middle=true]/tr:before:rounded-none",
        // last
        "group-data-[last=true]/tr:first:before:rounded-none",
        "group-data-[last=true]/tr:last:before:rounded-none",
      ],
    }),
    [],
  );

  return (
    <div className="flex flex-col gap-4 flex-1">
      <div className="pl-12 w-full">
        <h2 className="page-title text-primary">Call Processing: Status</h2>
      </div>

      <div className="w-full flex flex-col flex-1">
        <Table
          aria-label="Projects"
          bottomContent={
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={pages}
                onChange={(page) => setPage(page)}
              />
            </div>
          }
          classNames={classNames}
          rowHeight={50}
        >
          <TableHeader>
            <TableColumn key="id" width={80}>
              ID
            </TableColumn>
            <TableColumn key="name">NAME</TableColumn>
          </TableHeader>

          <TableBody items={items}>
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell>
                    {columnKey === "name" ? (
                      <Link
                        className=" hover:text-primary "
                        to={`/transcription/${item.id}`}
                      >
                        {item.name}
                      </Link>
                    ) : (
                      getKeyValue(item, columnKey)
                    )}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Transcription;
