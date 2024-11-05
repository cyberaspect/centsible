import { useState, useEffect } from 'react';
import { CalendarDaysIcon, HelpCircleIcon, MinusCircleIcon, PlusCircleIcon } from 'lucide-react';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, DropdownSection, Tooltip, Switch, Input, Checkbox, Link, Divider, DatePicker, cn, Popover, PopoverTrigger, PopoverContent, Autocomplete, AutocompleteItem, Chip, Kbd } from '@nextui-org/react';
import { getLocalTimeZone, today, parseDate } from "@internationalized/date";
import { NumericFormat } from 'react-number-format';
import { doc, collection, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../components/firebase';
import toast from 'react-hot-toast';
import { usePurchaseContext } from '../../components/PurchaseContext';

const categories = [
  { label: "Housing", value: "housing" },
  { label: "Transportation", value: "transportation" },
  { label: "Food", value: "food" },
  { label: "Utilities", value: "utilities" },
  { label: "Clothing", value: "clothing" },
  { label: "Medical", value: "medical" },
  { label: "Insurance", value: "insurance" },
  { label: "Household Items", value: "household_items" },
  { label: "Personal", value: "personal" },
  { label: "Entertainment", value: "entertainment" },
  { label: "Debt", value: "debt" },
  { label: "Education", value: "education" },
  { label: "Savings", value: "savings" },
  { label: "Gifts", value: "gifts" },
];

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
  const [selectedTag, setSelectedTag] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [tagInputValue, setTagInputValue] = useState('');

  const toCapital = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

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
    setSelectedTag(null);
  };

  const closeSub = () => {
    setSubscriptionModalVisible(false);
    setWithdrawing(true);
    setPurchaseName(null);
    setPurchaseDesc(null);
    setSelectedTag(null);
  };

  const updateBalance = async (amount, isWithdrawal) => {
    const user = auth.currentUser;
    const userDocRef = doc(db, 'hc5', user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const currentBalance = userDoc.data().balance || 0;
      const newBalance = isWithdrawal ? currentBalance - amount : currentBalance + amount;
      await updateDoc(userDocRef, { balance: newBalance });
    }
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
          description: purchaseDesc,
          price: parseFloat(price),
          date: new Date().toISOString(),
          tag: selectedTag,
          withdrawing,
        };
        if (showDescBox) {
          purchaseData.description = purchaseDesc;
        }
        await setDoc(purchaseDocRef, purchaseData);
        await updateBalance(parseFloat(price), withdrawing);
        toast.success("Purchase added successfully.");
        incrementPurchaseNum();
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
          description: purchaseDesc,
          price: parseFloat(price),
          startDate: startDate.toString(),
          tag: selectedTag,
          withdrawing,
        };
        if (showDescBox) {
          subscriptionData.description = purchaseDesc;
        }
        await setDoc(subscriptionDocRef, subscriptionData);
        await updateBalance(parseFloat(price), withdrawing);
        toast.success("Subscription added successfully.");
        incrementPurchaseNum();
        closeSub();
      }
    } catch (error) {
      console.error("Error adding subscription:", error);
      toast.error("An unknown error occurred! (logged)");
    } finally {
      setLoading(false);
    }
  };

  const handleTagSelect = (key) => {
    setSelectedTag(key);
    setPopoverVisible(false);
  };

  const handleTagInputChange = (value) => {
    setTagInputValue(value);
  };

  const handleTagInputKeyDown = (event) => {
    if (event.key === 'Enter' && tagInputValue) {
      setTimeout(() => {
        setSelectedTag(tagInputValue);
        setPopoverVisible(false);
      });
    }
  };

  const togglePopover = () => {
    setPopoverVisible(!popoverVisible);
  };

  const getButtonLabel = () => {
    if (!selectedTag) return "Select Tag";
    const category = categories.find(cat => cat.value === selectedTag);
    return category ? toCapital(selectedTag) : selectedTag;
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
            toast("If you want to add some kind of income source, you can add it as a one-time or subscription transaction. Just select the Deposit/Withdrawal switch and fill out the form as you would any other time!", {duration: 8000, icon: '👋',});
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
                                <Popover 
                  showArrow
                  backdrop="blur"
                  placement="right"
                  isOpen={popoverVisible}
                  onClose={() => setPopoverVisible(false)}
                  classNames={{
                    base: ["before:bg-default-200"],
                    content: [
                      "py-2 px-3 border border-default-200",
                      "bg-gradient-to-br from-white to-default-300",
                      "dark:from-default-100 dark:to-default-50",
                    ],
                  }}
                >
                  <PopoverTrigger>
                    <Button variant="light" onClick={togglePopover}>
                      <Chip>{getButtonLabel()}</Chip>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    {(titleProps) => (
                      <div className="px-1 py-2">
                        {/* <h3 className="text-small font-bold" {...titleProps}>
                          Select a Tag
                        </h3> */}
                        <Autocomplete 
                          label="Select tag..."
                          size="sm"
                          variant="faded"
                          description="Tags help organize your purchases."
                          className="max-w-xs" 
                          listboxProps={{
                            // emptyContent: {"ENTER to add custom tag..."}
                          }}
                          allowsCustomValue={false}
                          onSelectionChange={handleTagSelect}
                          onInputChange={handleTagInputChange}
                          onKeyDown={handleTagInputKeyDown}
                          defaultItems={categories}
                        >
                          {(item) => (
                            <AutocompleteItem key={item.value} value={item.value}>
                              {item.label}
                            </AutocompleteItem>
                          )}
                        </Autocomplete>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
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
                                <Popover 
                  showArrow
                  backdrop="blur"
                  placement="right"
                  isOpen={popoverVisible}
                  onClose={() => setPopoverVisible(false)}
                  classNames={{
                    base: ["before:bg-default-200"],
                    content: [
                      "py-3 px-4 border border-default-200",
                      "bg-gradient-to-br from-white to-default-300",
                      "dark:from-default-100 dark:to-default-50",
                    ],
                  }}
                >
                  <PopoverTrigger>
                    <Button onClick={togglePopover}>{getButtonLabel()}</Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    {(titleProps) => (
                      <div className="px-1 py-2">
                        {/* <h3 className="text-small font-bold" {...titleProps}>
                          Select a Tag
                        </h3> */}
                        <Autocomplete 
                          label="Select tag..." 
                          size="sm"
                          variant="faded"
                          description="Tags help organize your purchases."
                          className="max-w-xs" 
                          listboxProps={{
                            // emptyContent={"ENTER to add custom tag..."}
                          }}
                          allowsCustomValue={false}
                          onSelectionChange={handleTagSelect}
                          onInputChange={handleTagInputChange}
                          onKeyDown={handleTagInputKeyDown}
                          defaultItems={categories}
                        >
                          {(item) => (
                            <AutocompleteItem key={item.value} value={item.value}>
                              {item.label}
                            </AutocompleteItem>
                          )}
                        </Autocomplete>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
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