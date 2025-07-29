'use client';

import DefaultLayout from '@/components/layouts/DefaultLayout';
import { db } from '@/lib/firebase/firebaseConfig';
import { columns, formatDateFirebase, formatRupiah } from '@/utils/helper';
import {
    getKeyValue,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from '@heroui/react';
import { collection, query, where, getDocs } from 'firebase/firestore';

import React, { useEffect, useState } from 'react';

type Row = {
    key: string;
    name: string;
    status: string;
    tanggal_pinjam: string;
    tanggal_kembali: string;
    denda: string;
};

const Page = () => {
    const [rows, setRows] = useState<Row[]>([]);

    useEffect(() => {
        const fetchBorrowings = async () => {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (!user.uid) return;

            const q = query(
                collection(db, 'borrowings'),
                where('user_id', '==', user.uid)
            );

            const snapshot = await getDocs(q);
            const fetchedRows: Row[] = [];

            snapshot.forEach((docSnap: any) => {
                const data = docSnap.data();
                const dendaRaw = data.denda || 0;

                // Hanya masukkan jika denda > 0
                if (dendaRaw > 0) {
                    const tanggalPinjam = data.tanggal_pinjam
                    const tanggalKembali = data.tanggal_kembali

                    fetchedRows.push({
                        key: docSnap.id,
                        name: data.book_title || '-',
                        status: data.status || '-',
                        tanggal_pinjam: formatDateFirebase(tanggalPinjam),
                        tanggal_kembali: formatDateFirebase(tanggalKembali),
                        denda: formatRupiah(dendaRaw),
                    });
                }
            });

            setRows(fetchedRows);
        };

        fetchBorrowings();
    }, []);

    return (
        <DefaultLayout>
            <div className="mt-5 mb-4">
                <h1 className="text-xl font-bold text-primaryGreen italic mb-2">
                    Denda Peminjaman
                </h1>
                <Table classNames={{
                    th: "bg-secondaryGreen text-white",
                }}>
                    <TableHeader columns={columns}>
                        {(column) => (
                            <TableColumn key={column.key}>{column.label}</TableColumn>
                        )}
                    </TableHeader>
                    <TableBody items={rows}>
                        {(item) => (
                            <TableRow key={item.key}>
                                {(columnKey) => (
                                    <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                                )}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </DefaultLayout>
    );
};

export default Page;
