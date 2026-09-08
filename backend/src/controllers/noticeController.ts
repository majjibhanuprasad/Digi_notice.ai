import { Request, Response } from 'express';
import { Notice, Bookmark, Acknowledgement, Query, AuditLog, User, INotice } from '../models/Schemas';

// Get active notices for a student (personalized)
export const getStudentNotices = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  try {
    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const now = new Date();
    // Query published notices
    const allPublished = await Notice.find({ status: 'Published' });

    // Filter notices based on academic year and department personalization
    const personalized = allPublished.filter((notice: INotice) => {
      // Audience filter: if targetAudience is specified, it must be STUDENTS.
      // Missing targetAudience defaults to STUDENTS.
      if (notice.targetAudience && notice.targetAudience !== 'STUDENTS') return false;

      // 1. Expiry filter
      if (new Date(notice.expiresAt) < now) return false;
      const publishLimit = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes clock skew buffer
      if (new Date(notice.publishAt) > publishLimit) return false;

      // 2. Department filter (if notice has a dept, student must match or notice dept is empty/null)
      const matchesDept = !notice.department || notice.department === student.department || notice.department === 'All';

      // 3. Academic Year filter
      const matchesYear = !notice.academicYears || 
                          notice.academicYears.length === 0 || 
                          notice.academicYears.includes(student.academicYear || '') ||
                          notice.academicYears.includes('All') ||
                          notice.academicYears.includes('All Students');

      // 4. Target Groups filter (matches clubs or general)
      const matchesClubs = !notice.targetGroups || 
                           notice.targetGroups.length === 0 ||
                           notice.targetGroups.some(group => student.clubs?.includes(group)) ||
                           notice.targetGroups.includes('All');

      return matchesDept && (matchesYear || matchesClubs);
    });

    // Increment views for returned notices (mock simulation of view incrementing)
    for (const notice of personalized) {
      if (notice._id) {
        await Notice.findByIdAndUpdate(notice._id, { views: (notice.views || 0) + 1 });
      }
    }

    // Include bookmark status
    const bookmarks = await Bookmark.find({ userId });
    const bookmarkedIds = bookmarks.map(b => b.noticeId);

    // Include acknowledgement status
    const acknowledgements = await Acknowledgement.find({ userId });
    const acknowledgedIds = acknowledgements.map(a => a.noticeId);

    const noticesWithStatus = personalized.map(n => ({
      ...n,
      isBookmarked: bookmarkedIds.includes(n._id || ''),
      isAcknowledged: acknowledgedIds.includes(n._id || '')
    }));

    return res.json(noticesWithStatus);
  } catch (err: any) {
    console.error('Error fetching student notices:', err);
    return res.status(500).json({ message: 'Server error retrieving notices' });
  }
};

// Get all notices (for admin/super-admin list)
export const getAdminNotices = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const userRole = (req as any).user?.role;
  const userDept = (req as any).user?.department;

  try {
    let notices = await Notice.find({});
    // Department admins can only view:
    // 1. Notices they or their department created
    // 2. Published notices targeted at FACULTY where department matches or is null
    if (userRole === 'DEPARTMENT_ADMIN') {
      notices = notices.filter(n => {
        const isCreator = n.createdByDepartment === userDept || n.createdBy === userId;
        const isFacultyNotice = n.targetAudience === 'FACULTY' && 
                                n.status === 'Published' && 
                                (!n.department || n.department === userDept);
        return isCreator || isFacultyNotice;
      });
    }
    return res.json(notices);
  } catch (err: any) {
    return res.status(500).json({ message: 'Server error retrieving admin notices' });
  }
};

// Get public notices for display/kiosk mode (only published active notices)
export const getKioskNotices = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const published = await Notice.find({ status: 'Published' });
    const active = published.filter(notice => {
      if (notice.targetAudience && notice.targetAudience !== 'STUDENTS') return false;
      const publishLimit = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes clock skew buffer
      return new Date(notice.expiresAt) >= now && new Date(notice.publishAt) <= publishLimit;
    });

    // Sort active notices: CRITICAL first, then HIGH, then NORMAL
    active.sort((a, b) => {
      const priorityMap: Record<string, number> = { CRITICAL: 3, HIGH: 2, NORMAL: 1 };
      const priorityA = priorityMap[a.priority] || 1;
      const priorityB = priorityMap[b.priority] || 1;
      if (priorityA !== priorityB) {
        return priorityB - priorityA; // Descending priority
      }
      // Or secondary sort by date published descending
      return new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime();
    });

    return res.json(active);
  } catch (err: any) {
    return res.status(500).json({ message: 'Server error fetching kiosk notices' });
  }
};

