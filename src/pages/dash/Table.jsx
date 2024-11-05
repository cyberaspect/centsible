import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  Tooltip,
  Pagination,
} from "@nextui-org/react";
import { PencilIcon, Trash2Icon, RefreshCcw, PlusIcon, EllipsisVertical, SearchIcon, ChevronDownIcon } from "lucide-react";
import { auth, db } from "../../components/firebase";
import { collection, getDocs, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { usePurchaseContext } from "../../components/PurchaseContext";
import { format, set } from "date-fns";
import { NumericFormat } from "react-number-format";
import { toast } from 'react-hot-toast';

const columns = [
  { name: "NAME", uid: "name", sortable: true },
  { name: "DATE", uid: "date", sortable: true },
  { name: "TAG", uid: "tag" },
  { name: "PRICE", uid: "price" },
  { name: "DESCRIPTION", uid: "description" },
  { name: "ACTIONS", uid: "actions" },
];

const fetchPurchases = async (uid) => {
  const purchases = [];
  const querySnapshot = await getDocs(collection(db, "hc5", uid, "purchases"));
  querySnapshot.forEach((doc) => {
    purchases.push({ id: doc.id, ...doc.data() });
  });
  return purchases;
};

const updateBalance = async (amount, isWithdrawal) => {
  const user = auth.currentUser;
  const userDocRef = doc(db, 'hc5', user.uid);
  const userDoc = await getDoc(userDocRef);
  if (userDoc.exists()) {
    const currentBalance = userDoc.data().balance || 0;
    const newBalance = isWithdrawal ? currentBalance + amount : currentBalance - amount;
    await updateDoc(userDocRef, { balance: newBalance });
  }
};

const deletePurchase = async (purchases, purchaseId, uid, setPurchases, setDeleteDisabled) => {
  if (uid) {
    setDeleteDisabled(true);
    const purchase = purchases.find(p => p.id === purchaseId);
    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const purchaseDoc = await getDoc(doc(db, "hc5", uid, "purchases", purchaseId));
          const purchaseData = purchaseDoc.data();

          await updateBalance(purchaseData.price, purchaseData.withdrawing !== false);
          await deleteDoc(doc(db, "hc5", uid, "purchases", purchaseId));

          const updatedPurchases = purchases.filter(purchase => purchase.id !== purchaseId);
          setPurchases(updatedPurchases);
          resolve();
        } catch (error) {
          console.error("Error deleting purchase:", error);
          reject();
        } finally {
          setDeleteDisabled(false);
        }
      }),
      {
        loading: `Deleting purchase ${purchase.name}...`,
        success: `Purchase ${purchase.name} deleted successfully!`,
        error: `Error deleting ${purchase.name}!`
      }
    );
  }
};

const getChipColor = (value) => {
  switch (value.toLowerCase()) {
    case "medical":
      return "red";
    case "insurance":
      return "blue";
    case "education":
      return "green";
    case "clothing":
      return "white";
    case "food":
      return "yellow";
    case "savings":
      return "orange";
    case "utilities":
      return "gray";
    default:
      return "yellow";
  }
};

const refreshPurchases = async (uid, setPurchases) => {
  if (uid) {
    const data = await fetchPurchases(uid);
    setPurchases(data);
  }
};

export default function HistoryTable() {
  const [purchases, setPurchases] = useState([]);
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(col => col.uid)));
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState({ column: "date", direction: "ascending" });
  const [deleteDisabled, setDeleteDisabled] = useState(false);
  const [page, setPage] = useState(1);
  const uid = auth.currentUser?.uid;
  const { sessionPurchaseNum } = usePurchaseContext();

  useEffect(() => {
    const getPurchases = async () => {
      if (uid) {
        const data = await fetchPurchases(uid);
        setPurchases(data);
      }
    };
    getPurchases();
  }, [uid, sessionPurchaseNum]);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredPurchases = [...purchases];
    if (hasSearchFilter) {
      filteredPurchases = filteredPurchases.filter((purchase) =>
        purchase.name?.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    return filteredPurchases;
  }, [purchases, filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = useCallback((purchase, columnKey) => {
  const cellValue = purchase[columnKey];

  switch (columnKey) {
    case "name":
      return <p>{cellValue}</p>;
    case "date":
      return <p>{cellValue ? format(new Date(cellValue), "Pp") : "(not specified)"}</p>; // attempt to shorten column
    case "price":
      const isWithdrawal = purchase.withdrawing !== false;
      return (
        <NumericFormat
          value={cellValue}
          displayType={'text'}
          thousandSeparator={true}
          prefix={isWithdrawal ? '$' : '+$'}
          className={isWithdrawal ? '' : 'text-green-500'}
        />
      );
    case "tag":
      return (
        <Chip className="capitalize" color={() => getChipColor(cellValue)} size="sm" variant="flat">
          {cellValue}
        </Chip>
      );
    case "description":
      return <p>{cellValue}</p>;
    case "actions":
      return (
        <div className="relative flex items-center gap-2">
          {/* <Tooltip content="Details">
            <Button isIconOnly size="sm" color="ghost"><PencilIcon /></Button>
          </Tooltip>
          <Tooltip content="Edit purchase">
            <Button isIconOnly size="sm" color="ghost"><PencilIcon /></Button>
          </Tooltip> */}
          <Tooltip color="danger" showArrow content="Delete purchase">
            <Button isIconOnly isDisabled={deleteDisabled} className={deleteDisabled ? "text-default-500" : null} size="sm" variant="light" onPress={() => deletePurchase(purchases, purchase.id, uid, setPurchases, setDeleteDisabled)}>
              <Trash2Icon />
            </Button>
          </Tooltip>
        </div>
      );
    default:
      return cellValue;
  }
}, [purchases, uid, setPurchases]);

  const onNextPage = useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by name..."
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDownIcon className="text-small" />} variant="light">
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {column.name.charAt(0).toUpperCase() + column.name.slice(1).toLowerCase()}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            {/* <Button color="primary" endContent={<PlusIcon />}>
              Add New
            </Button> */}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">You've made {purchases.length} purchases/deposits</span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="40">40</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [filterValue, visibleColumns, onRowsPerPageChange, purchases.length, onSearchChange, hasSearchFilter]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${filteredItems.length} selected...`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onPreviousPage}>
            Previous
          </Button>
          <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onNextPage}>
            Next
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, items.length, page, pages, hasSearchFilter]);

  return (
    <Table
      aria-label="Purchases Table with custom cells, pagination and sorting"
      isHeaderSticky
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      // classNames={{
      //   wrapper: "max-h-[382px]",
      // }}
      selectedKeys={selectedKeys}
      selectionMode="multiple"
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSelectionChange={setSelectedKeys}
      onSortChange={setSortDescriptor}
    >
      <TableHeader columns={headerColumns}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === "actions" ? "center" : "start"}
            allowsSorting={column.sortable}
            // className={column.uid === "date" && "min-w-[5vw]"}
          >
            {column.uid === "actions" ? (
              <div className="flex flex-row items-center">
                {column.name}
                <Tooltip content="Refresh purchases">
                  <Button size="sm" variant="light" isIconOnly onPress={() => refreshPurchases(uid, setPurchases)}>
                    <RefreshCcw size={18} />
                  </Button>
                </Tooltip>
              </div>
            ) : (
              column.name
            )}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody emptyContent={"No purchases found"} items={sortedItems}>
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}