'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Package, Phone, X, MapPin } from 'lucide-react';
import { getOrderUpdatesAction } from '@/app/actions';
import type { Order } from '@/lib/types';

interface AdminOrderNotificationProps {
  password: string;
  isLoggedIn: boolean;
  onViewOrder?: () => void;
}

export function AdminOrderNotification({
  password,
  isLoggedIn,
  onViewOrder,
}: AdminOrderNotificationProps) {
  const [newOrder, setNewOrder] = useState<Order | null>(null);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!isLoggedIn || !password) return;

    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const poll = async () => {
      const res = await getOrderUpdatesAction(password);
      if (!res.success || !res.orders) return;

      if (!initializedRef.current) {
        res.orders.forEach((o) => knownIdsRef.current.add(o.id));
        initializedRef.current = true;
        return;
      }

      for (const order of res.orders) {
        if (!knownIdsRef.current.has(order.id)) {
          knownIdsRef.current.add(order.id);
          if (order.status === 'Pending') {
            setNewOrder(order);
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
              new Notification('🛒 নতুন অর্ডার এসেছে!', {
                body: `${order.customerName} • ${order.amount.toLocaleString()} BDT • ${order.orderNumber}`,
                tag: order.id,
              });
            }
          }
        }
      }
    };

    poll();
    const interval = setInterval(poll, 12000);
    return () => clearInterval(interval);
  }, [isLoggedIn, password]);

  return (
    <AnimatePresence>
      {newOrder && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-stone-950/50 backdrop-blur-sm pointer-events-auto"
            onClick={() => setNewOrder(null)}
          />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#f5b075]/40 overflow-hidden pointer-events-auto"
          >
            <div className="bg-[#1a234d] px-5 py-4 flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full animate-pulse">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-black text-sm">নতুন অর্ডার এসেছে!</h3>
                <p className="text-[#f5b075] text-xs">এখনই দেখুন ও কনফার্ম করুন</p>
              </div>
              <button
                onClick={() => setNewOrder(null)}
                className="p-1.5 hover:bg-white/20 rounded-full text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#1a234d]" />
                <span className="font-mono font-black text-[#1a234d] text-sm">{newOrder.orderNumber}</span>
                <span className="ml-auto font-black text-stone-900">{newOrder.amount.toLocaleString()} BDT</span>
              </div>

              <div className="space-y-2 text-sm">
                <p className="font-bold text-stone-900">{newOrder.customerName}</p>
                <p className="flex items-center gap-1.5 text-stone-500 text-xs">
                  <Phone className="w-3.5 h-3.5" /> {newOrder.phone}
                </p>
                <p className="flex items-start gap-1.5 text-stone-500 text-xs">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {newOrder.address}
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setNewOrder(null)}
                  className="flex-1 py-2.5 border border-stone-200 text-stone-600 text-xs font-bold rounded-lg hover:bg-stone-50 transition"
                >
                  পরে দেখব
                </button>
                <button
                  onClick={() => {
                    setNewOrder(null);
                    onViewOrder?.();
                  }}
                  className="flex-1 py-2.5 bg-[#1a234d] text-white text-xs font-bold rounded-lg hover:bg-[#f5b075] hover:text-[#1a234d] transition"
                >
                  অর্ডার দেখুন
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
