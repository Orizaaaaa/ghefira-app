import axios from "axios";
import { axiosInterceptor } from "./axiosInterceptor";
export const url = process.env.NEXT_PUBLIC_BASE_API

export const loginService = async (form: any, callback: any) => {
    await axios.post(`${url}/users/login`, form)
        .then((res) => {
            callback(true, res.data);
        }).catch((err) => {
            callback(false, err)
        })
}

// saldo
export const getAllSaldo = async () => {
    try {
        const res = await axiosInterceptor.get('/saldo/list');
        return res.data; // ✅ return data
    } catch (err) {
        console.error(err);
        return []; // atau null, tergantung kebutuhan
    }
};

export const createSaldo = async (form: any, callback: any) => {
    await axiosInterceptor.post('/saldo', form)
        .then((result) => {
            callback(result.data)
        }).catch((err) => {
            console.log(err);
        });
}

export const updateSaldo = async (id: any, form: any, callback: any) => {
    await axiosInterceptor.put(`/saldo/${id}`, form)
        .then((result) => {
            callback(result.data)
        }).catch((err) => {
            console.log(err);
        });
}

export const deleteSaldo = async (id: any) => {
    try {
        const result = await axiosInterceptor.delete(`/saldo/${id}`)
        return result.data; // ✅ return data langsung
    } catch (err) {
        console.error(err);
        throw err;
    }
}


// transaction
export const getAllTransaction = async () => {
    try {
        const res = await axiosInterceptor.get('/transaction/list');
        return res.data; // ✅ return data
    } catch (err) {
        console.error(err);
        return []; // atau null, tergantung kebutuhan
    }
}

export const createTransactionModel = async (form: any, callback: any) => {
    await axiosInterceptor.post('/transaction/models', form)
        .then((result) => {
            callback(result.data)
        }).catch((err) => {
            console.log(err);
        });
}


export const deleteTransaction = async (id: any) => {
    try {
        const result = await axiosInterceptor.delete(`/transaction/${id}`)
        return result.data; // ✅ return data langsung
    } catch (err) {
        console.error(err);
        throw err;
    }
}


export const updateTransaction = async (id: any, form: any, callback: any) => {
    await axiosInterceptor.put(`/transaction/${id}`, form)
        .then((result) => {
            callback(result.data)
        }).catch((err) => {
            console.log(err);
        });
}

export const createTransactionTrainModel = async (form: any, callback: any) => {
    await axiosInterceptor.post('/transaction', form)
        .then((result) => {
            callback(result.data)
        }).catch((err) => {
            console.log(err);
        });
}


// CAPSTER
export const getAllCapster = async () => {
    try {
        const res = await axiosInterceptor.get('/capster');
        return res.data; // ✅ return data
    } catch (err) {
        console.error(err);
        return []; // atau null, tergantung kebutuhan
    }
};

export const getCapsterById = (id: string, callback: any) => {
    axiosInterceptor(`/capster/${id}`)
        .then((result) => {
            callback(result.data)
        }).catch((err) => {
            console.log(err);
        });
}


export const createCapster = async (form: any, callback: any) => {
    await axiosInterceptor.post('/capster', form)
        .then((result) => {
            callback(result.data)
        }).catch((err) => {
            console.log(err);
        });
}


export const updateCapster = async (id: any, form: any, callback: any) => {
    await axiosInterceptor.put(`/capster/${id}`, form)
        .then((result) => {
            callback(result.data)
        }).catch((err) => {
            console.log(err);
        });
}

export const deleteCapster = async (id: any) => {
    try {
        const result = await axiosInterceptor.delete(`/capster/${id}`)
        return result.data; // ✅ return data langsung
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// category
export const createCategory = async (form: any, callback: any) => {
    await axiosInterceptor.post('/category', form)
        .then((result) => {
            callback(result.data)
        }).catch((err) => {
            console.log(err);
        });
}

export const getAllCategory = async () => {
    try {
        const res = await axiosInterceptor.get('/category/list');
        return res.data; // ✅ return data
    } catch (err) {
        console.error(err);
        return []; // atau null, tergantung kebutuhan
    }
};

export const deleteCategory = async (id: any, callback: any) => {
    await axiosInterceptor.delete(`/category/${id}`)
        .then((result) => {
            callback(result.data)
        }).catch((err) => {
            console.log(err);
        });
}

export const updateCategory = async (id: any, form: any, callback: any) => {
    await axiosInterceptor.put(`/category/${id}`, form)
        .then((result) => {
            callback(result.data)
        }).catch((err) => {
            console.log(err);
        });
}

export const getCapsterHours = (id: string, callback: any) => {
    axiosInterceptor(`/booking/time/${id}`)
        .then((result) => {
            callback(result.data)
        }).catch((err) => {
            console.log(err);
        });
}

