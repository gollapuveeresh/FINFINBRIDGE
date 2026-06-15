import Notification from '../models/Notification.js';

// @desc    Get all notifications for logged-in user (scoped by role)
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const userModel = req.user.role === 'consultant' ? 'Consultant' : req.user.role === 'admin' || req.user.role === 'department-admin' ? 'Admin' : 'Client';
    const notifications = await Notification.find({
      $or: [
        { recipientId: req.user._id, recipientModel: userModel },
        { userId: req.user._id, userModel }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while fetching notifications'
    });
  }
};

// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userModel = req.user.role === 'consultant' ? 'Consultant' : req.user.role === 'admin' || req.user.role === 'department-admin' ? 'Admin' : 'Client';
    
    const notification = await Notification.findOneAndUpdate(
      { _id: id, $or: [{ recipientId: req.user._id }, { userId: req.user._id }] },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found or access denied.'
      });
    }

    res.status(200).json({
      status: 'success',
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while marking notification as read'
    });
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
  try {
    const userModel = req.user.role === 'consultant' ? 'Consultant' : req.user.role === 'admin' || req.user.role === 'department-admin' ? 'Admin' : 'Client';
    
    await Notification.updateMany(
      { $or: [{ recipientId: req.user._id }, { userId: req.user._id }], isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while marking all notifications as read'
    });
  }
};
