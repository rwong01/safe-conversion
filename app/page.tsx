"use client";

import { useState, useEffect } from "react";

// Function to format numbers with commas
const formatNumberWithCommas = (value: string): string => {
    // Ensure the value is a valid number before applying the format
    const cleanedValue = value.replace(/[^0-9]+/g, ""); // Remove non-numeric characters
    if (!cleanedValue || isNaN(Number(cleanedValue))) {
        return value; // Return the original string if it's not a valid number
    }

    // Format the cleaned value with commas
    const formattedValue = parseInt(cleanedValue, 10).toLocaleString();

    // Return the formatted value
    return formattedValue;
};

// Function to validate and format percentage (between 1 and 100)
const validateAndFormatPercentage = (value: string): string => {
    let num = value.replace(/[^0-9]/g, ""); // Remove any non-numeric characters

    // If the value is empty, return 1 by default
    if (num === "") {
        return "1";
    }

    // If the number length exceeds 2 digits, limit it to the first 2 digits (no more than 99)
    if (num.length > 2) {
        num = num.slice(0, 2);
    }

    // If the number is greater than 100, return 100
    if (parseInt(num, 10) > 100) {
        num = "100";
    }

    return num; // Return the final sanitized number as a string
};

// Function to format amounts and valuations with a dollar sign and commas
const formatWithDollarSign = (value: string): string => {
    const numericValue = value.replace(/[^0-9.]+/g, ""); // Remove non-numeric characters except for '.'

    // Check if it's a valid number
    if (isNaN(parseFloat(numericValue)) || numericValue === "") {
        return "$"; // Return just the dollar sign if invalid or empty
    }

    // Handle the case for both integer and floating point numbers
    const [integerPart, decimalPart] = numericValue.split(".");

    // Format the integer part with commas
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // If there's a decimal part, include it; otherwise, just return the formatted integer with $ prefix
    return `$${formattedInteger}${decimalPart ? `.${decimalPart}` : ""}`;
};

// Function to calculate SAFE shares
const calculateSafeShares = (
    amount: number,
    discount: number,
    valuationCap: number,
    sharePrice: number,
    isPostMoney: boolean
) => {
    let discountedAmount = amount / (1 - discount / 100);
    if (valuationCap) {
        discountedAmount = Math.min(
            discountedAmount,
            valuationCap / sharePrice
        );
    }

    return discountedAmount;
};

// Function to calculate the new shares allocation for investors in the priced round
const calculateNewRoundShares = (amount: number, sharePrice: number) => {
    return Math.floor(amount / sharePrice); // Share rounding
};

// Function to calculate ownership percentages
const calculateOwnership = (
    safeShares: number,
    newRoundShares: number,
    totalShares: number
) => {
    const total = safeShares + newRoundShares;
    return {
        ownershipPercentage: (total / totalShares) * 100,
        totalShares: total,
    };
};

