import React, { useEffect, useMemo, useState } from "react";
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
import { Link } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import { ApiService } from "@/lib/api";

interface Client {
  id: number;
  name: string;
}

const Transcription = () => {
  const { token } = useAuth();

  const [clients, setClients] = useState<Client[]>([]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 4;

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const api = ApiService(token!);
        const data = await api.getClients();

        setClients(data);
      } catch (err) {
        console.error("❌ Failed to fetch clients:", err);
      }
    };

    if (token) fetchClients();
  }, [token]);

  const pages = Math.ceil(clients.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return clients.slice(start, end);
  }, [page, clients]);

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

      <div className="w-full flex flex-col flex-1">
        <Table
          aria-label="Clients Table"
          bottomContent={
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                initialPage={page}
                page={page}
                total={pages}
                onChange={setPage}
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
                        className="hover:text-primary"
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
