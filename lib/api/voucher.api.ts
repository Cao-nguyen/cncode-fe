// lib/api/voucher.api.ts
import {
    ICreateVoucherDto,
    IUpdateVoucherDto,
    IAssignVoucherDto,
    IApplyVoucherDto,
    IVoucher,
    IUserVoucher
} from '@/types/voucher.type';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const voucherApi = {
    // ============ USER API ============

    getMyVouchers: async (token: string, status?: string): Promise<{ success: boolean; data: IUserVoucher[] }> => {
        try {
            const url = status ? `${API_URL}/api/vouchers/user/vouchers?status=${status}` : `${API_URL}/api/vouchers/user/vouchers`;
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            return await res.json();
        } catch (error) {
            console.error('Get my vouchers error:', error);
            return { success: false, data: [] };
        }
    },

    applyVoucher: async (token: string, data: IApplyVoucherDto): Promise<{ success: boolean; data?: any; message?: string }> => {
        try {
            const res = await fetch(`${API_URL}/api/vouchers/user/vouchers/apply`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (error) {
            console.error('Apply voucher error:', error);
            return { success: false, message: 'Có lỗi xảy ra' };
        }
    },

    // ============ ADMIN API ============

    getAllVouchers: async (token: string, params?: { status?: string; search?: string }): Promise<{ success: boolean; data: IVoucher[] }> => {
        try {
            const query = new URLSearchParams();
            if (params?.status) query.append('status', params.status);
            if (params?.search) query.append('search', params.search);
            const url = `${API_URL}/api/vouchers/admin/vouchers${query.toString() ? `?${query.toString()}` : ''}`;
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            return await res.json();
        } catch (error) {
            console.error('Get all vouchers error:', error);
            return { success: false, data: [] };
        }
    },

    getVoucherById: async (token: string, id: string): Promise<{ success: boolean; data?: IVoucher; message?: string }> => {
        try {
            const res = await fetch(`${API_URL}/api/vouchers/admin/vouchers/${id}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            return await res.json();
        } catch (error) {
            console.error('Get voucher by id error:', error);
            return { success: false, message: 'Có lỗi xảy ra' };
        }
    },

    createVoucher: async (token: string, data: ICreateVoucherDto): Promise<{ success: boolean; data?: IVoucher; message?: string }> => {
        try {
            const res = await fetch(`${API_URL}/api/vouchers/admin/vouchers`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (error) {
            console.error('Create voucher error:', error);
            return { success: false, message: 'Có lỗi xảy ra' };
        }
    },

    updateVoucher: async (token: string, id: string, data: IUpdateVoucherDto): Promise<{ success: boolean; data?: IVoucher; message?: string }> => {
        try {
            const res = await fetch(`${API_URL}/api/vouchers/admin/vouchers/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (error) {
            console.error('Update voucher error:', error);
            return { success: false, message: 'Có lỗi xảy ra' };
        }
    },

    deleteVoucher: async (token: string, id: string): Promise<{ success: boolean; message?: string }> => {
        try {
            const res = await fetch(`${API_URL}/api/vouchers/admin/vouchers/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            return await res.json();
        } catch (error) {
            console.error('Delete voucher error:', error);
            return { success: false, message: 'Có lỗi xảy ra' };
        }
    },

    assignVoucherToUsers: async (token: string, data: IAssignVoucherDto): Promise<{ success: boolean; message?: string }> => {
        try {
            const res = await fetch(`${API_URL}/api/vouchers/admin/vouchers/assign`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (error) {
            console.error('Assign voucher error:', error);
            return { success: false, message: 'Có lỗi xảy ra' };
        }
    },

    getAssignableUsers: async (token: string, search?: string): Promise<{ success: boolean; data: { _id: string; fullName: string; email: string; avatar?: string }[] }> => {
        try {
            const url = search ? `${API_URL}/api/vouchers/admin/users/assignable?search=${encodeURIComponent(search)}` : `${API_URL}/api/vouchers/admin/users/assignable`;
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            return await res.json();
        } catch (error) {
            console.error('Get assignable users error:', error);
            return { success: false, data: [] };
        }
    },
};