// Get a notice by ID
export const getNoticeById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;

  try {
    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Retrieve bookmarks and acknowledgements if user is student
    let isBookmarked = false;
    let isAcknowledged = false;
    if (userId) {
      const bookmark = await Bookmark.findOne({ userId, noticeId: id });
      isBookmarked = !!bookmark;
      const ack = await Acknowledgement.findOne({ userId, noticeId: id });
      isAcknowledged = !!ack;
    }

    // Increment view counter
    await Notice.findByIdAndUpdate(id, { views: (notice.views || 0) + 1 });

    // Fetch associated Q&A
    const queries = await Query.find({ noticeId: id });

    return res.json({
      ...notice,
      isBookmarked,
      isAcknowledged,
      queries
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Server error retrieving notice details' });
  }
};

// Create a notice
export const createNotice = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const userRole = (req as any).user?.role;
  const userDept = (req as any).user?.department;

  const noticeData = req.body;

  try {
    const creator = await User.findById(userId);
    if (!creator) {
      return res.status(404).json({ message: 'Creator profile not found' });
    }

    // Department admins cannot publish directly - they create as "Submitted" or "Draft"
    // Super admins can publish directly (Approved/Published)
    let initialStatus = 'Draft';
    if (noticeData.submit) {
      initialStatus = userRole === 'SUPER_ADMIN' ? 'Published' : 'Submitted';
    }

    const newNotice = await Notice.create({
      ...noticeData,
      createdBy: userId,
      createdByName: creator.name,
      createdByDepartment: creator.department || 'Admin',
      status: noticeData.status || initialStatus,
      views: 0,
      acknowledgements: 0
    });

    // Write audit log
    await AuditLog.create({
      userId,
      userName: creator.name,
      userRole,
      action: newNotice.priority === 'CRITICAL' ? 'Emergency broadcast created' : `Notice created (status: ${newNotice.status})`,
      noticeId: newNotice._id,
      noticeTitle: newNotice.title,
      timestamp: new Date()
    });

    return res.status(201).json(newNotice);
  } catch (err: any) {
    console.error('Error creating notice:', err);
    return res.status(500).json({ message: 'Server error creating notice' });
  }
};

// Update notice
export const updateNotice = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;
  const userRole = (req as any).user?.role;
  const updateData = req.body;

  try {
    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Role checks: Dept admins can only update their own notices
    if (userRole === 'DEPARTMENT_ADMIN' && notice.createdBy !== userId) {
      return res.status(403).json({ message: 'Access denied: Cannot update notice created by other users' });
    }

    const updated = await Notice.findByIdAndUpdate(id, updateData, { new: true });
    
    const user = await User.findById(userId);
    await AuditLog.create({
      userId,
      userName: user?.name || 'Admin',
      userRole,
      action: 'Notice edited',
      noticeId: id,
      noticeTitle: updated?.title || '',
      timestamp: new Date()
    });

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ message: 'Server error updating notice' });
  }
};

// Delete notice
export const deleteNotice = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;
  const userRole = (req as any).user?.role;

  try {
    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    if (userRole === 'DEPARTMENT_ADMIN' && notice.createdBy !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Notice.findByIdAndDelete(id);

    const user = await User.findById(userId);
    await AuditLog.create({
      userId,
      userName: user?.name || 'Admin',
      userRole,
      action: 'Notice deleted',
      noticeId: id,
      noticeTitle: notice.title,
      timestamp: new Date()
    });

    return res.json({ message: 'Notice deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Server error deleting notice' });
  }
};

// Submit notice for approval (Dept Admin action)
export const submitNotice = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;

  try {
    const notice = await Notice.findById(id);
    if (!notice) return res.status(404).json({ message: 'Notice not found' });

    const updated = await Notice.findByIdAndUpdate(id, { status: 'Submitted' }, { new: true });
    
    const user = await User.findById(userId);
    await AuditLog.create({
      userId,
      userName: user?.name || 'Admin',
      userRole: user?.role || 'DEPARTMENT_ADMIN',
      action: 'Notice submitted',
      noticeId: id,
      noticeTitle: notice.title,
      timestamp: new Date()
    });

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: 'Server error submitting notice' });
  }
};

// Approve notice (Super Admin action)
export const approveNotice = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;

  try {
    const notice = await Notice.findById(id);
    if (!notice) return res.status(404).json({ message: 'Notice not found' });

    // Determine status: if publishAt date is in future, it's Scheduled, else Published
    const now = new Date();
    const isFuture = new Date(notice.publishAt) > now;
    const finalStatus = isFuture ? 'Scheduled' : 'Published';

    const updated = await Notice.findByIdAndUpdate(id, { 
      status: finalStatus,
      rejectionReason: undefined
    }, { new: true });

    const user = await User.findById(userId);
    await AuditLog.create({
      userId,
      userName: user?.name || 'Admin',
      userRole: 'SUPER_ADMIN',
      action: isFuture ? 'Notice scheduled' : 'Notice approved & published',
      noticeId: id,
      noticeTitle: notice.title,
      timestamp: new Date()
    });

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: 'Server error approving notice' });
  }
};

