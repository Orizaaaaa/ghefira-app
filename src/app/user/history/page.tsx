'use client';

import DefaultLayout from '@/components/layouts/DefaultLayout';
import { db } from '@/lib/firebase/firebaseConfig';
import { columns, formatRupiah } from '@/utils/helper';
import {
    getKeyValue,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Input,
} from '@heroui/react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';

type Row = {
    key: string;
    name: string;
    status: string;
    tanggal_pinjam: string;
    tanggal_kembali: string;
    raw_tanggal_kembali: Date | null;
    denda: string;
};

const Page = () => {
    const [rows, setRows] = useState<Row[]>([]);
    const [search, setSearch] = useState('');

    function formatDate(value: Timestamp | Date | null | undefined): string {
        if (!value) return '-';

        let date: Date;

        if (value instanceof Timestamp) {
            date = value.toDate();
        } else if (value instanceof Date) {
            date = value;
        } else {
            return '-';
        }

        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    }

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

                const tanggalPinjam = data.tanggal_pinjam;
                const tanggalKembali = data.tanggal_kembali;

                fetchedRows.push({
                    key: docSnap.id,
                    name: data.book_title || '-',
                    status: data.status || '-',
                    tanggal_pinjam: formatDate(tanggalPinjam),
                    tanggal_kembali: formatDate(tanggalKembali),
                    raw_tanggal_kembali: tanggalKembali instanceof Timestamp ? tanggalKembali.toDate() : null,
                    denda: formatRupiah(data.denda || 0),
                });
            });

            // Urutkan berdasarkan tanggal kembali (terbaru ke terlama)
            fetchedRows.sort((a, b) => {
                const dateA = a.raw_tanggal_kembali ? a.raw_tanggal_kembali.getTime() : 0;
                const dateB = b.raw_tanggal_kembali ? b.raw_tanggal_kembali.getTime() : 0;
                return dateB - dateA;
            });

            setRows(fetchedRows);
        };

        fetchBorrowings();
    }, []);

    // Filter berdasarkan nama buku
    const filteredRows = rows.filter((row) =>
        row.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DefaultLayout>
            <div className="mt-5 mb-4">
                <h1 className="text-xl font-bold text-primaryGreen italic mb-2">
                    Riwayat Peminjaman
                </h1>

                <Input
                    isClearable
                    type="text"
                    variant="bordered"
                    placeholder="Cari berdasarkan nama buku..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="mb-4 w-full max-w-sm"
                />

                <Table
                    classNames={{
                        th: 'bg-secondaryGreen text-white',
                    }}
                >
                    <TableHeader columns={columns}>
                        {(column) => (
                            <TableColumn key={column.key}>{column.label}</TableColumn>
                        )}
                    </TableHeader>
                    <TableBody items={filteredRows}>
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
