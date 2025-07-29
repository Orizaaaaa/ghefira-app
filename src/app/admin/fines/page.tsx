'use client';

import DefaultLayout from '@/components/layouts/DefaultLayout';
import { db } from '@/lib/firebase/firebaseConfig';
import { formatDateFirebase, formatRupiah } from '@/utils/helper';
import {
    getKeyValue,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Pagination,
    Input,
} from '@heroui/react';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';

type Row = {
    key: string;
    name: string;
    status: string;
    tanggal_pinjam: string;
    tanggal_kembali: string;
    tanggal_kembali_raw: Date;
    denda: string;
    user_name: string;
};

const columns = [
    { key: 'name', label: 'JUDUL BUKU' },
    { key: 'user_name', label: 'NAMA SISWA' },
    { key: 'status', label: 'STATUS' },
    { key: 'tanggal_pinjam', label: 'TANGGAL PINJAM' },
    { key: 'tanggal_kembali', label: 'TANGGAL KEMBALI' },
    { key: 'denda', label: 'DENDA' },
];

const PAGE_SIZE = 10;

const DendaPage = () => {
    const [rows, setRows] = useState<Row[]>([]);
    const [filteredRows, setFilteredRows] = useState<Row[]>([]);
    const [nameFilter, setNameFilter] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'borrowings'));
                const result: Row[] = [];

                snapshot.forEach((docSnap) => {
                    const data = docSnap.data();
                    const denda = data.denda || 0;

                    if (denda > 0) {
                        const tanggalKembali = new Date(data.tanggal_kembali.seconds * 1000);
                        result.push({
                            key: docSnap.id,
                            name: data.book_title || '-',
                            user_name: data.user_name || '-',
                            status: data.status || '-',
                            tanggal_pinjam: formatDateFirebase(data.tanggal_pinjam),
                            tanggal_kembali: formatDateFirebase(data.tanggal_kembali),
                            tanggal_kembali_raw: tanggalKembali,
                            denda: formatRupiah(denda),
                        });
                    }
                });

                // Sort: status "dikembalikan" paling bawah, lainnya urut tanggal_kembali ASC
                result.sort((a, b) => {
                    if (a.status === 'dikembalikan' && b.status !== 'dikembalikan') return 1;
                    if (a.status !== 'dikembalikan' && b.status === 'dikembalikan') return -1;
                    return a.tanggal_kembali_raw.getTime() - b.tanggal_kembali_raw.getTime();
                });

                setRows(result);
            } catch (error) {
                console.error('Gagal mengambil data denda:', error);
            }
        };

        fetchData();
    }, []);

    // Apply filter dan pagination
    useEffect(() => {
        let filtered = [...rows];

        if (nameFilter.trim() !== '') {
            filtered = filtered.filter((item) =>
                item.user_name.toLowerCase().includes(nameFilter.toLowerCase())
            );
        }

        setFilteredRows(filtered);
        setCurrentPage(1); // Reset halaman ke 1 saat filter berubah
    }, [nameFilter, rows]);

    // Hitung data untuk halaman saat ini
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const currentItems = filteredRows.slice(startIndex, startIndex + PAGE_SIZE);

    return (
        <DefaultLayout>
            <div className="mt-5 mb-4">
                <h1 className="text-xl font-bold text-primaryGreen italic mb-4">Semua Denda</h1>

                <div className="mb-4 w-full">
                    <Input
                        label="Cari Nama Siswa"
                        size="sm"
                        value={nameFilter}
                        onChange={(e) => setNameFilter(e.target.value)}
                    />
                </div>

                <Table isCompact classNames={{
                    th: "bg-secondaryGreen text-white",
                }}>
                    <TableHeader columns={columns}>
                        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                    </TableHeader>
                    <TableBody items={currentItems} emptyContent="Tidak ada data denda.">
                        {(item) => (
                            <TableRow key={item.key}>
                                {(columnKey) => (
                                    <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                                )}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {filteredRows.length > PAGE_SIZE && (
                    <div className="flex justify-end mt-4">
                        <Pagination
                            page={currentPage}
                            total={Math.ceil(filteredRows.length / PAGE_SIZE)}
                            onChange={(page) => setCurrentPage(page)}
                        />
                    </div>
                )}
            </div>
        </DefaultLayout>
    );
};

export default DendaPage;