// Reject notice (Super Admin action)
export const rejectNotice = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const userId = (req as any).user?.id;

  try {
    const notice = await Notice.findById(id);
    if (!notice) return res.status(404).json({ message: 'Notice not found' });

    const updated = await Notice.findByIdAndUpdate(id, { 
      status: 'Rejected',
      rejectionReason: reason || 'Does not comply with standards'
    }, { new: true });

    const user = await User.findById(userId);
    await AuditLog.create({
      userId,
      userName: user?.name || 'Admin',
      userRole: 'SUPER_ADMIN',
      action: 'Notice rejected',
      noticeId: id,
      noticeTitle: notice.title,
      timestamp: new Date()
    });

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: 'Server error rejecting notice' });
  }
};

// Publish notice immediately
export const publishNotice = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;

  try {
    const notice = await Notice.findById(id);
    if (!notice) return res.status(404).json({ message: 'Notice not found' });

    const updated = await Notice.findByIdAndUpdate(id, { status: 'Published', publishAt: new Date() }, { new: true });

    const user = await User.findById(userId);
    await AuditLog.create({
      userId,
      userName: user?.name || 'Admin',
      userRole: user?.role || 'SUPER_ADMIN',
      action: 'Notice published',
      noticeId: id,
      noticeTitle: notice.title,
      timestamp: new Date()
    });

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: 'Server error publishing notice' });
  }
};

// Acknowledge critical/high-priority notices (Student action)
export const acknowledgeNotice = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;

  try {
    const notice = await Notice.findById(id);
    if (!notice) return res.status(404).json({ message: 'Notice not found' });

    // Check if already acknowledged
    const existing = await Acknowledgement.findOne({ userId, noticeId: id });
    if (existing) {
      return res.json({ message: 'Already acknowledged' });
    }

    // Record acknowledgement
    await Acknowledgement.create({
      userId,
      noticeId: id,
      timestamp: new Date()
    });

    // Increment count
    const updated = await Notice.findByIdAndUpdate(id, { 
      acknowledgements: (notice.acknowledgements || 0) + 1 
    }, { new: true });

    return res.json({ message: 'Notice acknowledged successfully', notice: updated });
  } catch (err) {
    return res.status(500).json({ message: 'Server error acknowledging notice' });
  }
};

