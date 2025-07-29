// services/firestore.ts
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, getDoc } from "firebase/firestore";
import { auth, db, storage } from "./firebaseConfig";
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

const collectionName = "items";


export const loginUser = async (email: string, password: string): Promise<any> => {
    try {
        // Autentikasi menggunakan email dan password
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // Ambil data user hanya dari Firestore
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error("Data pengguna tidak ditemukan di Firestore.");
        }

        // Kembalikan hanya data yang ada di Firestore
        return docSnap.data();
    } catch (error: any) {
        throw new Error(error.message || "Terjadi kesalahan saat login.");
    }
};

export const registerUser = async (email: string, password: string): Promise<any> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user; // Mengembalikan user setelah berhasil registrasi
    } catch (error) {
        console.error("Registrasi gagal:", error);
        throw new Error("Registrasi gagal. Periksa kembali data yang Anda masukkan.");
    }
};




// ------------------- Article -------------------

//create article    
export const createArticle = async (item: any): Promise<any> => {
    const docRef = await addDoc(collection(db, "articles"), item);
    return docRef.id;
};


// Read articles dengan id dan title
interface Article {
    id: string;
    title: string;
    description: string;
    image: string;
    time: Date; // atau gunakan Date jika ingin langsung memformat sebagai objek tanggal
}

export const getArticles = async (): Promise<Article[]> => {
    const querySnapshot = await getDocs(collection(db, "articles"));
    const items: Article[] = [];

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const timeData = data.time;

        // Konversi Timestamp ke Date
        const time = new Date(timeData.seconds * 1000 + timeData.nanoseconds / 1000000);

        items.push({
            id: doc.id,
            title: data.title || "",
            description: data.description || "",
            image: data.image || "",
            time: time  // Menyimpan waktu sebagai objek Date
        });
    });

    return items;
};
//read articles by id
export const getDetailArticle = async (id: string): Promise<any> => {
    const docRef = doc(db, "articles", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        throw new Error("Item tidak ditemukan");
    }
};


// edit article
export const updateArticle = async (id: string, updatedItem: Partial<any>): Promise<void> => {
    const docRef = doc(db, "articles", id);
    await updateDoc(docRef, updatedItem);
};

export const deleteArticle = async (id: string): Promise<void> => {
    const docRef = doc(db, "articles", id);
    await deleteDoc(docRef);
};



// ------------------- Information school -------------------

export const getSchoolInformation = async (docId: string) => {
    try {
        const docRef = doc(db, "informationSchool", docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data(); // Mengembalikan data dokumen
        } else {
            throw new Error("Dokumen tidak ditemukan!");
        }
    } catch (error) {
        console.error("Error saat mengambil data:", error);
        throw error;
    }
};

// Fungsi untuk memperbarui data
export const updateSchoolInformation = async (
    docId: string,
    updatedData: Partial<{ jumlah_guru: string; jumlah_siswa: string; ruang_kelas: string }>
) => {
    try {
        const docRef = doc(db, "informationSchool", docId);
        await updateDoc(docRef, updatedData);
        console.log("Data berhasil diperbarui!");
    } catch (error) {
        console.error("Error saat memperbarui data:", error);
        throw error;
    }
};


// ------------------- Visi Misi -------------------
export const getVisiMisi = async () => {
    const docId = "cAv7XPXTEZyDJNEYbKxl";
    try {
        const docRef = doc(db, "VisiMisi", docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data(); // Mengembalikan data dokumen
        } else {
            throw new Error("Dokumen tidak ditemukan!");
        }
    } catch (error) {
        console.error("Error saat mengambil data:", error);
        throw error;
    }
};


export const updateVisiMisi = async (
    updatedData: Partial<{ visi: string; misi: string; }>
) => {
    const docId = "cAv7XPXTEZyDJNEYbKxl";
    try {
        const docRef = doc(db, "VisiMisi", docId);
        await updateDoc(docRef, updatedData);
        console.log("Data berhasil diperbarui!");
    } catch (error) {
        console.error("Error saat memperbarui data:", error);
        throw error;
    }
};


// ------------------- Kepsek -------------------
export const getKepsek = async () => {
    const docId = "9s1K3UQFHkw5824lmht7";
    try {
        const docRef = doc(db, "kepsek", docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data(); // Mengembalikan data dokumen
        } else {
            throw new Error("Dokumen tidak ditemukan!");
        }
    } catch (error) {
        console.error("Error saat mengambil data:", error);
        throw error;
    }
};


