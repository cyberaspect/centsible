import React, { useEffect, useState, useCallback } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Tooltip, Button, Link, Kbd } from "@nextui-org/react";
import { auth, db } from "../../components/firebase";
import { collection, getDocs } from "firebase/firestore";
import { PencilIcon, Trash2Icon, RefreshCcw, PlusCircleIcon } from "lucide-react";
import { usePurchaseContext } from "../../components/PurchaseContext";
import { format } from "date-fns";
import { useTheme } from 'next-themes';

const columns = [
  { name: "NAME", uid: "name" },
  { name: "DATE", uid: "date" },
  { name: "TAG", uid: "tag" },
  { name: "DESCRIPTION", uid: "description" },
  { name: "ACTIONS", uid: "actions" },
];

const fetchPurchases = async (uid) => {
  const purchases = [];
  const querySnapshot = await getDocs(collection(db, "hc5", uid, "purchases"));
  querySnapshot.forEach((doc) => {
    purchases.push({ id: doc.id, ...doc.data() });
  });
  purchases.sort((a, b) => new Date(b.date) - new Date(a.date));
  return purchases.slice(0, 5);
};

const Retable = () => {
  const [purchases, setPurchases] = useState([]);
  const [refreshDisabled, setRefreshDisabled] = useState(false);
  const uid = auth.currentUser?.uid;
  const { sessionPurchaseNum } = usePurchaseContext();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const getPurchases = async () => {
      if (uid) {
        const data = await fetchPurchases(uid);
        setPurchases(data);
      }
    };
    getPurchases();
  }, [uid, sessionPurchaseNum]);

  const renderCell = useCallback((purchase, columnKey) => {
    const cellValue = purchase[columnKey];

    switch (columnKey) {
      case "name":
        return <p>{cellValue}</p>;
      case "date":
        return <p>{cellValue ? format(new Date(cellValue), "PPpp") : "(not specified)"}</p>;
      case "tag":
        return (
          <Chip className="capitalize" color="primary" size="sm" variant="flat">
            {cellValue}
          </Chip>
        );
      case "description":
        return <p>{cellValue}</p>;
      case "actions":
        // return (
        //   <div className="relative flex items-center gap-2">
        //     <Tooltip content="Details">
        //       <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
        //         <PencilIcon />
        //       </span>
        //     </Tooltip>
        //     <Tooltip content="Edit purchase">
        //       <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
        //         <PencilIcon />
        //       </span>
        //     </Tooltip>
        //     <Tooltip color="danger" content="Delete purchase">
        //       <span className="text-lg text-danger cursor-pointer active:opacity-50">
        //         <Trash2Icon />
        //       </span>
        //     </Tooltip>
        //   </div>
        // );
      default:
        return cellValue;
    }
  }, []);

  return (
    <Table aria-label="Purchases Table" bottomContent={<Link href="/dashboard/history" className={`flex items-center justify-center underline underline-offset-2 -mt-5 ${resolvedTheme === "dark" ? "text-white cursor-pointer" : "text-black cursor-pointer"}`}>View more...</Link>}>
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
            <div className="flex flex-row items-center">
              {column.uid !== "actions" ? column.name : null}
              {column.uid === "actions" && (
                <Tooltip content="Refresh purchases">
                  <Button size="sm" className="-ml-1" isDisabled={refreshDisabled} variant="light" isIconOnly onPress={() => fetchPurchases(uid).then(setPurchases)}>
                    <RefreshCcw size={18} />
                  </Button>
                </Tooltip>
              )}
            </div>
          </TableColumn>
        )}
      </TableHeader>
      <TableBody emptyContent={<div className="space-y-0.5"><p>It's pretty empty in here...</p><p className="text-sm inline-flex items-center justify-center">Use the Action Button&nbsp;<PlusCircleIcon size={20} />&nbsp;to add a withdrawal/deposit! (or&nbsp;<Kbd>⌘E</Kbd></p>)</div>} items={purchases}>
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default Retable;