// Bookmark a notice (Student action)
export const bookmarkNotice = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;

  try {
    const existing = await Bookmark.findOne({ userId, noticeId: id });
    if (existing) {
      await Bookmark.findByIdAndDelete(existing._id || '');
      return res.json({ bookmarked: false, message: 'Bookmark removed' });
    }

    await Bookmark.create({ userId, noticeId: id });
    return res.json({ bookmarked: true, message: 'Notice bookmarked' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error bookmarking notice' });
  }
};

// Search notices (Advanced search)
export const searchNotices = async (req: Request, res: Response) => {
  const { q = '', category, department, priority, academicYear } = req.query;
  const userId = (req as any).user?.id;

  try {
    const allNotices = await Notice.find({ status: 'Published' });
    const notices = allNotices.filter(n => !n.targetAudience || n.targetAudience === 'STUDENTS');
    const student = await User.findById(userId);

    const queryStr = (q as string).toLowerCase().trim();

    // Natural Language Criteria parsing
    let parsedCategory = category as string;
    let parsedDepartment = department as string;
    let parsedYear = academicYear as string;
    let parsedPriority = priority as string;

    if (queryStr) {
      // Natural language mapping
      if (queryStr.includes('placement') || queryStr.includes('job') || queryStr.includes('recruit')) {
        parsedCategory = 'Placements';
      } else if (queryStr.includes('exam') || queryStr.includes('timetable') || queryStr.includes('midterm')) {
        parsedCategory = 'Exams';
      } else if (queryStr.includes('sport') || queryStr.includes('cricket') || queryStr.includes('match') || queryStr.includes('sports')) {
        parsedCategory = 'Sports';
      } else if (queryStr.includes('workshop') || queryStr.includes('seminar')) {
        parsedCategory = 'Workshops';
      } else if (queryStr.includes('holiday') || queryStr.includes('weather') || queryStr.includes('cyclone') || queryStr.includes('emergency')) {
        parsedCategory = 'Emergency';
      }

      // Department parsing from query
      if (queryStr.includes('cse') || queryStr.includes('computer science')) {
        parsedDepartment = 'CSE';
      } else if (queryStr.includes('ece') || queryStr.includes('electronics')) {
        parsedDepartment = 'ECE';
      } else if (queryStr.includes('eee') || queryStr.includes('electrical')) {
        parsedDepartment = 'EEE';
      } else if (queryStr.includes('mechanical') || queryStr.includes('mech')) {
        parsedDepartment = 'Mechanical';
      } else if (queryStr.includes('civil')) {
        parsedDepartment = 'Civil';
      }

      // Year parsing from query
      if (queryStr.includes('1st year') || queryStr.includes('first year')) {
        parsedYear = '1st Year';
      } else if (queryStr.includes('2nd year') || queryStr.includes('second year')) {
        parsedYear = '2nd Year';
      } else if (queryStr.includes('3rd year') || queryStr.includes('third year')) {
        parsedYear = '3rd Year';
      } else if (queryStr.includes('4th year') || queryStr.includes('final year') || queryStr.includes('fourth year')) {
        parsedYear = '4th Year';
      }
    }

    // Apply filtering
    let filtered = notices.filter(n => {
      // General keywords match if query has characters
      if (queryStr) {
        const titleMatch = n.title.toLowerCase().includes(queryStr);
        const contentMatch = n.content.toLowerCase().includes(queryStr);
        const summaryMatch = n.summary.toLowerCase().includes(queryStr);
        const matchesKeywords = titleMatch || contentMatch || summaryMatch;
        if (!matchesKeywords && !parsedCategory && !parsedDepartment && !parsedYear) {
          return false;
        }
      }

      if (parsedCategory && n.category !== parsedCategory) return false;
      if (parsedDepartment && n.department && n.department !== 'All' && n.department !== parsedDepartment) return false;
      if (parsedPriority && n.priority !== parsedPriority) return false;
      if (parsedYear && n.academicYears && n.academicYears.length > 0 && !n.academicYears.includes(parsedYear) && !n.academicYears.includes('All')) return false;

      return true;
    });

    // Add bookmark & acknowledgement states
    const bookmarks = await Bookmark.find({ userId });
    const bookmarkedIds = bookmarks.map(b => b.noticeId);

    const acknowledgements = await Acknowledgement.find({ userId });
    const acknowledgedIds = acknowledgements.map(a => a.noticeId);

    const result = filtered.map(n => ({
      ...n,
      isBookmarked: bookmarkedIds.includes(n._id || ''),
      isAcknowledged: acknowledgedIds.includes(n._id || '')
    }));

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: 'Server error running search query' });
  }
};

// Create a question on a notice (Student Q&A thread)
export const postQuestion = async (req: Request, res: Response) => {
  const { noticeId } = req.params;
  const { question } = req.body;
  const userId = (req as any).user?.id;

  try {
    const student = await User.findById(userId);
    const notice = await Notice.findById(noticeId);
    if (!student || !notice) {
      return res.status(404).json({ message: 'Notice or student profile not found' });
    }

    const newQuery = await Query.create({
      noticeId,
      noticeTitle: notice.title,
      studentId: userId,
      studentName: student.name,
      question,
      timestamp: new Date(),
      status: 'Open'
    });

    return res.status(201).json(newQuery);
  } catch (err) {
    return res.status(500).json({ message: 'Server error posting question' });
  }
};

// Answer a question on a notice (Admin Q&A response)
export const postAnswer = async (req: Request, res: Response) => {
  const { queryId } = req.params;
  const { answer } = req.body;
  const userId = (req as any).user?.id;

  try {
    const admin = await User.findById(userId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin profile not found' });
    }

    const updatedQuery = await Query.findByIdAndUpdate(queryId, {
      answer,
      answeredBy: userId,
      answeredByName: admin.name,
      answeredAt: new Date(),
      status: 'Answered'
    }, { new: true });

    if (!updatedQuery) {
      return res.status(404).json({ message: 'Question not found' });
    }

    return res.json(updatedQuery);
  } catch (err) {
    return res.status(500).json({ message: 'Server error responding to question' });
  }
};

// Retrieve all notice queries for Admin/HOD
export const getQueriesForAdmin = async (req: Request, res: Response) => {
  const userRole = (req as any).user?.role;
  const userDept = (req as any).user?.department;

  try {
    let queries = await Query.find({});
    // Department admins can only view questions for notices belonging to their department
    if (userRole === 'DEPARTMENT_ADMIN') {
      const notices = await Notice.find({ department: userDept });
      const noticeIds = notices.map(n => (n._id || '').toString()).filter(Boolean);
      queries = queries.filter(q => noticeIds.includes(q.noticeId.toString()));
    }
    return res.json(queries);
  } catch (err: any) {
    return res.status(500).json({ message: 'Server error retrieving admin queries' });
  }
};