export const updateKepsek = async (
    updatedData: Partial<{ message: string; }>
) => {
    const docId = "9s1K3UQFHkw5824lmht7";
    try {
        const docRef = doc(db, "kepsek", docId);
        await updateDoc(docRef, updatedData);
        console.log("Data berhasil diperbarui!");
    } catch (error) {
        console.error("Error saat memperbarui data:", error);
        throw error;
    }
};




// -------------------  sarana pra sarana -------------------
export const createGalery = async (item: any): Promise<any> => {
    const docRef = await addDoc(collection(db, "galery"), item);
    return docRef.id;
};

export const deleteGalery = async (docId: string): Promise<void> => {
    try {
        const docRef = doc(db, "galery", docId); // Referensi ke dokumen
        await deleteDoc(docRef); // Menghapus dokumen dari Firestore
        console.log(`Dokumen dengan ID "${docId}" berhasil dihapus.`);
    } catch (error) {
        console.error("Error saat menghapus dokumen:", error);
        throw new Error(`Gagal menghapus dokumen dengan ID "${docId}"`);
    }
};

export const getGalery = async () => {

    try {
        const collectionRef = collection(db, "galery");
        const snapshot = await getDocs(collectionRef);

        // Mengubah snapshot menjadi array dokumen
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error saat mengambil koleksi dokumen:", error);
        throw error;
    }
};


// -------------------  sarana pra sarana -------------------

export const createSarana = async (item: any): Promise<any> => {
    const docRef = await addDoc(collection(db, "sarana"), item);
    return docRef.id;
};


export const getSaranaImage = async () => {
    try {
        const collectionRef = collection(db, "sarana");
        const snapshot = await getDocs(collectionRef);

        // Mengubah snapshot menjadi array dokumen
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error saat mengambil koleksi dokumen:", error);
        throw error;
    }
};

export const getSarana = async () => {
    const docId = "wud60Pq6Vf0lkyQibInA";
    try {
        const docRef = doc(db, "osisAndEkstrakulikuler", docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data(); // Mengembalikan data dokumen
        } else {
            throw new Error("Dokumen tidak ditemukan!");
        }
    } catch (error) {
        console.error("Error saat mengambil data:", error);
        throw error;
    }
};


export const updateOsis = async (
    updatedData: Partial<{ osis: string; eksrakulikuler: string; }>
) => {
    const docId = "wud60Pq6Vf0lkyQibInA";
    try {
        const docRef = doc(db, "osisAndEkstrakulikuler", docId);
        await updateDoc(docRef, updatedData);
        console.log("Data berhasil diperbarui!");
    } catch (error) {
        console.error("Error saat memperbarui data:", error);
        throw error;
    }
};




export const deleteSarana = async (docId: string): Promise<void> => {
    try {
        const docRef = doc(db, "sarana", docId); // Referensi ke dokumen
        await deleteDoc(docRef); // Menghapus dokumen dari Firestore
        console.log(`Dokumen dengan ID "${docId}" berhasil dihapus.`);
    } catch (error) {
        console.error("Error saat menghapus dokumen:", error);
        throw new Error(`Gagal menghapus dokumen dengan ID "${docId}"`);
    }
};

// -------------------  calendar -------------------
export const createCalendar = async (item: any): Promise<any> => {
    const docRef = await addDoc(collection(db, "calendar"), item);
    return docRef.id;
};

export const getCalendar = async () => {
    try {
        const collectionRef = collection(db, "calendar");
        const snapshot = await getDocs(collectionRef);

        // Mengubah snapshot menjadi array dokumen
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error saat mengambil koleksi dokumen:", error);
        throw error;
    }
};



// ------------------- Image -------------------

//export image ke storage firebase
export const uploadImage = (file: File) => {
    return new Promise<string>((resolve, reject) => {
        // Buat referensi ke lokasi di Firebase Storage
        const storageRef = ref(storage, `images/${file.name}`);

        // Upload file ke Firebase Storage
        const uploadTask = uploadBytesResumable(storageRef, file);

        // Monitor status upload
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                // Progress upload dapat ditampilkan di sini (optional)
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log("Upload is " + progress + "% done");
            },
            (error) => {
                // Tangani kesalahan upload
                reject(error);
            },
            () => {
                // Dapatkan URL gambar setelah upload selesai
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL); // Kirim URL download gambar
                });
            }
        );
    });
};


// deleteImage
export const deleteImage = async (imagePath: string) => {
    const storage = getStorage();
    const imageRef = ref(storage, imagePath); // Buat referensi ke gambar berdasarkan path

    try {
        await deleteObject(imageRef); // Hapus gambar
        console.log("Gambar berhasil dihapus");
    } catch (error) {
        console.error("Error saat menghapus gambar:", error);
    }
};