const Page = () => {
    const [inputValues, setInputValues] = useState({
        foundersShares: "5000000",
        nonFoundersShares: "2000000",
        optionsIssued: "1000000",
        optionsRemaining: "5000000",
        promisedShares: "0",
        futureOptionPoolSize: "10",
        valuation: "",
        prePostToggle: "pre", // Pre/Post toggle for the new round
    });

    const [safeRows, setSafeRows] = useState([
        {
            name: "",
            amount: "",
            discount: "",
            valuationCap: "",
            isPostMoney: false,
        },
    ]);
    const [newRoundRows, setNewRoundRows] = useState([
        { name: "", amount: "" },
    ]);

    const [calculatedResults, setCalculatedResults] = useState({
        safeShareCalculations: [],
        newRoundShareCalculations: [],
        totalShares: 0,
        totalOwnership: 0,
    });

    useEffect(() => {
        // Retrieve the data from sessionStorage
        const updatedSafeRows = sessionStorage.getItem("safeRows");
        const updatedNewRoundRows = sessionStorage.getItem("newRoundRows");
        const updatedInputValues = sessionStorage.getItem("inputValues");

        if (updatedSafeRows) {
            setSafeRows(JSON.parse(updatedSafeRows));
        }

        if (updatedNewRoundRows) {
            setNewRoundRows(JSON.parse(updatedNewRoundRows));
        }

        if (updatedInputValues) {
            setInputValues(JSON.parse(updatedInputValues));
        }
    }, []);

    useEffect(() => {
        // Ensure input values are sanitized and calculate total shares
        const totalShares =
            parseFloat(inputValues.foundersShares) +
            parseFloat(inputValues.nonFoundersShares) +
            parseFloat(inputValues.optionsIssued);

        // Assuming a share price for new round (can be another input)
        const sharePrice = parseFloat(inputValues.valuation) / totalShares;

        // Calculate SAFE share results
        const safeShareResults = safeRows.map((row) => {
            const amount = parseFloat(row.amount.replace(/[^0-9.-]+/g, "")); // Remove non-numeric characters
            const discount = parseFloat(row.discount);
            const valuationCap = parseFloat(row.valuationCap);
            const shares = calculateSafeShares(
                amount,
                discount,
                valuationCap,
                sharePrice,
                row.isPostMoney
            );
            return shares;
        });

        // Calculate new round share results
        const newRoundShareResults = newRoundRows.map((row) => {
            const amount = parseFloat(row.amount.replace(/[^0-9.-]+/g, "")); // Remove non-numeric characters
            const shares = calculateNewRoundShares(amount, sharePrice);
            return shares;
        });

        // Calculate total ownership
        const totalOwnership =
            safeShareResults.reduce((acc, shares) => acc + shares, 0) +
            newRoundShareResults.reduce((acc, shares) => acc + shares, 0);

        setCalculatedResults({
            safeShareCalculations: safeShareResults,
            newRoundShareCalculations: newRoundShareResults,
            totalShares: totalShares,
            totalOwnership: totalOwnership,
        });
    }, [inputValues, safeRows, newRoundRows]);

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setInputValues((prevValues) => {
            const updatedValues = {
                ...prevValues,
                [name]: value,
            };

            // Update sessionStorage after the state has been updated
            sessionStorage.setItem(
                "inputValues",
                JSON.stringify(updatedValues)
            );
            return updatedValues;
        });
    };
    // Handle adding/removing rows for SAFE Notes
    const handleSafeRowChange = (
        index: number,
        field: string,
        value: string
    ) => {
        const updatedRows = [...safeRows];
        updatedRows[index][field] = value;
        setSafeRows(updatedRows);
        sessionStorage.setItem("safeRows", JSON.stringify(updatedRows));
    };

    const addSafeRow = () =>
        setSafeRows([
            ...safeRows,
            {
                name: "",
                amount: "",
                discount: "",
                valuationCap: "",
                isPostMoney: false,
            },
        ]);

    const removeSafeRow = (index: number) => {
        if (safeRows.length > 1) {
            const updatedRows = safeRows.filter((_, i) => i !== index);
            setSafeRows(updatedRows);
        }
    };

    // Handle adding/removing rows for New Round Investors
    const handleNewRoundRowChange = (
        index: number,
        field: string,
        value: string
    ) => {
        const updatedRows = [...newRoundRows];
        updatedRows[index][field] = value;
        setNewRoundRows(updatedRows);
        sessionStorage.setItem("newRoundRows", JSON.stringify(updatedRows));
    };

    const addNewRoundRow = () =>
        setNewRoundRows([...newRoundRows, { name: "", amount: "" }]);

    const removeNewRoundRow = (index: number) => {
        if (newRoundRows.length > 1) {
            const updatedRows = newRoundRows.filter((_, i) => i !== index);
            setNewRoundRows(updatedRows);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 p-6">
            <section className="space-y-6 border rounded-xl p-4 ">
                {/* Current Cap Table */}
                <h2 className="text-xl font-semibold text-gray-800">
                    Current Cap Table
                </h2>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label
                            htmlFor="foundersShares"
                            className="block text-sm font-medium text-gray-600"
                        >
                            # of shares - Founders
                        </label>
                        <input
                            type="text"
                            id="foundersShares"
                            name="foundersShares"
                            value={formatNumberWithCommas(
                                inputValues.foundersShares
                            )}
                            onChange={handleInputChange}
                            className="mt-2 p-2 w-full border rounded-md"
                            placeholder="Enter number of shares"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="nonFoundersShares"
                            className="block text-sm font-medium text-gray-600"
                        >
                            # of shares - Non Founders
                        </label>
                        <input
                            type="text"
                            id="nonFoundersShares"
                            name="nonFoundersShares"
                            value={formatNumberWithCommas(
                                inputValues.nonFoundersShares
                            )}
                            onChange={handleInputChange}
                            className="mt-2 p-2 w-full border rounded-md"
                            placeholder="Enter number of shares"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="optionsIssued"
                            className="block text-sm font-medium text-gray-600"
                        >
                            # of Options Issued
                        </label>
                        <input
                            type="text"
                            id="optionsIssued"
                            name="optionsIssued"
                            value={formatNumberWithCommas(
                                inputValues.optionsIssued
                            )}
                            onChange={handleInputChange}
                            className="mt-2 p-2 w-full border rounded-md"
                            placeholder="Enter number of options"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="optionsRemaining"
                            className="block text-sm font-medium text-gray-600"
                        >
                            # of Options Remaining
                        </label>
                        <input
                            type="text"
                            id="optionsRemaining"
                            name="optionsRemaining"
                            value={formatNumberWithCommas(
                                inputValues.optionsRemaining
                            )}
                            onChange={handleInputChange}
                            className="mt-2 p-2 w-full border rounded-md"
                            placeholder="Enter number of options"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="promisedShares"
                            className="block text-sm font-medium text-gray-600"
                        >
                            # of Promised Shares
                        </label>
                        <input
                            type="text"
                            id="promisedShares"
                            name="promisedShares"
                            value={formatNumberWithCommas(
                                inputValues.promisedShares
                            )}
                            onChange={handleInputChange}
                            className="mt-2 p-2 w-full border rounded-md"
                            placeholder="Enter promised shares"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="futureOptionPoolSize"
                            className="block text-sm font-medium text-gray-600"
                        >
                            Future Option Pool Size (%)
                        </label>
                        <div className="flex items-center w-full ">
                            <input
                                type="range"
                                id="futureOptionPoolSize"
                                name="futureOptionPoolSize"
                                value={inputValues.futureOptionPoolSize}
                                min="1"
                                max="100"
                                step="1"
                                onChange={handleInputChange}
                                className="mt-2 w-full h-2 bg-gray-200 rounded-lg focus:outline-none focus:ring-0"
                            />
                            <span className="ml-2">
                                {inputValues.futureOptionPoolSize}%
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* SAFE Notes Section */}
            <section className="space-y-6 border rounded-xl p-4">
                <h2 className="text-xl font-semibold text-gray-800">
                    SAFE Notes
                </h2>
                {/* Column Titles */}
                <div className="flex space-x-4 font-semibold text-gray-600 mb-2">
                    <div className="w-1/5">Investor Name</div>
                    <div className="w-1/5">Amount</div>
                    <div className="w-1/5">Discount (%)</div>
                    <div className="w-1/5">Valuation Cap</div>
                    <div className="w-1/5">Type</div>
                </div>
                <div className="space-y-4">
                    {safeRows.map((row, index) => (
                        <div
                            key={index}
                            className="flex items-center space-x-4"
                        >
                            <input
                                type="text"
                                name={`safeRowName_${index}`}
                                value={row.name}
                                onChange={(e) =>
                                    handleSafeRowChange(
                                        index,
                                        "name",
                                        e.target.value
                                    )
                                }
                                placeholder="Investor Name"
                                className="p-2 w-full border rounded-md"
                            />
                            <input
                                type="text"
                                name={`safeRowAmount_${index}`}
                                value={formatWithDollarSign(row.amount)}
                                onChange={(e) =>
                                    handleSafeRowChange(
                                        index,
                                        "amount",
                                        e.target.value
                                    )
                                }
                                placeholder="Amount"
                                className="p-2 w-full border rounded-md"
                            />
                            <input
                                type="number"
                                name={`safeRowDiscount_${index}`}
                                value={row.discount}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    // Set value to a number between 1 and 100, but do not clamp during input
                                    if (
                                        value === "" ||
                                        (parseInt(value, 10) >= 1 &&
                                            parseInt(value, 10) <= 100)
                                    ) {
                                        handleSafeRowChange(
                                            index,
                                            "discount",
                                            value
                                        );
                                    }
                                }}
                                placeholder="Discount (%)"
                                className="p-2 w-full border rounded-md"
                            />
                            <input
                                type="text"
                                name={`safeRowValuationCap_${index}`}
                                value={formatWithDollarSign(row.valuationCap)}
                                onChange={(e) =>
                                    handleSafeRowChange(
                                        index,
                                        "valuationCap",
                                        e.target.value
                                    )
                                }
                                placeholder="Valuation Cap"
                                className="p-2 w-full border rounded-md"
                            />
                            <select
                                name={`safeRowPostMoney_${index}`}
                                value={row.isPostMoney ? "post" : "pre"}
                                onChange={(e) =>
                                    handleSafeRowChange(
                                        index,
                                        "isPostMoney",
                                        e.target.value === "post"
                                    )
                                }
                                className="p-2 w-full border rounded-md"
                            >
                                <option value="pre">Pre Money</option>
                                <option value="post">Post Money</option>
                            </select>
                            <button
                                onClick={() => removeSafeRow(index)}
                                disabled={safeRows.length <= 1}
                                className="p-2 text-red-500"
                            >
                                {safeRows.length > 1 ? "-" : ""}
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={addSafeRow}
                        className="p-2 text-blue-500"
                    >
                        + Add Investor
                    </button>
                </div>
            </section>

            {/* New Priced Round Section */}
            <section className="space-y-6 border rounded-xl p-4">
                <h2 className="text-xl font-semibold text-gray-800">
                    New Priced Round
                </h2>
                <div className="space-y-4">
                    <div className="flex space-x-6">
                        <div className="flex-1">
                            <label
                                htmlFor="valuation"
                                className="block text-sm font-medium text-gray-600"
                            >
                                Valuation
                            </label>
                            <input
                                type="text"
                                id="valuation"
                                name="valuation"
                                value={formatWithDollarSign(
                                    inputValues.valuation
                                )}
                                onChange={handleInputChange}
                                className="mt-2 p-2 w-full border rounded-md"
                                placeholder="Enter valuation"
                            />
                        </div>
                        <div className="flex-1">
                            <label
                                htmlFor="prePostToggle"
                                className="block text-sm font-medium text-gray-600"
                            >
                                Pre/Post Toggle
                            </label>
                            <select
                                id="prePostToggle"
                                name="prePostToggle"
                                value={inputValues.prePostToggle}
                                onChange={(e) => {
                                    handleInputChange(e); // call handleInputChange directly
                                }}
                                className="mt-2 p-2 w-full border rounded-md"
                            >
                                <option value="pre">Pre Money</option>
                                <option value="post">Post Money</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 ">
                    {newRoundRows.map((row, index) => (
                        <div
                            key={index}
                            className="flex items-center space-x-4"
                        >
                            <input
                                type="text"
                                name={`newRoundRowName_${index}`}
                                value={row.name}
                                onChange={(e) =>
                                    handleNewRoundRowChange(
                                        index,
                                        "name",
                                        e.target.value
                                    )
                                }
                                placeholder="Investor Name"
                                className="p-2 w-full border rounded-md"
                            />
                            <input
                                type="text"
                                name={`newRoundRowAmount_${index}`}
                                value={formatWithDollarSign(row.amount)}
                                onChange={(e) =>
                                    handleNewRoundRowChange(
                                        index,
                                        "amount",
                                        e.target.value
                                    )
                                }
                                placeholder="Amount"
                                className="p-2 w-full border rounded-md"
                            />
                            <button
                                onClick={() => removeNewRoundRow(index)}
                                disabled={newRoundRows.length <= 1}
                                className="p-2 text-red-500"
                            >
                                {newRoundRows.length > 1 ? "-" : ""}
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={addNewRoundRow}
                        className="p-2 text-blue-500"
                    >
                        + Add Investor
                    </button>
                </div>
            </section>

            {/* Results Section */}
            <section className="space-y-6 border rounded-xl p-4">
                <h2 className="text-xl font-semibold text-gray-800">Results</h2>
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="border p-2">Investor</th>
                            <th className="border p-2">Shares Allocated</th>
                            <th className="border p-2">Ownership %</th>
                        </tr>
                    </thead>
                    <tbody>
                        {safeRows.map((row, index) => (
                            <tr key={index}>
                                <td className="border p-2">{row.name}</td>
                                <td className="border p-2">
                                    {
                                        calculatedResults.safeShareCalculations[
                                            index
                                        ]
                                    }
                                </td>
                                <td className="border p-2">
                                    {(
                                        (calculatedResults
                                            .safeShareCalculations[index] /
                                            calculatedResults.totalShares) *
                                        100
                                    ).toFixed(2)}
                                    %
                                </td>
                            </tr>
                        ))}

                        {newRoundRows.map((row, index) => (
                            <tr key={index}>
                                <td className="border p-2">{row.name}</td>
                                <td className="border p-2">
                                    {
                                        calculatedResults
                                            .newRoundShareCalculations[index]
                                    }
                                </td>
                                <td className="border p-2">
                                    {(
                                        (calculatedResults
                                            .newRoundShareCalculations[index] /
                                            calculatedResults.totalShares) *
                                        100
                                    ).toFixed(2)}
                                    %
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Total Ownership Display */}
                <div className="text-lg font-semibold">
                    Total Ownership:{" "}
                    {calculatedResults.totalOwnership.toFixed(2)} shares
                </div>
            </section>
        </main>
    );
};

export default Page;
