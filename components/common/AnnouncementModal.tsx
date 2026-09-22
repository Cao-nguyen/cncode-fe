"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, BookOpen, AlertCircle } from "lucide-react";

export default function AnnouncementModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Kiểm tra xem người dùng đã đóng modal chưa trong 24h qua
    const closedData = localStorage.getItem("announcementClosed");
    const now = new Date().getTime();

    if (!closedData) {
      // Chưa từng đóng modal
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Kiểm tra xem đã hết 24h chưa
      const closedTime = parseInt(closedData);
      const hoursPassed = (now - closedTime) / (1000 * 60 * 60);

      if (hoursPassed >= 24) {
        // Đã quá 24h, mở lại modal
        const timer = setTimeout(() => {
          setOpen(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    // Lưu thời gian đóng modal (timestamp)
    localStorage.setItem("announcementClosed", new Date().getTime().toString());
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            THÔNG BÁO QUAN TRỌNG
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Cập nhật về lộ trình phát triển website
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Nâng cấp hệ thống khoá học
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Website xin phép tạm ngưng mọi hoạt động liên quan đến khoá học hiện tại để tập trung xây dựng và phát triển khoá học miễn phí Tin học 10, 11, 12 theo chương trình Sách giáo khoa thống nhất cả nước.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-amber-50 dark:bg-slate-800 border border-amber-100 dark:border-slate-700">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                  Tạm ngưng hệ thống thi & kiểm tra
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Chức năng thi và kiểm tra sẽ tạm thời ngưng hoạt động trong giai đoạn nâng cấp.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-green-50 dark:bg-slate-800 border border-green-100 dark:border-slate-700">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                  Lịch trình cập nhật
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Đến hết ngày <span className="font-bold text-green-700 dark:text-green-300">30/09/2026</span>, website sẽ hoàn tất việc cập nhật và bổ sung nhiều bài tập mới để phục vụ nhu cầu học tập của các em học sinh.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 italic">
              Rất mong Quý người dùng thông cảm và tiếp tục đồng hành cùng chúng tôi trong hành trình mang lại trải nghiệm học tập tốt hơn!
            </p>
            <p className="text-center text-sm font-semibold text-gray-800 dark:text-gray-200 mt-2">
              Xin chân thành cảm ơn! 🙏
            </p>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button
            onClick={handleClose}
            className="px-8 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-200"
          >
            Tôi đã hiểu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
