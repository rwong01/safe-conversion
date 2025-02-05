import React, { useState, useEffect } from "react";

const Index = () => {
    // State for form inputs
    const [investorName, setInvestorName] = useState("");
    const [investmentAmount, setInvestmentAmount] = useState("");
    const [valuationCap, setValuationCap] = useState("");
    const [prePost, setPrePost] = useState("pre");
    const [discountRate, setDiscountRate] = useState(100);

    const [foundersShares, setFoundersShares] = useState("");
    const [nonFounderShares, setNonFounderShares] = useState("");
    const [optionsIssued, setOptionsIssued] = useState("");
    const [optionsRemaining, setOptionsRemaining] = useState("");
    const [promisedShares, setPromisedShares] = useState("");
    const [futureOptionPool, setFutureOptionPool] = useState("");

    const [newInvestorName, setNewInvestorName] = useState("");
    const [newInvestmentAmount, setNewInvestmentAmount] = useState("");
    const [newValuation, setNewValuation] = useState("");
    const [newPrePost, setNewPrePost] = useState("pre");

    // State for calculations
    const [calculatedData, setCalculatedData] = useState(null);

    // Handle calculation logic
    useEffect(() => {
        if (
            investorName &&
            investmentAmount &&
            valuationCap &&
            foundersShares
        ) {
            // Insert calculation logic here
            // Example: Let's calculate the share price based on valuation cap and amount

            // Calculate Pre/Post-Money Valuation
            const preMoneyValuation =
                prePost === "post"
                    ? newValuation - newInvestmentAmount
                    : newValuation;
            const postMoneyValuation =
                prePost === "pre"
                    ? newValuation + newInvestmentAmount
                    : newValuation;

            // Calculate fully diluted shares before and after conversion
            const fullyDilutedBefore =
                Number(foundersShares) +
                Number(nonFounderShares) +
                Number(optionsIssued) +
                Number(optionsRemaining);

            const fullyDilutedAfterConversion =
                fullyDilutedBefore + Number(investmentAmount); // Example calculation

            // Calculate shares for SAFE holders
            const safeSharePrice = valuationCap / fullyDilutedBefore;

            const calculated = {
                preMoneyValuation,
                postMoneyValuation,
                fullyDilutedBefore,
                fullyDilutedAfterConversion,
                safeSharePrice,
            };

            setCalculatedData(calculated);
        }
    }, [
        investorName,
        investmentAmount,
        valuationCap,
        prePost,
        discountRate,
        foundersShares,
        nonFounderShares,
        optionsIssued,
        optionsRemaining,
        promisedShares,
        futureOptionPool,
        newInvestorName,
        newInvestmentAmount,
        newValuation,
        newPrePost,
    ]);

    return (
        <div>
            <h1>SAFE & Dilution Calculator</h1>
            <form>
                <h2>Investor Details</h2>
                <input
                    type="text"
                    placeholder="Investor Name"
                    value={investorName}
                    onChange={(e) => setInvestorName(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Investment Amount"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Valuation Cap"
                    value={valuationCap}
                    onChange={(e) => setValuationCap(e.target.value)}
                />
                <select
                    value={prePost}
                    onChange={(e) => setPrePost(e.target.value)}
                >
                    <option value="pre">Pre-Money</option>
                    <option value="post">Post-Money</option>
                </select>
                <input
                    type="number"
                    placeholder="Discount Rate"
                    value={discountRate}
                    onChange={(e) => setDiscountRate(e.target.value)}
                />

                <h2>Company Information</h2>
                <input
                    type="number"
                    placeholder="Founders Shares"
                    value={foundersShares}
                    onChange={(e) => setFoundersShares(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Non-Founder Shares"
                    value={nonFounderShares}
                    onChange={(e) => setNonFounderShares(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Options Issued"
                    value={optionsIssued}
                    onChange={(e) => setOptionsIssued(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Options Remaining"
                    value={optionsRemaining}
                    onChange={(e) => setOptionsRemaining(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Promised Shares"
                    value={promisedShares}
                    onChange={(e) => setPromisedShares(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Future Option Pool (%)"
                    value={futureOptionPool}
                    onChange={(e) => setFutureOptionPool(e.target.value)}
                />

                <h2>New Investor Details</h2>
                <input
                    type="text"
                    placeholder="Investor Name"
                    value={newInvestorName}
                    onChange={(e) => setNewInvestorName(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Investment Amount"
                    value={newInvestmentAmount}
                    onChange={(e) => setNewInvestmentAmount(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Valuation"
                    value={newValuation}
                    onChange={(e) => setNewValuation(e.target.value)}
                />
                <select
                    value={newPrePost}
                    onChange={(e) => setNewPrePost(e.target.value)}
                >
                    <option value="pre">Pre-Money</option>
                    <option value="post">Post-Money</option>
                </select>
            </form>

            {calculatedData && (
                <div>
                    <h2>Results</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Pre-Money Valuation</th>
                                <th>Post-Money Valuation</th>
                                <th>Fully Diluted Shares (Before)</th>
                                <th>Fully Diluted Shares (After)</th>
                                <th>SAFE Share Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{calculatedData.preMoneyValuation}</td>
                                <td>{calculatedData.postMoneyValuation}</td>
                                <td>{calculatedData.fullyDilutedBefore}</td>
                                <td>
                                    {calculatedData.fullyDilutedAfterConversion}
                                </td>
                                <td>{calculatedData.safeSharePrice}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Index;
