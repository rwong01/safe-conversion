"use client";

import React from "react";
import "./globals.css";

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <html lang="en">
            <head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <title>SAFE Conversion Calculator</title>
            </head>
            <body className="bg-gray-50 min-h-screen flex flex-col">
                {/* Header */}
                <header className="text-white p-2">
                    <div className="container mx-auto flex justify-between items-center"></div>
                </header>
                {/* Main content */}
                <main className="flex-1">
                    <div className="max-w-6xl mx-auto p-6">
                        <h1 className="text-2xl py-4 font-semibold">
                            SAFE Conversion Calculator
                        </h1>

                        {children}
                    </div>{" "}
                    {/* Adjusted width */}
                </main>
                {/* Footer */}
                <footer className="text-white text-xs text-center p-4">
                    <p>
                        &copy; 2025 Rebecca Wong. All rights
                        reserved.
                    </p>
                </footer>
            </body>
        </html>
    );
};

export default Layout;
