"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

// Version để force reset khi có bản mới
const MODAL_VERSION = "1.0";

export default function AnnouncementModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Chỉ chạy trên client
    if (typeof window === 'undefined') return;

    console.log('📢 AnnouncementModal: Initializing...');

    // Kiểm tra localStorage
    const closedData = localStorage.getItem("announcementClosed");
    const storedVersion = localStorage.getItem("announcementVersion");
    const now = new Date().getTime();

    console.log('📢 Modal check:', { closedData, storedVersion, MODAL_VERSION });

    // Nếu version khác hoặc chưa từng đóng modal, luôn hiển thị
    if (storedVersion !== MODAL_VERSION || !closedData) {
      console.log('📢 Opening modal (version mismatch or first time)');
      const timer = setTimeout(() => setOpen(true), 1000);
      return () => clearTimeout(timer);
    }

    // Kiểm tra đã quá 24h chưa
    const closedTime = parseInt(closedData);
    const hoursPassed = (now - closedTime) / (1000 * 60 * 60);

    console.log('📢 Hours passed since closed:', hoursPassed);

    if (hoursPassed >= 24) {
      console.log('📢 Opening modal (24h passed)');
      const timer = setTimeout(() => setOpen(true), 1000);
      return () => clearTimeout(timer);
    } else {
      console.log('📢 Not opening modal (within 24h)');
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem("announcementClosed", new Date().getTime().toString());
    localStorage.setItem("announcementVersion", MODAL_VERSION);
    console.log('📢 Modal closed, stored time and version');
  };

  // Debug function - gọi từ console: window.resetAnnouncementModal()
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).resetAnnouncementModal = () => {
        localStorage.removeItem('announcementClosed');
        localStorage.removeItem('announcementVersion');
        console.log('📢 Modal reset! Refreshing...');
        location.reload();
      };
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md mx-auto p-6 border-2 border-blue-200 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
              Thông báo quan trọng
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2 text-sm text-gray-700 dark:text-gray-300">
          <p className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Website tạm ngưng hoạt động khoá học để chuẩn bị khoá học miễn phí Tin học 10, 11, 12 theo chương trình SGK thống nhất.</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-amber-600 dark:text-amber-400">•</span>
            <span>Hệ thống thi & kiểm tra tạm thời ngưng hoạt động.</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">•</span>
            <span>Đến 30/09/2026 sẽ cập nhật nhiều bài tập mới.</span>
          </p>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-slate-700 mt-4">
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-4">
            Rất mong Quý người dùng thông cảm!
          </p>
          <Button
            onClick={handleClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Đã hiểu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
