import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Package, AlertTriangle, ClipboardList, Loader2, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { notificationService } from '../services/notificationService';
import { Notification, PageResponse } from '../types';
import EmptyState from '../components/EmptyState';

const getRelativeTime = (dateStr: string) => {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return '';
  }
};

const getNotificationIcon = (type: string) => {
  if (type.startsWith('SLA_')) return <AlertTriangle size={18} className="text-warning-500" />;
  if (type.startsWith('PART_')) return <Package size={18} className="text-accent-500" />;
  return <ClipboardList size={18} className="text-accent-600" />;
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<PageResponse<Notification> | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(0);
  const size = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll(page, size);
      setNotifications(res);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const displayedNotifications = notifications?.content.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  }) || [];

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          content: prev.content.map((n) => ({ ...n, read: true })),
        };
      });
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark notifications');
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await notificationService.markAsRead(notification.id);
        setNotifications((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            content: prev.content.map((n) =>
              n.id === notification.id ? { ...n, read: true } : n
            ),
          };
        });
      } catch {
        // silent
      }
    }

    if (notification.referenceType === 'WorkOrder' && notification.referenceId) {
      navigate(`/work-orders/${notification.referenceId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-700 tracking-tight">Notifications</h1>
          <p className="text-body text-neutral-400 mt-0.5">Stay updated on job updates, SLA alerts, and parts activity</p>
        </div>
        <button
          onClick={markAllRead}
          className="btn-secondary"
        >
          <CheckCheck size={16} />
          Mark All as Read
        </button>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex rounded-control border border-neutral-200 overflow-hidden p-0.5 bg-neutral-50">
            <button
              onClick={() => { setFilter('all'); setPage(0); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-control transition-all ${
                filter === 'all' ? 'bg-white text-neutral-700 shadow-sm-subtle' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => { setFilter('unread'); setPage(0); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-control transition-all ${
                filter === 'unread' ? 'bg-white text-neutral-700 shadow-sm-subtle' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Unread
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-accent-500" />
          </div>
        ) : displayedNotifications.length === 0 ? (
          <EmptyState
            title="No notifications"
            description={filter === 'unread' ? "You're all caught up with your notifications!" : "You will receive updates here when work orders or alerts occur"}
          />
        ) : (
          <>
            <div className="space-y-2">
              {displayedNotifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full text-left p-3.5 rounded-card border transition-all ${
                    n.read
                      ? 'border-neutral-100 bg-white hover:bg-neutral-50/70'
                      : 'border-accent-200 bg-accent-50/40 hover:bg-accent-50/70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 p-2 rounded-control flex-shrink-0 ${
                      n.read ? 'bg-neutral-50' : 'bg-white shadow-sm-subtle'
                    }`}>
                      {getNotificationIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold truncate ${n.read ? 'text-neutral-700' : 'text-neutral-800'}`}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="w-2 h-2 bg-accent-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className={`text-sm mt-0.5 line-clamp-2 ${n.read ? 'text-neutral-500' : 'text-neutral-600'}`}>
                        {n.message}
                      </p>
                      <p className="text-caption text-neutral-400 mt-1">
                        {getRelativeTime(n.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {notifications && notifications.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-100">
                <p className="text-caption text-neutral-400">
                  Showing {notifications.page * notifications.size + 1} to{' '}
                  {Math.min((notifications.page + 1) * notifications.size, notifications.totalElements)} of{' '}
                  {notifications.totalElements} notifications
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={notifications.first}
                    className="btn-secondary"
                  >
                    Previous
                  </button>
                  <span className="text-caption text-neutral-500 px-2">
                    Page {notifications.page + 1} of {notifications.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={notifications.last}
                    className="btn-secondary"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
