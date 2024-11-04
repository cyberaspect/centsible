import { useState, useEffect } from 'react';
import { CalendarDaysIcon, HelpCircleIcon, MinusCircleIcon, PlusCircleIcon } from 'lucide-react';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, DropdownSection, Tooltip, Switch, Input, Checkbox, Link, Divider, DatePicker, cn } from '@nextui-org/react';
import { getLocalTimeZone, today, parseDate } from "@internationalized/date";
import { NumericFormat } from 'react-number-format';
import { doc, collection, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../components/firebase';
import toast from 'react-hot-toast';
import { usePurchaseContext } from '../../components/PurchaseContext';

export default function ActionButton({ userData }) {
  const [transactionDropdownVisible, setTransactionDropdownVisible] = useState(false);
  const [oneTimeModalVisible, setOneTimeModalVisible] = useState(false);
  const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);
  const [withdrawing, setWithdrawing] = useState(true);
  const [price, setPrice] = useState(null);
  const [purchaseName, setPurchaseName] = useState(null);
  const [purchaseDesc, setPurchaseDesc] = useState(null);
  const [startDate, setStartDate] = useState(today(getLocalTimeZone()));
  const [showDescBox, setShowDescBox] = useState(false);
  const [loading, setLoading] = useState(false);
  const { incrementPurchaseNum } = usePurchaseContext();

  const handleOpenDropdown = () => {
    setTransactionDropdownVisible(!transactionDropdownVisible);
    setOneTimeModalVisible(false);
    setSubscriptionModalVisible(false);
  };

  const handleOneTimeClick = () => {
    setOneTimeModalVisible(true);
    setSubscriptionModalVisible(false);
    setTransactionDropdownVisible(false);
  };

  const handleSubscriptionClick = () => {
    setSubscriptionModalVisible(true);
    setOneTimeModalVisible(false);
    setTransactionDropdownVisible(false);
  };

  const closeOneTime = () => {
    setOneTimeModalVisible(false);
    setWithdrawing(true);
    setPurchaseName(null);
    setPurchaseDesc(null);
    setPrice(null);
    
  };

  const closeSub = () => {
    setSubscriptionModalVisible(false);
    setWithdrawing(true);
    setPurchaseName(null);
    setPurchaseDesc(null);
  };

  const handleSaveOneTime = async () => {
    if (!purchaseName || !price) {
      toast.error("Looks like you missed a couple of things 😉. Please fill out all required fields");
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      const purchaseDocRef = doc(collection(db, 'hc5', user.uid, 'purchases'), purchaseName);
      const purchaseDoc = await getDoc(purchaseDocRef);

      if (purchaseDoc.exists()) {
        toast.error("A purchase with this name already exists.");
      } else {
        const purchaseData = {
          name: purchaseName,
          price: parseFloat(price),
          date: new Date().toISOString(),
          withdrawing,
        };

        if (showDescBox) {
          purchaseData.description = purchaseDesc;
        }

        await setDoc(purchaseDocRef, purchaseData);
        toast.success("Purchase added successfully.");
        incrementPurchaseNum(); // Increment the sessionPurchaseNum
        closeOneTime();
      }
    } catch (error) {
      console.error("Error adding purchase:", error);
      toast.error("An unknown error occurred! (logged)");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSubscription = async () => {
    if (!purchaseName || !price || !startDate) {
      toast.error("Looks like you missed a couple of things 😉. Please fill out all required fields");
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      const subscriptionDocRef = doc(collection(db, 'hc5', user.uid, 'subscriptions'), purchaseName);
      const subscriptionDoc = await getDoc(subscriptionDocRef);

      if (subscriptionDoc.exists()) {
        toast.error("A subscription with this name already exists.");
      } else {
        const subscriptionData = {
          name: purchaseName,
          price: parseFloat(price),
          startDate: startDate.toString(),
          withdrawing,
        };

        if (showDescBox) {
          subscriptionData.description = purchaseDesc;
        }

        await setDoc(subscriptionDocRef, subscriptionData);
        toast.success("Subscription added successfully.");
        incrementPurchaseNum(); // Increment the sessionPurchaseNum
        closeSub();
      }
    } catch (error) {
      console.error("Error adding subscription:", error);
      toast.error("An unknown error occurred! (logged)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey) {
        switch (event.key) {
          case 'e':
            event.preventDefault();
            handleOpenDropdown();
            break;
          case 'o':
            event.preventDefault();
            handleOneTimeClick();
            break;
          case 's':
            event.preventDefault();
            handleSubscriptionClick();
            break;
          case 'i':
            event.preventDefault();
            alert("Income Source...");
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4">
      <Dropdown isOpen={transactionDropdownVisible} backdrop="blur" onClose={() => setTransactionDropdownVisible(false)}>
        <DropdownTrigger>
          <Button isIconOnly radius="full" size="lg" onClick={handleOpenDropdown}>
            <Tooltip className="mb-3" content={<div><span>New Transaction...</span><span className="ml-1 text-default-500">⌘E</span></div>}>
              <PlusCircleIcon />
            </Tooltip>
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Add Options" className="-mb-2" disabledKeys={["divider"]}>
          <DropdownSection title="New Transaction [⌘E]">  
            <DropdownItem key="one-time" shortcut="⌘O" onClick={handleOneTimeClick}>
              One-Time...
            </DropdownItem>
            <DropdownItem key="subscription" shortcut="⌘S" onClick={handleSubscriptionClick}>
              Subscription...
            </DropdownItem>
            <DropdownItem key="income" shortcut="⌘I" onClick={handleSubscriptionClick}>
              Income Source...
            </DropdownItem>
            <DropdownItem textValue="divider" className="-m-0.5" key="divider">
              <Divider />
            </DropdownItem>
            <DropdownItem key="close" color="danger" shortcut="ESC" onClick={handleOpenDropdown}>
              Close Menu
            </DropdownItem>
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>

      <Modal 
        isOpen={oneTimeModalVisible} 
        backdrop="blur"
        onClose={closeOneTime}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Add One-Time Transaction</ModalHeader>
              <ModalBody className="-mt-3">
                <Switch
                  color="danger"
                  classNames={{
                    base: cn(
                      "inline-flex flex-row-reverse w-full max-w-md bg-content1 hover:bg-content2 items-center",
                      "justify-between cursor-pointer rounded-lg gap-2 p-2 border-2 border-transparent",
                    ),
                    wrapper: cn(
                      "group-data-[hover=true]:border-primary",
                      //selected
                      "group-data-[selected=true]:ml-6",
                      // pressed
                      "group-data-[pressed=false]:bg-red-300",
                    ),
                  }}
                  isSelected={withdrawing}
                  onValueChange={setWithdrawing}
                  isDisabled={false}
                >
                  {withdrawing ? 'Now Withdrawing...' : 'Now Depositing...'}
                </Switch>
                <Input
                  autoFocus
                  label="Payment Name"
                  value={purchaseName}
                  onChange={(e) => setPurchaseName(e.target.value)}
                  size="sm"
                  isRequired
                />
                <Input
                  label="Description"
                  value={purchaseDesc}
                  onChange={(e) => setPurchaseDesc(e.target.value)}
                  size="sm"
                  isClearable
                />
                <NumericFormat
                  label="Price"
                  size="sm"
                  placeholder="0.00"
                  value={price}
                  onValueChange={(values) => setPrice(values.value)}
                  thousandSeparator
                  decimalScale={2}
                  fixedDecimalScale
                  allowNegative={false}
                  customInput={Input}
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">$</span>
                    </div>
                  }
                  className="no-spinner"
                  isRequired
                />
              </ModalBody>
              <ModalFooter>
                <Button onPress={closeOneTime}>
                  Close
                </Button>
                <Button color="primary" variant='flat' onPress={handleSaveOneTime} isLoading={loading}>
                  Save changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal 
        isOpen={subscriptionModalVisible}
        backdrop="blur"
        onClose={closeSub}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Add Subscription</ModalHeader>
              <ModalBody className="-mt-3">
                <Switch
                  color="danger"
                  classNames={{
                    base: cn(
                      "inline-flex flex-row-reverse w-full max-w-md bg-content1 hover:bg-content2 items-center",
                      "justify-between cursor-pointer rounded-lg gap-2 p-2 border-2 border-transparent",
                    ),
                    wrapper: cn(
                      "group-data-[hover=true]:border-primary",
                      //selected
                      "group-data-[selected=true]:ml-6",
                        // pressed
                        "group-data-[pressed=false]:bg-red-300",
                      ),
                      }}
                      isSelected={withdrawing}
                      onValueChange={setWithdrawing}
                      isDisabled={false}
                    >
                      {withdrawing ? 'Now Withdrawing...' : 'Now Depositing...'}
                    </Switch>
                    <div className="flex items-center space-x-1">
                      <Input
                      autoFocus
                      size="sm"
                      label="Subscription Name"
                      value={purchaseName}
                      onChange={(e) => setPurchaseName(e.target.value)}
                      isRequired
                      endContent={
                        <Tooltip content="Disney+, Hello Fresh, Water Bill">
                          <HelpCircleIcon className="dark:text-default-700 cursor-default" />
                        </Tooltip>
                      }
                      />
                      <Button
                      size="sm"
                      variant="light"
                      radius="full"
                      isIconOnly
                      onPress={() => setShowDescBox(!showDescBox)}
                      >
                      <Tooltip content={showDescBox ? "Remove Description" : "Add Description"}>
                        {showDescBox ? <MinusCircleIcon className="dark:text-default-700" /> : <PlusCircleIcon className="dark:text-default-700" />}
                      </Tooltip>
                      </Button>
                    </div>
                    {showDescBox && (
                      <Input
                      label="Description"
                    value={purchaseDesc}
                    onChange={(e) => setPurchaseDesc(e.target.value)}  
                    size="sm"
                    isClearable
                  />
                )}
                <span className="-mb-2"></span>
                <NumericFormat
                  label="Price"
                  size="sm"
                  placeholder="0.00"
                  value={price}
                  onValueChange={(values) => setPrice(values.value)}
                  thousandSeparator
                  decimalScale={2}
                  fixedDecimalScale
                  allowNegative={false}
                  customInput={Input}
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">$</span>
                    </div>
                  }
                  endContent={
                    <div className="flex items-center">
                      <label className="sr-only" htmlFor="renewal">
                        Renewal Period
                      </label>
                      <select
                        className="outline-none border-0 bg-transparent text-small"
                        id="renewal"
                        name="renewal"
                      >
                        <option className="bg-gray-700">/mo</option>
                        <option className="bg-gray-700">/yr</option>
                        <option className="bg-gray-700">/wk</option>
                      </select>
                    </div>
                  }
                  className="no-spinner"
                  isRequired
                />
                <DatePicker
                  label="Start Date" 
                  size="sm"
                  description={<p className="inline-flex items-center">Tip: use the&nbsp;<CalendarDaysIcon size={17} />&nbsp;icon to open the Calendar Menu</p>} 
                  minValue={parseDate("1900-01-01")}
                  maxValue={parseDate("2100-12-31")}
                  defaultValue={startDate}
                  onChange={setStartDate}
                  isRequired
                />
              </ModalBody>
              <ModalFooter>
                <Button onPress={closeSub}>
                  Close
                </Button>
                <Button color="primary" variant='flat' onPress={handleSaveSubscription} isLoading={loading}>
                  Save changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}