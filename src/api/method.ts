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

export const resetModels = async (callback: any) => {
    await axiosInterceptor.post('/transaction/reset-model')
        .then((result) => {
            callback(result.data)
        }).catch((err) => {
            console.log(err);
        });
}


export const getStatusModel = async (callback: any) => {
    await axiosInterceptor.get('/transaction/model-status')
        .then((result) => {
            callback(result.data)
        }).catch((err) => {
            console.log(err);
        });
}

export const trainDataset = async (callback: any) => {
    await axiosInterceptor.post('/transaction/train-model')
        .then((result) => {
            callback(result.data)
        }).catch((err) => {
            console.log(err);
        });
}

export const getSumaryMounth = async (
    month: number,
    year: number,
    callback: any
) => {
    try {
        const response = await axiosInterceptor.get('/dashboard/summary', {
            params: {
                month,
                year,
            },
        });
        callback(response.data);
    } catch (error) {
        console.error(error);
        callback(error);
    }
};

export const getSummaryPerMounth = async (
    year: number,
    callback: any
) => {
    try {
        const response = await axiosInterceptor.get(`/dashboard/chart/${year}`);
        callback(response);
    } catch (error) {
        console.error(error);
        callback(error);
    }
};



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

// accounting accounts
export const getAllAccountingAccounts = async () => {
    try {
        const res = await axiosInterceptor.get('/accounting/accounts');
        return res.data; 
        console.log(res.data);
        // ✅ return data
    } catch (err) {
        console.error(err);
        return []; // atau null, tergantung kebutuhan
    }
};

export const createAccountingAccount = async (form: any, callback: any) => {
    await axiosInterceptor.post('/accounting/accounts', form)
        .then((result) => {
            callback(result.data)
        }).catch((err) => {
            console.log(err);
        });
}

export const updateAccountingAccount = async (id: any, form: any, callback: any) => {
    await axiosInterceptor.put(`/accounting/accounts/${id}`, form)
        .then((result) => {
            callback(result.data)
        }).catch((err) => {
            console.log(err);
        });
}

export const deleteAccountingAccount = async (id: any) => {
    try {
        const result = await axiosInterceptor.delete(`/accounting/accounts/${id}`)
        return result.data; // ✅ return data langsung
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// journal entries
export const getAllJournalEntries = async () => {
    try {
        const res = await axiosInterceptor.get('/accounting/journal-entries');
        return res.data; 
        console.log(res.data);
        // ✅ return data
    } catch (err) {
        console.error(err);
        return []; // atau null, tergantung kebutuhan
    }
};

export const createJournalEntry = async (form: any, callback: any) => {
    await axiosInterceptor.post('/accounting/transactions', form)
        .then((result) => {
            callback(result.data)
        }).catch((err) => {
            console.log(err);
        });
}

export const updateJournalEntry = async (id: any, form: any, callback: any) => {
    await axiosInterceptor.put(`/accounting/journal-entries/${id}`, form)
        .then((result) => {
            callback(result.data)
        }).catch((err) => {
            console.log(err);
        });
}

export const deleteJournalEntry = async (id: any) => {
    try {
        const result = await axiosInterceptor.delete(`/accounting/journal-entries/${id}`)
        return result.data; // ✅ return data langsung
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// download journal entries as Excel
export const downloadJournalEntries = async (callback: any) => {
    await axiosInterceptor.get('/accounting/export/journal-entries', {
        responseType: 'blob',
    })
    .then((result) => {
        callback(result.data)
    }).catch((err) => {
        console.log(err);
        callback(null, err);
    });
}

