'use client'

import DefaultLayout from "@/components/layouts/DefaultLayout"
import { Card, CardBody, Tab, Tabs } from "@heroui/react"
import { getIncomeStatement, getBalanceSheet, getCashFlowStatement } from '@/api/method'
import { formatRupiah } from '@/utils/helper'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface Account {
    name: string;
    code: string;
    amount: number;
    actual_balance?: number;
}

interface IncomeStatementData {
    revenue: {
        accounts: Account[];
        total: number;
    };
    expenses: {
        accounts: Account[];
        total: number;
    };
    net_income: number;
}

interface BalanceSheetData {
    assets: {
        accounts: Account[];
        total: number;
    };
    liabilities: {
        accounts: Account[];
        total: number;
    };
    equity: {
        accounts: Account[];
        total: number;
    };
}

interface AccountingEquation {
    assets_actual: number;
    liabilities_actual: number;
    equity_actual: number;
    liabilities_plus_equity: number;
    is_balanced: boolean;
    difference: number;
}

interface CashFlowData {
    operating_activities: number;
    investing_activities: number;
    financing_activities: number;
    net_cash_flow: number;
    beginning_cash: number;
    ending_cash: number;
}

export default function Page() {
    const [incomeData, setIncomeData] = useState<IncomeStatementData | null>(null);
    const [balanceData, setBalanceData] = useState<BalanceSheetData | null>(null);
    const [accountingEquation, setAccountingEquation] = useState<AccountingEquation | null>(null);
    const [cashFlowData, setCashFlowData] = useState<CashFlowData | null>(null);
    const [loading, setLoading] = useState({
        income: false,
        balance: false,
        cashflow: false
    });

    const fetchIncomeStatement = async () => {
        setLoading(prev => ({ ...prev, income: true }));
        try {
            const response = await getIncomeStatement();
            if (response && response.data) {
                setIncomeData(response.data.income_statement);
            }
        } catch (error) {
            console.error('Error fetching income statement:', error);
            toast.error('Gagal memuat Profit & Loss');
        } finally {
            setLoading(prev => ({ ...prev, income: false }));
        }
    };

    const fetchBalanceSheet = async () => {
        setLoading(prev => ({ ...prev, balance: true }));
        try {
            const response = await getBalanceSheet();
            if (response && response.data) {
                setBalanceData(response.data.balance_sheet);
                setAccountingEquation(response.data.accounting_equation);
            }
        } catch (error) {
            console.error('Error fetching balance sheet:', error);
            toast.error('Gagal memuat Balance Sheet');
        } finally {
            setLoading(prev => ({ ...prev, balance: false }));
        }
    };

    const fetchCashFlowStatement = async () => {
        setLoading(prev => ({ ...prev, cashflow: true }));
        try {
            const response = await getCashFlowStatement();
            if (response && response.data) {
                setCashFlowData(response.data.cash_flow_statement);
            }
        } catch (error) {
            console.error('Error fetching cash flow statement:', error);
            toast.error('Gagal memuat Cash Flow Statement');
        } finally {
            setLoading(prev => ({ ...prev, cashflow: false }));
        }
    };

    const handleTabChange = (key: string) => {
        switch (key) {
            case 'income':
                if (!incomeData) fetchIncomeStatement();
                break;
            case 'balance':
                if (!balanceData) fetchBalanceSheet();
                break;
            case 'cashflow':
                if (!cashFlowData) fetchCashFlowStatement();
                break;
        }
    };

    return (
        <DefaultLayout>
            <div className="flex w-full flex-col">
                <Tabs aria-label="Financial Reports" onSelectionChange={(key) => handleTabChange(key as string)}>
                    <Tab key="income" title="Profit & Loss">
                        <Card>
                            <CardBody>
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold text-gray-800">Profit & Loss</h2>
                                        <p className="text-gray-600">Laporan Laba Rugi</p>
                                    </div>

                                    {loading.income ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                            <p className="mt-2 text-gray-600">Memuat data...</p>
                                        </div>
                                    ) : incomeData ? (
                                        <div className="space-y-6">
                                            {/* Revenue Section */}
                                            <div className="bg-green-50 p-4 rounded-lg">
                                                <h3 className="text-lg font-semibold text-green-800 mb-3">Revenue</h3>
                                                <div className="space-y-2">
                                                    {incomeData.revenue.accounts.map((account, index) => (
                                                        <div key={index} className="flex justify-between items-center py-2 border-b border-green-200">
                                                            <div>
                                                                <span className="font-medium">{account.name}</span>
                                                                <span className="text-sm text-gray-600 ml-2">({account.code})</span>
                                                            </div>
                                                            <span className="font-semibold text-green-700">
                                                                {formatRupiah(Math.abs(account.amount))}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-between items-center py-2 font-bold text-lg border-t-2 border-green-300">
                                                        <span>Total Revenue</span>
                                                        <span className="text-green-700">{formatRupiah(Math.abs(incomeData.revenue.total))}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expenses Section */}
                                            <div className="bg-red-50 p-4 rounded-lg">
                                                <h3 className="text-lg font-semibold text-red-800 mb-3">Expenses</h3>
                                                <div className="space-y-2">
                                                    {incomeData.expenses.accounts.map((account, index) => (
                                                        <div key={index} className="flex justify-between items-center py-2 border-b border-red-200">
                                                            <div>
                                                                <span className="font-medium">{account.name}</span>
                                                                <span className="text-sm text-gray-600 ml-2">({account.code})</span>
                                                            </div>
                                                            <span className="font-semibold text-red-700">
                                                                {formatRupiah(account.amount)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-between items-center py-2 font-bold text-lg border-t-2 border-red-300">
                                                        <span>Total Expenses</span>
                                                        <span className="text-red-700">{formatRupiah(incomeData.expenses.total)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Net Income */}
                                            <div className={`p-4 rounded-lg ${incomeData.net_income >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xl font-bold">Net Income</span>
                                                    <span className={`text-2xl font-bold ${incomeData.net_income >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                                        {formatRupiah(Math.abs(incomeData.net_income))}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500">Klik untuk memuat Profit & Loss</p>
                                        </div>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    </Tab>

                    <Tab key="balance" title="Balance Sheet">
                        <Card>
                            <CardBody>
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold text-gray-800">Balance Sheet</h2>
                                        <p className="text-gray-600">Neraca</p>
                                    </div>

                                    {loading.balance ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                            <p className="mt-2 text-gray-600">Memuat data...</p>
                                        </div>
                                    ) : balanceData ? (
                                        <div className="space-y-6">
                                            {/* Assets */}
                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                <h3 className="text-lg font-semibold text-blue-800 mb-3">Assets</h3>
                                                <div className="space-y-2">
                                                    {balanceData.assets.accounts.map((account, index) => (
                                                        <div key={index} className="flex justify-between items-center py-2 border-b border-blue-200">
                                                            <div>
                                                                <span className="font-medium">{account.name}</span>
                                                                <span className="text-sm text-gray-600 ml-2">({account.code})</span>
                                                            </div>
                                                            <span className="font-semibold text-blue-700">
                                                                {formatRupiah(account.amount)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-between items-center py-2 font-bold text-lg border-t-2 border-blue-300">
                                                        <span>Total Assets</span>
                                                        <span className="text-blue-700">{formatRupiah(balanceData.assets.total)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Liabilities */}
                                            <div className="bg-orange-50 p-4 rounded-lg">
                                                <h3 className="text-lg font-semibold text-orange-800 mb-3">Liabilities</h3>
                                                <div className="space-y-2">
                                                    {balanceData.liabilities.accounts.map((account, index) => (
                                                        <div key={index} className="flex justify-between items-center py-2 border-b border-orange-200">
                                                            <div>
                                                                <span className="font-medium">{account.name}</span>
                                                                <span className="text-sm text-gray-600 ml-2">({account.code})</span>
                                                            </div>
                                                            <span className="font-semibold text-orange-700">
                                                                {formatRupiah(account.amount)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-between items-center py-2 font-bold text-lg border-t-2 border-orange-300">
                                                        <span>Total Liabilities</span>
                                                        <span className="text-orange-700">{formatRupiah(balanceData.liabilities.total)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Equity */}
                                            <div className="bg-purple-50 p-4 rounded-lg">
                                                <h3 className="text-lg font-semibold text-purple-800 mb-3">Equity</h3>
                                                <div className="space-y-2">
                                                    {balanceData.equity.accounts.map((account, index) => (
                                                        <div key={index} className="flex justify-between items-center py-2 border-b border-purple-200">
                                                            <div>
                                                                <span className="font-medium">{account.name}</span>
                                                                <span className="text-sm text-gray-600 ml-2">({account.code})</span>
                                                            </div>
                                                            <span className="font-semibold text-purple-700">
                                                                {formatRupiah(account.amount)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-between items-center py-2 font-bold text-lg border-t-2 border-purple-300">
                                                        <span>Total Equity</span>
                                                        <span className="text-purple-700">{formatRupiah(balanceData.equity.total)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Accounting Equation */}
                                            {accountingEquation && (
                                                <div className={`p-4 rounded-lg ${accountingEquation.is_balanced ? 'bg-green-100' : 'bg-red-100'}`}>
                                                    <h3 className="text-lg font-semibold mb-3">Accounting Equation</h3>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span>Assets (Actual)</span>
                                                            <span className="font-semibold">{formatRupiah(accountingEquation.assets_actual)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Liabilities + Equity (Actual)</span>
                                                            <span className="font-semibold">{formatRupiah(accountingEquation.liabilities_plus_equity)}</span>
                                                        </div>
                                                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                                                            <span>Balance Status</span>
                                                            <span className={accountingEquation.is_balanced ? 'text-green-700' : 'text-red-700'}>
                                                                {accountingEquation.is_balanced ? 'BALANCED' : 'NOT BALANCED'}
                                                            </span>
                                                        </div>
                                                        {!accountingEquation.is_balanced && (
                                                            <div className="flex justify-between text-red-600">
                                                                <span>Difference</span>
                                                                <span className="font-semibold">{formatRupiah(accountingEquation.difference)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500">Klik untuk memuat Balance Sheet</p>
                                        </div>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    </Tab>

                    <Tab key="cashflow" title="Cash Flow Statement">
                        <Card>
                            <CardBody>
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold text-gray-800">Cash Flow Statement</h2>
                                        <p className="text-gray-600">Laporan Arus Kas</p>
                                    </div>

                                    {loading.cashflow ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                            <p className="mt-2 text-gray-600">Memuat data...</p>
                                        </div>
                                    ) : cashFlowData ? (
                                        <div className="space-y-6">
                                            {/* Operating Activities */}
                                            <div className="bg-green-50 p-4 rounded-lg">
                                                <h3 className="text-lg font-semibold text-green-800 mb-3">Operating Activities</h3>
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium">Cash from Operations</span>
                                                    <span className="text-xl font-bold text-green-700">
                                                        {formatRupiah(cashFlowData.operating_activities)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Investing Activities */}
                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                <h3 className="text-lg font-semibold text-blue-800 mb-3">Investing Activities</h3>
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium">Cash from Investments</span>
                                                    <span className="text-xl font-bold text-blue-700">
                                                        {formatRupiah(cashFlowData.investing_activities)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Financing Activities */}
                                            <div className="bg-purple-50 p-4 rounded-lg">
                                                <h3 className="text-lg font-semibold text-purple-800 mb-3">Financing Activities</h3>
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium">Cash from Financing</span>
                                                    <span className="text-xl font-bold text-purple-700">
                                                        {formatRupiah(cashFlowData.financing_activities)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Net Cash Flow */}
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Net Cash Flow</h3>
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium">Total Cash Flow</span>
                                                    <span className="text-xl font-bold text-gray-700">
                                                        {formatRupiah(cashFlowData.net_cash_flow)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Cash Position */}
                                            <div className="bg-yellow-50 p-4 rounded-lg">
                                                <h3 className="text-lg font-semibold text-yellow-800 mb-3">Cash Position</h3>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium">Beginning Cash</span>
                                                        <span className="font-semibold text-yellow-700">
                                                            {formatRupiah(cashFlowData.beginning_cash)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium">Ending Cash</span>
                                                        <span className="font-semibold text-yellow-700">
                                                            {formatRupiah(cashFlowData.ending_cash)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500">Klik untuk memuat Cash Flow Statement</p>
                                        </div>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    </Tab>
                </Tabs>
            </div>
        </DefaultLayout>
    )
}