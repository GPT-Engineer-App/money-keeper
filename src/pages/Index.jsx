import React, { useState } from "react";
import { Box, Button, Checkbox, Flex, FormControl, FormLabel, Heading, Input, Select, Stack, Table, Tbody, Td, Th, Thead, Tr, Text, useToast, Divider } from "@chakra-ui/react";
import { FaEdit, FaTrash, FaFileExport } from "react-icons/fa";

// Mock data for categories and initial transactions
const initialCategories = ["Groceries", "Bills", "Salary", "Entertainment", "Misc"];

const initialTransactions = [
  { id: 1, date: "2023-04-01", amount: 200.0, type: "Income", category: "Salary" },
  { id: 2, date: "2023-04-02", amount: 50.0, type: "Expense", category: "Groceries" },
  // ... other transactions
];

const transactionTypes = ["Income", "Expense"];

const Index = () => {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const toast = useToast();

  // Function to handle the submission of the form for both add and edit operations
  const handleFormSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newTransaction = {
      id: editingTransaction ? editingTransaction.id : new Date().getTime(),
      date: formData.get("date"),
      amount: parseFloat(formData.get("amount")),
      type: formData.get("type"),
      category: formData.get("category"),
    };

    if (editingTransaction) {
      setTransactions(transactions.map((transaction) => (transaction.id === editingTransaction.id ? newTransaction : transaction)));
    } else {
      setTransactions([...transactions, newTransaction]);
    }
    setEditingTransaction(null);
    toast({
      title: editingTransaction ? "Transaction updated" : "Transaction added",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  // Function to handle the edit button click
  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
  };

  // Function to handle the delete button click
  const handleDeleteClick = (transactionId) => {
    setTransactions(transactions.filter((transaction) => transaction.id !== transactionId));
    toast({
      title: "Transaction deleted",
      status: "error",
      duration: 2000,
      isClosable: true,
    });
  };

  // Function to handle the export button click
  const handleExportClick = () => {
    const data = JSON.stringify(transactions);
    const blob = new Blob([data], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "transactions.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to handle the filter change
  const handleFilterChange = (e, filterSetter) => {
    filterSetter(e.target.value);
  };

  // Function to calculate total balance
  const calculateTotalBalance = () => {
    return transactions.reduce((acc, transaction) => {
      return transaction.type === "Income" ? acc + transaction.amount : acc - transaction.amount;
    }, 0);
  };

  // Function to filter transactions
  const getFilteredTransactions = () => {
    return transactions.filter((transaction) => {
      const matchType = filterType ? transaction.type === filterType : true;
      const matchCategory = filterCategory ? transaction.category === filterCategory : true;
      const matchDateFrom = filterDateFrom !== "" ? new Date(transaction.date) >= new Date(filterDateFrom) : true;
      const matchDateTo = filterDateTo !== "" ? new Date(transaction.date) <= new Date(filterDateTo) : true;
      return matchType && matchCategory && matchDateFrom && matchDateTo;
    });
  };

  // Render the form for adding and editing transactions
  const renderTransactionForm = () => {
    return (
      <Box as="form" onSubmit={handleFormSubmit} bg="white" p={4} mb={4} borderRadius="md" boxShadow="sm">
        <Heading size="md" mb={4}>
          {editingTransaction ? "Edit Transaction" : "Add Transaction"}
        </Heading>
        <Stack spacing={3}>
          <FormControl isRequired>
            <FormLabel>Date</FormLabel>
            <Input type="date" name="date" defaultValue={editingTransaction ? editingTransaction.date : ""} isRequired />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Amount</FormLabel>
            <Input type="number" step="0.01" name="amount" defaultValue={editingTransaction ? editingTransaction.amount : ""} isRequired />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Type</FormLabel>
            <Select name="type" defaultValue={editingTransaction ? editingTransaction.type : ""} isRequired>
              {transactionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Category</FormLabel>
            <Select name="category" defaultValue={editingTransaction ? editingTransaction.category : ""} isRequired>
              {initialCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </FormControl>
          <Button type="submit" colorScheme="blue">
            {editingTransaction ? "Update" : "Add"}
          </Button>
          {editingTransaction && <Button onClick={() => setEditingTransaction(null)}>Cancel Edit</Button>}
        </Stack>
      </Box>
    );
  };

  // Render the filters for the transactions list
  const renderFilters = () => {
    return (
      <Flex mb={4} align="center">
        <Select placeholder="Filter by Type" mr={2} onChange={(e) => handleFilterChange(e, setFilterType)}>
          {transactionTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
        <Select placeholder="Filter by Category" mr={2} onChange={(e) => handleFilterChange(e, setFilterCategory)}>
          {initialCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
        <Input placeholder="From Date" type="date" mr={2} onChange={(e) => handleFilterChange(e, setFilterDateFrom)} />
        <Input placeholder="To Date" type="date" mr={2} onChange={(e) => handleFilterChange(e, setFilterDateTo)} />
        <Button leftIcon={<FaFileExport />} onClick={handleExportClick}>
          Export
        </Button>
      </Flex>
    );
  };

  // Render the transactions table
  const renderTransactionsTable = () => {
    const filteredTransactions = getFilteredTransactions();
    return (
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Date</Th>
            <Th>Amount</Th>
            <Th>Type</Th>
            <Th>Category</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredTransactions.map((transaction) => (
            <Tr key={transaction.id}>
              <Td>{transaction.date}</Td>
              <Td>{transaction.amount}</Td>
              <Td>{transaction.type}</Td>
              <Td>{transaction.category}</Td>
              <Td>
                <Button size="sm" leftIcon={<FaEdit />} mr={2} onClick={() => handleEditClick(transaction)}>
                  Edit
                </Button>
                <Button size="sm" leftIcon={<FaTrash />} colorScheme="red" onClick={() => handleDeleteClick(transaction.id)}>
                  Delete
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    );
  };

  // Render the balance summary
  const renderBalanceSummary = () => {
    const totalBalance = calculateTotalBalance();
    return (
      <Flex justify="space-between" align="center" bg="white" p={4} borderRadius="md" boxShadow="sm" mb={4}>
        <Text>Total Balance:</Text>
        <Heading size="lg">${totalBalance.toFixed(2)}</Heading>
      </Flex>
    );
  };

  // The main render function for the component
  return (
    <Box p={8}>
      <Heading mb={4}>Financial Tracker</Heading>
      {renderTransactionForm()}
      {renderFilters()}
      {renderBalanceSummary()}
      <Divider mb={4} />
      {renderTransactionsTable()}
    </Box>
  );
};

export default Index;
