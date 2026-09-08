import { Request, Response } from 'express';
import { Notice, User, Acknowledgement, Query, AuditLog } from '../models/Schemas';

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    
    // Counts
    const allNotices = await Notice.find({});
    const totalNotices = allNotices.length;
    
    const activeNotices = allNotices.filter(n => n.status === 'Published' && new Date(n.expiresAt) >= now && new Date(n.publishAt) <= now).length;
    const scheduledNotices = allNotices.filter(n => n.status === 'Scheduled' || (n.status === 'Approved' && new Date(n.publishAt) > now)).length;
    const expiredNotices = allNotices.filter(n => n.status === 'Expired' || new Date(n.expiresAt) < now).length;
    
    const totalStudents = await User.countDocuments({ role: 'STUDENT' });
    
    // Views and Acknowledgements summing
    let totalViews = 0;
    let totalAcks = 0;
    
    allNotices.forEach(n => {
      totalViews += n.views || 0;
      totalAcks += n.acknowledgements || 0;
    });

    const unansweredQueries = await Query.countDocuments({ status: 'Open' });

    // Category distribution
    const categoriesMap: Record<string, number> = {};
    // Department distribution
    const deptsMap: Record<string, number> = {};

    allNotices.forEach(n => {
      categoriesMap[n.category] = (categoriesMap[n.category] || 0) + 1;
      const deptKey = n.department || 'All';
      deptsMap[deptKey] = (deptsMap[deptKey] || 0) + 1;
    });

    const noticesByCategory = Object.entries(categoriesMap).map(([name, value]) => ({ name, value }));
    const noticesByDepartment = Object.entries(deptsMap).map(([name, value]) => ({ name, value }));

    // Most viewed (top 5)
    const mostViewed = [...allNotices]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(n => ({ title: n.title, views: n.views, category: n.category }));

    // Most acknowledged (top 5)
    const mostAcknowledged = [...allNotices]
      .sort((a, b) => (b.acknowledgements || 0) - (a.acknowledgements || 0))
      .slice(0, 5)
      .map(n => ({ title: n.title, acknowledgements: n.acknowledgements, category: n.category }));

    // Critical notice acknowledgement rate
    const criticalNotices = allNotices.filter(n => n.priority === 'CRITICAL' && n.status === 'Published');
    let totalCriticalAcks = 0;
    criticalNotices.forEach(n => {
      totalCriticalAcks += n.acknowledgements || 0;
    });

    // Total possible critical acks = total critical notices * total students
    const possibleCriticalAcks = criticalNotices.length * totalStudents;
    const criticalAckRate = possibleCriticalAcks > 0 
      ? Math.round((totalCriticalAcks / possibleCriticalAcks) * 100) 
      : 100;

    // Notice views over time (mock trends for graph)
    const viewsOverTime = [
      { date: 'Mon', views: Math.round(totalViews * 0.1) || 12 },
      { date: 'Tue', views: Math.round(totalViews * 0.15) || 25 },
      { date: 'Wed', views: Math.round(totalViews * 0.22) || 45 },
      { date: 'Thu', views: Math.round(totalViews * 0.18) || 38 },
      { date: 'Fri', views: Math.round(totalViews * 0.25) || 52 },
      { date: 'Sat', views: Math.round(totalViews * 0.06) || 15 },
      { date: 'Sun', views: Math.round(totalViews * 0.04) || 8 }
    ];

    // Student engagement metric: (Acks + Views) / total notices
    const engagementMetric = totalNotices > 0 
      ? Math.round(((totalViews + totalAcks) / (totalNotices * (totalStudents || 1))) * 100)
      : 0;

    return res.json({
      summary: {
        totalNotices,
        activeNotices,
        scheduledNotices,
        expiredNotices,
        totalStudents,
        totalViews,
        totalAcks,
        unansweredQueries
      },
      charts: {
        viewsOverTime,
        noticesByCategory,
        noticesByDepartment,
        mostViewed,
        mostAcknowledged,
        criticalAckRate,
        studentEngagementRate: Math.min(100, engagementMetric)
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error compiling analytics data' });
  }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const logs = await AuditLog.find({});
    // Sort logs descending by timestamp
    const sortedLogs = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return res.json(sortedLogs);
  } catch (err) {
    return res.status(500).json({ message: 'Server error retrieving audit logs' });
  }
};
